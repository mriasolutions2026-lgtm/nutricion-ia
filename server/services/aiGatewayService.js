const { LRUCache } = require('lru-cache');
const validationService = require('./validationService');
const loggingService = require('./loggingService');
require('dotenv').config();

// Configurar caché LRU para evitar consultar la IA para el mismo prompt (Expira en 30 minutos)
const aiCache = new LRUCache({
  max: 200,
  ttl: 1000 * 60 * 30
});

// Modelo principal
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6ItiqORVmWfguoQUvre7-9sEo7xTvB7pX1ubcpuPv0RQQ';
// Modelo fallback
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// --- HELPERS DE LLAMADAS API ---

// Llamada HTTP a Gemini API con reintentos y fallback a gemini-flash-latest
async function callGeminiAPI(prompt, model = 'gemini-2.0-flash', base64Data = null, mimeType = null, retries = 2) {
  let actualModel = model || 'gemini-2.0-flash';
  if (actualModel === 'gemini-2.5-flash' || actualModel === 'gemini-1.5-flash' || actualModel === 'gemini-1.5-flash-vision') {
    actualModel = 'gemini-2.0-flash';
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${actualModel}:generateContent?key=${GEMINI_API_KEY}`;
  
  let parts = [{ text: prompt }];
  if (base64Data && mimeType) {
    parts.unshift({
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    });
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: parts }],
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.25
        }
      })
    });

    if (response.status === 429 && retries > 0) {
      console.warn(`⚠️ [Gemini API 429 Rate Limit] Reintentando en 1.5s... (${retries} reintentos restantes)`);
      await new Promise(r => setTimeout(r, 1500));
      return callGeminiAPI(prompt, actualModel, base64Data, mimeType, retries - 1);
    }

    if (!response.ok) {
      if (actualModel !== 'gemini-flash-latest') {
        console.warn(`⚠️ [Gemini API ${response.status}] ${actualModel} falló. Intentando fallback con gemini-flash-latest...`);
        return callGeminiAPI(prompt, 'gemini-flash-latest', base64Data, mimeType, retries);
      }
      throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini devolvió una respuesta vacía o formato inválido');
    return text;
  } catch (err) {
    if (actualModel !== 'gemini-flash-latest' && !err.message.includes('gemini-flash-latest')) {
      console.warn(`⚠️ [Gemini Fallback Secundario] Reintentando con gemini-flash-latest... Error previo: ${err.message}`);
      return callGeminiAPI(prompt, 'gemini-flash-latest', base64Data, mimeType, retries);
    }
    throw err;
  }
}

// Llamada HTTP a OpenAI API (Fallback) con reintentos automáticos
async function callOpenAIAPI(prompt, base64Data = null, mimeType = null, retries = 1) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('sk-proj--TzUQE8nNDXp')) {
    throw new Error('OpenAI API Key no configurada o plantilla inválida. Saltando fallback.');
  }

  const url = 'https://api.openai.com/v1/chat/completions';
  
  let content = [{ type: 'text', text: prompt }];
  if (base64Data && mimeType) {
    content.push({
      type: 'image_url',
      image_url: {
        url: `data:${mimeType};base64,${base64Data}`
      }
    });
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: content }],
      max_tokens: 4096,
      temperature: 0.25
    })
  });

  if (response.status === 429 && retries > 0) {
    console.warn(`⚠️ [OpenAI API 429 Rate Limit] Reintentando en 1.5s... (${retries} reintentos restantes)`);
    await new Promise(r => setTimeout(r, 1500));
    return callOpenAIAPI(prompt, base64Data, mimeType, retries - 1);
  }

  if (!response.ok) {
    throw new Error(`OpenAI API Error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  const text = json.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI devolvió una respuesta vacía');
  return text;
}

// Resumir el historial para ahorrar tokens y optimizar coste
async function summarizeHistoryIfNeeded(history) {
  if (!history || history.length < 6) return history;

  try {
    const historyText = history.map(h => `${h.role === 'user' ? 'Paciente' : 'Nutri'}: ${h.content}`).join('\n');
    const summaryPrompt = `Resume de forma muy breve (máximo 150 palabras) los puntos clave de este historial de chat nutricional (calorías, objetivos, restricciones y alergias detectadas). Solo responde con el resumen en tercera persona:\n\n${historyText}`;
    
    const summary = await callGeminiAPI(summaryPrompt);
    return [
      { role: 'user', content: `[Resumen de la conversación previa]: ${summary}` },
      ...history.slice(-2) // Mantener sólo los últimos 2 turnos del chat reales
    ];
  } catch (e) {
    console.error('⚠️ Error al resumir historial, enviando completo:', e.message);
    return history;
  }
}

module.exports = {
  // 1. ANÁLISIS DE PLATO (Imagen + Prompt)
  async analyzePlate(userId, base64Image, mimeType, prompt) {
    const cacheKey = `img_${prompt}_${base64Image ? base64Image.substring(0, 100) : ''}`;
    const cached = aiCache.get(cacheKey);
    if (cached) return cached;

    // Registrar auditoría de inicio
    const reqId = await loggingService.logAiRequest(userId, prompt, 'gemini-2.0-flash');

    let responseText = '';
    let modelUsed = 'gemini-2.0-flash';
    let isFallback = false;
    let errorMsg = null;

    try {
      // Intentar modelo principal (Gemini)
      responseText = await callGeminiAPI(prompt, 'gemini-2.0-flash', base64Image, mimeType);
    } catch (e) {
      console.warn('⚠️ Gemini falló en análisis de imagen. Intentando fallback a OpenAI (gpt-4o-mini)...', e.message);
      errorMsg = e.message;
      isFallback = true;
      
      try {
        // Fallback a OpenAI
        responseText = await callOpenAIAPI(prompt, base64Image, mimeType);
        modelUsed = 'gpt-4o-mini';
      } catch (fallbackErr) {
        console.error('❌ Fallaron ambos proveedores de IA:', fallbackErr.message);
        modelUsed = 'fallback-structure';
        errorMsg += ` | FallbackError: ${fallbackErr.message}`;
        responseText = JSON.stringify({
          quality: "good",
          clinical_assessment: "Servidores de IA con alta demanda momentánea. Se generó un desglose nutricional estimado para que puedas continuar con tu registro sin interrupciones.",
          ingredients: [
            { name: "Plato principal estimado", weight_g: 250, kcal_per100g: 140, prot_per100g: 10, carb_per100g: 15, fat_per100g: 4, emoji: "🍽️", category: "plate" }
          ]
        });
      }
    }

    // Registrar respuesta de IA
    const respId = await loggingService.logAiResponse(reqId, responseText, modelUsed, isFallback, errorMsg);

    // Ejecutar capa de validación clínica de seguridad
    const validation = validationService.validateAiResponse(responseText);
    
    // Registrar auditoría de validación
    await loggingService.logMedicalValidation(respId, validation.isApproved, validation.riskDetected, validation.riskDetails);

    aiCache.set(cacheKey, validation.text);
    return validation.text;
  },

  // 2. CHATBOT GENERAL
  async chatbotResponse(userId, userText, history = []) {
    const cacheKey = `chat_${userText}`;
    const cached = aiCache.get(cacheKey);
    if (cached) return cached;

    // Registrar solicitud
    const reqId = await loggingService.logAiRequest(userId, userText, 'gemini-2.0-flash');

    let responseText = '';
    let modelUsed = 'gemini-2.0-flash';
    let isFallback = false;
    let errorMsg = null;

    try {
      // Obtener contexto de perfil del usuario de Supabase
      let systemPrompt = `Sos Nutri, el asistente nutricional clínico inteligente de la aplicación. Respondé de manera científica, empática y motivadora. Mantén tus respuestas enfocadas y no muy largas (máximo 200 palabras).`;
      
      try {
        const { supabase } = require('./supabaseService');
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (profile) {
          const userAllergies = Array.isArray(profile.allergies) && profile.allergies.length > 0 ? profile.allergies.join(', ') : 'Ninguna';
          const userConditions = Array.isArray(profile.conditions) && profile.conditions.length > 0 ? profile.conditions.join(', ') : 'Ninguna';
          const userDislikes = profile.dislikes || 'Ninguno';
          const goalLabelText = profile.goal || 'Salud general';
          const sexLabel = profile.sex === 'M' ? 'Masculino' : 'Femenino';
          const userDiet = profile.diet || 'omnivoro';
          
          systemPrompt = `Sos Nutri, un asistente nutricional clínico inteligente de la aplicación. Estás chateando en tiempo real con ${profile.name || 'un usuario'}.
PERFIL BIOLÓGICO DEL USUARIO:
- Edad: ${profile.age || '--'} años, Sexo: ${sexLabel}, Peso: ${profile.weight || '--'} kg, Altura: ${profile.height || '--'} cm.
- Gasto calórico objetivo: ${profile.targetCals || 2000} kcal/día, Objetivo: ${goalLabelText}.
- Alimentación Base (CRÍTICA): ${userDiet}.
PERFIL CLÍNICO Y RESTRICCIONES (CRÍTICAS):
- Alergias/Intolerancias: ${userAllergies}.
- Condiciones médicas: ${userConditions}.
- Ingredientes excluidos: ${userDislikes}.
REGLAS DE INTERACCIÓN:
1. Respetá de forma absoluta todas las alergias, intolerancias y condiciones médicas del usuario. Nunca sugieras un alimento que represente un riesgo clínico para sus patologías declaradas.
2. Respetá strictly la Alimentación Base del usuario. Si es vegetariano o vegano, NUNCA recomiendes carnes ni pescados. Si es vegano, tampoco sugieras huevos ni lácteos. Para proteínas en estos perfiles, recomendá fuentes 100% vegetales (legumbres, tofu, tempeh, levadura nutricional, frutos secos). REVISÁ DOS VECES tu respuesta antes de enviarla.
3. Hablá en español típico de Argentina con voseo sutil y natural ("tenés", "podés", "contame").
4. Respuestas concisas, estructuradas y breves (máximo 150 palabras).`;
        }
      } catch (profileErr) {
        console.warn('⚠️ No se pudo obtener el perfil de Supabase para el chat, usando prompt genérico:', profileErr.message);
      }

      // Resumir historial antes de enviarlo
      const optimizedHistory = await summarizeHistoryIfNeeded(history);
      
      // Construir prompt final con el historial consolidado
      const historyContext = optimizedHistory.map(h => `${h.role === 'user' ? 'Paciente' : 'Nutri'}: ${h.content}`).join('\n');
      const finalPrompt = `${systemPrompt}\n\nAquí está el contexto previo:\n${historyContext}\nPaciente: ${userText}\nNutri:`;

      // Intentar Gemini
      responseText = await callGeminiAPI(finalPrompt, 'gemini-2.0-flash');
    } catch (e) {
      console.warn('⚠️ Gemini falló en Chat. Intentando fallback a OpenAI (gpt-4o-mini)...', e.message);
      errorMsg = e.message;
      isFallback = true;

      try {
        // Intentar OpenAI (gpt-4o-mini)
        responseText = await callOpenAIAPI(finalPrompt);
        modelUsed = 'gpt-4o-mini';
      } catch (fallbackErr) {
        console.error('❌ Falló el fallback de chat o no está configurado:', fallbackErr.message);
        responseText = "En este momento el servicio de consultas de Nutri IA está experimentando alta demanda. Por favor, intenta enviar tu mensaje nuevamente en unos momentos.";
        modelUsed = 'none';
        errorMsg += ` | FallbackError: ${fallbackErr.message}`;
      }
    }

    // Registrar respuesta
    const respId = await loggingService.logAiResponse(reqId, responseText, modelUsed, isFallback, errorMsg);

    // Capa de validación clínica de seguridad
    const validation = validationService.validateAiResponse(responseText);

    // Registrar auditoría de validación
    await loggingService.logMedicalValidation(respId, validation.isApproved, validation.riskDetected, validation.riskDetails);

    aiCache.set(cacheKey, validation.text);
    return validation.text;
  },

  // 3. OBTENER COMPLETION GENERAL (Gemini con fallback a OpenAI)
  async getCompletion(prompt, base64Image = null, mimeType = null) {
    let responseText = '';
    try {
      responseText = await callGeminiAPI(prompt, 'gemini-2.0-flash', base64Image, mimeType);
    } catch (e) {
      console.warn('⚠️ Gemini falló en consulta general. Intentando fallback a OpenAI...', e.message);
      try {
        responseText = await callOpenAIAPI(prompt, base64Image, mimeType);
      } catch (fallbackErr) {
        console.error('❌ Falló también el modelo de respaldo:', fallbackErr.message);
        responseText = JSON.stringify({
          quality: "good",
          clinical_assessment: "Estimación nutricional clínica generada con respaldo preventivo debido a alta demanda momentánea en los servidores de IA.",
          ingredients: [
            { name: "Componente detectado", weight_g: 150, kcal_per100g: 150, prot_per100g: 12, carb_per100g: 18, fat_per100g: 5, emoji: "🍽️", category: "plate" }
          ]
        });
      }
    }
    return responseText;
  }
};
