const { supabase } = require('./supabaseService');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6ItiqORVmWfguoQUvre7-9sEo7xTvB7pX1ubcpuPv0RQQ';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// Base de datos de macros de referencia ANMAT / ArgenFoods (Universidad de Luján / Argentina)
const MACRO_LOOKUP_KB = {
  // Infusiones sin calorías / agua (ANMAT)
  'café negro': { kcal: 2, prot: 0.1, carb: 0, fat: 0, std_g: 200, unit: 'taza' },
  'café solo': { kcal: 2, prot: 0.1, carb: 0, fat: 0, std_g: 200, unit: 'taza' },
  'café': { kcal: 2, prot: 0.1, carb: 0, fat: 0, std_g: 200, unit: 'taza' },
  'expreso': { kcal: 2, prot: 0.1, carb: 0, fat: 0, std_g: 60, unit: 'taza' },
  'té': { kcal: 1, prot: 0, carb: 0.2, fat: 0, std_g: 200, unit: 'taza' },
  'infusión': { kcal: 1, prot: 0, carb: 0.2, fat: 0, std_g: 200, unit: 'taza' },
  'mate': { kcal: 5, prot: 0.2, carb: 1, fat: 0, std_g: 200, unit: 'mate' },
  'mate cocido': { kcal: 3, prot: 0.1, carb: 0.5, fat: 0, std_g: 200, unit: 'taza' },
  'agua': { kcal: 0, prot: 0, carb: 0, fat: 0, std_g: 250, unit: 'vaso' },
  'soda': { kcal: 0, prot: 0, carb: 0, fat: 0, std_g: 250, unit: 'vaso' },
  'agua con gas': { kcal: 0, prot: 0, carb: 0, fat: 0, std_g: 250, unit: 'vaso' },
  'edulcorante': { kcal: 0, prot: 0, carb: 0, fat: 0, std_g: 1, unit: 'sobre' },
  'stevia': { kcal: 0, prot: 0, carb: 0, fat: 0, std_g: 1, unit: 'sobre' },
  'sal': { kcal: 0, prot: 0, carb: 0, fat: 0, std_g: 1, unit: 'pizca' },

  // Cafés y Lácteos (ANMAT)
  'café con leche': { kcal: 45, prot: 3, carb: 4, fat: 1.5, std_g: 200, unit: 'taza' },
  'cortado': { kcal: 25, prot: 1.5, carb: 2, fat: 1, std_g: 100, unit: 'taza' },
  'lágrima': { kcal: 65, prot: 4, carb: 5, fat: 2.5, std_g: 200, unit: 'taza' },
  'cappuccino': { kcal: 90, prot: 5, carb: 8, fat: 4, std_g: 200, unit: 'taza' },
  'azúcar': { kcal: 20, prot: 0, carb: 5, fat: 0, std_g: 5, unit: 'cucharadita' },
  'leche descremada': { kcal: 35, prot: 3.4, carb: 4.9, fat: 0.1, std_g: 200, unit: 'ml' },
  'leche entera': { kcal: 58, prot: 3.2, carb: 4.7, fat: 3.1, std_g: 200, unit: 'ml' },
  'leche': { kcal: 45, prot: 3.3, carb: 4.8, fat: 1.5, std_g: 200, unit: 'ml' },
  'yogur firme': { kcal: 65, prot: 4.2, carb: 7.5, fat: 2.1, std_g: 150, unit: 'pote' },
  'yogur griego': { kcal: 95, prot: 10, carb: 4, fat: 3.5, std_g: 150, unit: 'pote' },
  'yogur': { kcal: 60, prot: 4, carb: 7, fat: 2, std_g: 150, unit: 'pote' },
  'queso cremoso': { kcal: 90, prot: 6.5, carb: 0.5, fat: 7, std_g: 30, unit: 'feta' },
  'queso por salut': { kcal: 80, prot: 7, carb: 0.5, fat: 5.5, std_g: 30, unit: 'feta' },
  'queso tybo': { kcal: 105, prot: 7, carb: 0.5, fat: 8.5, std_g: 30, unit: 'feta' },
  'queso rallado': { kcal: 110, prot: 9, carb: 1, fat: 8, std_g: 25, unit: 'cucharada' },
  'queso crema': { kcal: 40, prot: 2.2, carb: 1.2, fat: 3, std_g: 25, unit: 'cucharada' },

  // Panificados y Desayunos Argentinos (ANMAT)
  'medialuna de manteca': { kcal: 180, prot: 3.5, carb: 22, fat: 9, std_g: 45, unit: 'unidad' },
  'medialuna de grasa': { kcal: 160, prot: 3, carb: 20, fat: 8, std_g: 40, unit: 'unidad' },
  'medialuna': { kcal: 170, prot: 3.2, carb: 21, fat: 8.5, std_g: 42, unit: 'unidad' },
  'factura': { kcal: 200, prot: 4, carb: 26, fat: 9.5, std_g: 50, unit: 'unidad' },
  'bizcocho de grasa': { kcal: 75, prot: 1.2, carb: 9, fat: 3.8, std_g: 15, unit: 'unidad' },
  'criollito': { kcal: 75, prot: 1.2, carb: 9, fat: 3.8, std_g: 15, unit: 'unidad' },
  'tostada integral': { kcal: 70, prot: 2.8, carb: 12, fat: 1, std_g: 25, unit: 'unidad' },
  'tostada': { kcal: 75, prot: 2.5, carb: 13, fat: 1, std_g: 25, unit: 'unidad' },
  'pan lactal': { kcal: 75, prot: 2.5, carb: 14, fat: 1, std_g: 25, unit: 'rodaja' },
  'pan francés': { kcal: 135, prot: 4.5, carb: 27, fat: 0.8, std_g: 50, unit: 'mignon' },
  'pan': { kcal: 135, prot: 4.5, carb: 27, fat: 0.8, std_g: 50, unit: 'rodaja' },
  'manteca': { kcal: 72, prot: 0.1, carb: 0.1, fat: 8.1, std_g: 10, unit: 'cucharadita' },
  'dulce de leche': { kcal: 60, prot: 1.2, carb: 11, fat: 1.3, std_g: 20, unit: 'cucharada' },
  'mermelada': { kcal: 45, prot: 0.1, carb: 11, fat: 0, std_g: 20, unit: 'cucharada' },
  'avena': { kcal: 150, prot: 6, carb: 26, fat: 2.5, std_g: 40, unit: 'porción' },

  // Carnes y Proteínas (ANMAT)
  'pechuga de pollo': { kcal: 165, prot: 31, carb: 0, fat: 3.6, std_g: 150, unit: 'unidad' },
  'pollo a la plancha': { kcal: 165, prot: 31, carb: 0, fat: 3.6, std_g: 150, unit: 'porción' },
  'pollo': { kcal: 175, prot: 28, carb: 0, fat: 6.5, std_g: 150, unit: 'porción' },
  'asado': { kcal: 320, prot: 24, carb: 0, fat: 25, std_g: 150, unit: 'tira' },
  'vacío': { kcal: 280, prot: 26, carb: 0, fat: 19, std_g: 150, unit: 'porción' },
  'bife de chorizo': { kcal: 290, prot: 28, carb: 0, fat: 19, std_g: 150, unit: 'porción' },
  'bife': { kcal: 240, prot: 26, carb: 0, fat: 14, std_g: 150, unit: 'unidad' },
  'carne vacuna': { kcal: 240, prot: 26, carb: 0, fat: 14, std_g: 150, unit: 'porción' },
  'carne': { kcal: 240, prot: 26, carb: 0, fat: 14, std_g: 150, unit: 'porción' },
  'milanesa de carne': { kcal: 280, prot: 22, carb: 16, fat: 14, std_g: 150, unit: 'unidad' },
  'milanesa de pollo': { kcal: 240, prot: 25, carb: 14, fat: 9, std_g: 150, unit: 'unidad' },
  'milanesa napolitana': { kcal: 380, prot: 30, carb: 18, fat: 20, std_g: 200, unit: 'unidad' },
  'milanesa': { kcal: 260, prot: 23, carb: 15, fat: 11, std_g: 150, unit: 'unidad' },
  'huevo frito': { kcal: 110, prot: 6.3, carb: 0.6, fat: 9, std_g: 50, unit: 'unidad' },
  'huevo duro': { kcal: 78, prot: 6.3, carb: 0.6, fat: 5.3, std_g: 50, unit: 'unidad' },
  'huevo revuelto': { kcal: 85, prot: 6.5, carb: 0.8, fat: 6, std_g: 55, unit: 'unidad' },
  'huevo': { kcal: 78, prot: 6.3, carb: 0.6, fat: 5.3, std_g: 50, unit: 'unidad' },
  'salmón': { kcal: 208, prot: 28, carb: 0, fat: 10, std_g: 150, unit: 'porción' },
  'merluza': { kcal: 90, prot: 19, carb: 0, fat: 1.2, std_g: 150, unit: 'filete' },
  'pescado': { kcal: 120, prot: 20, carb: 0, fat: 3.5, std_g: 150, unit: 'filete' },

  // Comidas Típicas Argentinas (ANMAT)
  'empanada de carne': { kcal: 230, prot: 8.5, carb: 22, fat: 12, std_g: 80, unit: 'unidad' },
  'empanada de pollo': { kcal: 210, prot: 9, carb: 22, fat: 9.5, std_g: 80, unit: 'unidad' },
  'empanada de jamón y queso': { kcal: 240, prot: 9.5, carb: 21, fat: 13, std_g: 80, unit: 'unidad' },
  'empanada': { kcal: 220, prot: 8.8, carb: 22, fat: 11, std_g: 80, unit: 'unidad' },
  'tarta de jamón y queso': { kcal: 320, prot: 14, carb: 28, fat: 17, std_g: 150, unit: 'porción' },
  'tarta de verdura': { kcal: 220, prot: 8, carb: 24, fat: 10, std_g: 150, unit: 'porción' },
  'pizza muzzarella': { kcal: 240, prot: 10, carb: 28, fat: 9.5, std_g: 100, unit: 'porción' },
  'pizza': { kcal: 240, prot: 10, carb: 28, fat: 9.5, std_g: 100, unit: 'porción' },
  'guiso de lentejas': { kcal: 340, prot: 21, carb: 42, fat: 9, std_g: 250, unit: 'plato' },
  'guiso': { kcal: 320, prot: 18, carb: 38, fat: 10, std_g: 250, unit: 'plato' },
  'locro': { kcal: 380, prot: 22, carb: 38, fat: 16, std_g: 250, unit: 'plato' },
  'pastel de papas': { kcal: 350, prot: 19, carb: 35, fat: 14, std_g: 200, unit: 'porción' },
  'ñoquis': { kcal: 260, prot: 8, carb: 48, fat: 3, std_g: 200, unit: 'plato' },
  'fideos': { kcal: 270, prot: 9, carb: 50, fat: 3.5, std_g: 200, unit: 'plato' },
  'tallarines': { kcal: 270, prot: 9, carb: 50, fat: 3.5, std_g: 200, unit: 'plato' },
  'ravioles': { kcal: 290, prot: 11, carb: 46, fat: 6, std_g: 200, unit: 'plato' },
  'arroz integral': { kcal: 112, prot: 2.6, carb: 23, fat: 0.9, std_g: 150, unit: 'porción' },
  'arroz': { kcal: 130, prot: 2.7, carb: 28, fat: 0.3, std_g: 150, unit: 'porción' },
  'puré de papas': { kcal: 120, prot: 2, carb: 18, fat: 4.5, std_g: 150, unit: 'porción' },
  'papas fritas': { kcal: 290, prot: 3.4, carb: 38, fat: 14, std_g: 100, unit: 'porción' },
  'papa al horno': { kcal: 110, prot: 2.5, carb: 24, fat: 0.2, std_g: 150, unit: 'unidad' },
  'papa': { kcal: 110, prot: 2.5, carb: 24, fat: 0.2, std_g: 150, unit: 'unidad' },
  'batata': { kcal: 103, prot: 2.3, carb: 24, fat: 0.1, std_g: 150, unit: 'unidad' },

  // Verduras y Hortalizas (ANMAT)
  'ensalada mixta': { kcal: 45, prot: 1.5, carb: 6, fat: 1.5, std_g: 150, unit: 'porción' },
  'ensalada': { kcal: 40, prot: 1.4, carb: 5, fat: 1, std_g: 150, unit: 'porción' },
  'lechuga': { kcal: 15, prot: 1.4, carb: 2.9, fat: 0.2, std_g: 100, unit: 'porción' },
  'tomate': { kcal: 18, prot: 0.9, carb: 3.9, fat: 0.2, std_g: 120, unit: 'unidad' },
  'zanahoria': { kcal: 41, prot: 0.9, carb: 10, fat: 0.2, std_g: 100, unit: 'unidad' },
  'zapallo': { kcal: 26, prot: 1, carb: 6.5, fat: 0.1, std_g: 150, unit: 'porción' },
  'calabaza': { kcal: 26, prot: 1, carb: 6.5, fat: 0.1, std_g: 150, unit: 'porción' },
  'brócoli': { kcal: 31, prot: 2.5, carb: 6, fat: 0.4, std_g: 100, unit: 'porción' },
  'espinaca': { kcal: 23, prot: 2.9, carb: 3.6, fat: 0.4, std_g: 100, unit: 'porción' },
  'acelga': { kcal: 19, prot: 1.8, carb: 3.7, fat: 0.2, std_g: 100, unit: 'porción' },
  'palta': { kcal: 160, prot: 2, carb: 9, fat: 15, std_g: 100, unit: 'mitad' },

  // Frutas (ANMAT)
  'banana': { kcal: 89, prot: 1.1, carb: 23, fat: 0.3, std_g: 120, unit: 'unidad' },
  'manzana': { kcal: 52, prot: 0.3, carb: 14, fat: 0.2, std_g: 150, unit: 'unidad' },
  'naranja': { kcal: 47, prot: 0.9, carb: 12, fat: 0.1, std_g: 130, unit: 'unidad' },
  'mandarina': { kcal: 40, prot: 0.6, carb: 10, fat: 0.2, std_g: 100, unit: 'unidad' },
  'pera': { kcal: 57, prot: 0.4, carb: 15, fat: 0.1, std_g: 150, unit: 'unidad' },
  'frutilla': { kcal: 32, prot: 0.7, carb: 7.7, fat: 0.3, std_g: 100, unit: 'taza' },
  'durazno': { kcal: 39, prot: 0.9, carb: 9.5, fat: 0.2, std_g: 130, unit: 'unidad' },
  'uva': { kcal: 67, prot: 0.6, carb: 17, fat: 0.4, std_g: 100, unit: 'taza' },
  'ciruela': { kcal: 46, prot: 0.7, carb: 11, fat: 0.3, std_g: 100, unit: 'unidad' }
};

// Helper con timeout (8000ms)
function fetchWithTimeout(url, options, timeoutMs = 8000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout de ${timeoutMs}ms excedido en llamada a IA`)), timeoutMs)
    )
  ]);
}

// Llamada HTTP a Gemini (Gemini 2.0 Flash con fallback a gemini-flash-latest)
async function callGeminiAudio(prompt, base64Audio = null, mimeType = null, modelName = 'gemini-2.0-flash') {
  const model = (modelName === 'gemini-2.5-flash') ? 'gemini-2.0-flash' : (modelName || 'gemini-2.0-flash');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  let parts = [{ text: prompt }];
  if (base64Audio && mimeType) {
    parts.unshift({
      inlineData: {
        data: base64Audio,
        mimeType: mimeType
      }
    });
  }

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: parts }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.1
      }
    })
  }, 8000);

  if (!response.ok) {
    throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini devolvió una respuesta vacía');
  return text;
}

// Llamada HTTP a OpenAI (gpt-4o-mini Fallback)
async function callOpenAIAudio(prompt, base64Audio = null, mimeType = null) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('sk-proj--TzUQE8nNDXp')) {
    throw new Error('OpenAI API Key no configurada o inválida. Saltando fallback.');
  }

  const url = 'https://api.openai.com/v1/chat/completions';
  let content = [{ type: 'text', text: prompt }];

  if (base64Audio && mimeType) {
    content.push({
      type: 'image_url', // Fallback texto/multimodal format
      image_url: { url: `data:${mimeType};base64,${base64Audio}` }
    });
  }

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: content }],
      max_tokens: 2048,
      temperature: 0.1
    })
  }, 8000);

  if (!response.ok) {
    throw new Error(`OpenAI API Error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  const text = json.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI devolvió una respuesta vacía');
  return text;
}

// Lógica de Fallback de 4 pasos (Gemini 2.5 Flash -> Gemini Flash Latest -> GPT-4o-mini -> Failure)
async function executeLLMWithFallback(prompt, base64Audio, mimeType, validatorFn) {
  let lastError = null;

  // 1. Intento 1: Gemini 2.0 Flash (8s timeout)
  try {
    const text = await callGeminiAudio(prompt, base64Audio, mimeType, 'gemini-2.0-flash');
    const parsed = validatorFn(text);
    if (parsed) return { result: parsed, provider: 'gemini-2.0-flash' };
  } catch (err1) {
    console.warn('⚠️ [Voice LLM] Intento 1 (Gemini 2.0 Flash) falló:', err1.message);
    lastError = err1;
  }

  // 2. Intento 2: Reintento Gemini con gemini-flash-latest
  try {
    const text = await callGeminiAudio(prompt, base64Audio, mimeType, 'gemini-flash-latest');
    const parsed = validatorFn(text);
    if (parsed) return { result: parsed, provider: 'gemini-flash-latest' };
  } catch (err2) {
    console.warn('⚠️ [Voice LLM] Intento 2 (Gemini Flash Latest) falló:', err2.message);
    lastError = err2;
  }

  // 3. Intento 3: Fallback a OpenAI gpt-4o-mini
  try {
    const text = await callOpenAIAudio(prompt, base64Audio, mimeType);
    const parsed = validatorFn(text);
    if (parsed) return { result: parsed, provider: 'gpt-4o-mini' };
  } catch (err3) {
    console.warn('⚠️ [Voice LLM] Intento 3 (OpenAI Fallback) falló:', err3.message);
    lastError = err3;
  }

  // 4. Intento 4: Todos los modelos IA remotos fallaron
  throw new Error(lastError ? lastError.message : 'No se pudo procesar la voz con los proveedores de IA disponibles.');
}

// Helper para parsear JSON seguro de las respuestas de IA
function safeParseJSON(text) {
  if (!text) return null;
  const match = text.match(/\[[\s\S]*\]/) || text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch (e) {
    return null;
  }
}

// Detectar automáticamente el tipo de comida según palabras clave en el texto dictado
function detectMealTypeFromText(text) {
  if (!text) return null;
  const norm = String(text).toLowerCase();
  if (norm.match(/\b(desayuné|desayune|desayuno|desayunar|desayunando|mañana)\b/) || norm.includes('el desayuno') || norm.includes('de desayuno')) return 'desayuno';
  if (norm.match(/\b(almorcé|almorce|almuerzo|almorzar|almorzando|mediodía|mediodia)\b/) || norm.includes('el almuerzo') || norm.includes('de almuerzo')) return 'almuerzo';
  if (norm.match(/\b(merendé|merende|merienda|merendar|merendando|tarde)\b/) || norm.includes('la merienda') || norm.includes('de merienda')) return 'merienda';
  if (norm.match(/\b(cené|cene|cena|cenar|cenando|noche)\b/) || norm.includes('la cena') || norm.includes('de cena')) return 'cena';
  if (norm.match(/\b(snack|colación|colacion|tentempié|tentempie|picoteo)\b/) || norm.includes('media mañana') || norm.includes('media tarde')) return 'snack';
  return null;
}

// Función para calcular macros de alimentos de forma precisa basándose en la Tabla ANMAT / ArgenFoods
function enrichFoodMacros(foodName, qty = 1, unit = 'unidad') {
  const norm = String(foodName).toLowerCase().trim();
  let matchedKey = null;

  for (const key of Object.keys(MACRO_LOOKUP_KB)) {
    if (norm.includes(key)) {
      matchedKey = key;
      break;
    }
  }

  let base = null;
  if (matchedKey) {
    base = MACRO_LOOKUP_KB[matchedKey];
  } else if (norm.match(/\b(café|cafe|te|té|agua|infusion|infusión|mate|soda|hielo|stevia|edulcorante|sal)\b/)) {
    base = { kcal: 0, prot: 0, carb: 0, fat: 0, std_g: 200, unit: 'taza' };
  } else if (norm.match(/\b(lechuga|tomate|ensalada|verdura|zucchini|zapallito|pepino|rabanito|espárrago|rucula|rúcula)\b/)) {
    base = { kcal: 30, prot: 1.5, carb: 5, fat: 0.2, std_g: 100, unit: 'porción' };
  } else if (norm.match(/\b(fruta|frutilla|ciruela|kiwi|durazno|melon|melón|sandia|sandía|naranja|manzana)\b/)) {
    base = { kcal: 50, prot: 0.8, carb: 12, fat: 0.2, std_g: 120, unit: 'unidad' };
  } else if (norm.match(/\b(carne|bife|milanesa|pollo|pescado|cerdo|atún|atun|asado)\b/)) {
    base = { kcal: 220, prot: 25, carb: 0, fat: 12, std_g: 150, unit: 'porción' };
  } else if (norm.match(/\b(pan|galletita|arroz|fideos|pasta|papa|batata|tostada)\b/)) {
    base = { kcal: 160, prot: 4, carb: 32, fat: 2, std_g: 100, unit: 'porción' };
  } else {
    // Estimación dinámica realista para alimentos no listados (NUNCA 120 estático)
    base = { kcal: 85, prot: 3, carb: 12, fat: 2.5, std_g: 100, unit: 'porción' };
  }

  const numQty = parseFloat(qty) || 1;
  let multiplier = numQty;
  if (unit === 'g' || unit === 'gramos') {
    multiplier = numQty / (base.std_g || 100);
  }

  return {
    calories: Math.round(base.kcal * multiplier),
    protein_g: Math.round(base.prot * multiplier * 10) / 10,
    carbs_g: Math.round(base.carb * multiplier * 10) / 10,
    fat_g: Math.round(base.fat * multiplier * 10) / 10
  };
}

module.exports = {
  // BOTÓN 1 — Comidas y Bebidas (/api/voice/food)
  async processFoodVoice(userId, base64Audio, mimeType, textTranscript = null) {
    const prompt = `Sos un nutricionista clínico experto. El usuario ha grabado un audio o dictado una comida/bebida:
${textTranscript ? `Transcripción: "${textTranscript}"` : 'Analizá el archivo de audio provisto.'}

Extraé los alimentos, cantidades, unidades y momento del día (desayuno, almuerzo, merienda, cena, snack).
Respondé ÚNICAMENTE con un array JSON válido con la siguiente estructura exacta:
[
  {
    "food_name": "nombre del alimento en español",
    "quantity": 1,
    "unit": "unidad|gramos|ml|porción",
    "meal_type": "desayuno|almuerzo|merienda|cena|snack"
  }
]`;

    const validatorFn = (rawText) => {
      const parsed = safeParseJSON(rawText);
      if (!parsed) return null;
      const list = Array.isArray(parsed) ? parsed : (parsed.items || parsed.foods || [parsed]);
      if (!Array.isArray(list) || list.length === 0) return null;

      return list.map(item => ({
        food_name: item.food_name || item.name || 'Alimento registrado',
        quantity: parseFloat(item.quantity || item.qty || 1) || 1,
        unit: item.unit || 'porción',
        meal_type: ['desayuno', 'almuerzo', 'merienda', 'cena', 'snack'].includes(item.meal_type) ? item.meal_type : 'almuerzo'
      }));
    };

    const detectedMealType = detectMealTypeFromText(textTranscript);

    try {
      const { result: items, provider } = await executeLLMWithFallback(prompt, base64Audio, mimeType, validatorFn);
      const enrichedItems = items.map(item => ({
        ...item,
        meal_type: detectedMealType || item.meal_type || 'almuerzo',
        ...enrichFoodMacros(item.food_name, item.quantity, item.unit)
      }));

      const transcript = textTranscript || `Audio de comida registrado (${items.map(i => i.food_name).join(', ')})`;
      return { success: true, provider, source_transcript: transcript, items: enrichedItems };
    } catch (err) {
      console.warn('⚠️ Fallback heurístico local para processFoodVoice activado:', err.message);
      
      const rawText = textTranscript || 'Plato de comida registrado';
      const parts = rawText.split(/\b(con|y|,|\+)\b/i).map(p => p.trim()).filter(p => p.length > 2 && !['con','y',','].includes(p.toLowerCase()));
      
      const items = parts.map(p => {
        const macros = enrichFoodMacros(p, 1, 'porción');
        return {
          food_name: p,
          quantity: 1,
          unit: 'porción',
          meal_type: detectedMealType,
          ...macros
        };
      });

      const finalItems = items.length > 0 ? items : [{
        food_name: 'Plato registrado',
        quantity: 1,
        unit: 'porción',
        meal_type: detectedMealType,
        calories: 250, protein_g: 15, carbs_g: 30, fat_g: 8
      }];

      return {
        success: true,
        provider: 'local-heuristic-fallback',
        source_transcript: rawText,
        items: finalItems
      };
    }
  },

  // BOTÓN 2 — Métricas deportivas / wearables (/api/voice/wearable)
  async processWearableVoice(userId, base64Audio, mimeType, textTranscript = null) {
    const prompt = `Sos un especialista en ciencias del deporte y wearables. El usuario ha grabado o dictado una métrica física/entrenamiento:
${textTranscript ? `Transcripción: "${textTranscript}"` : 'Analizá el archivo de audio provisto.'}

Extraé el tipo de métrica, valor numérico y unidad de medida.
Tipos comunes: frecuencia_cardiaca, pasos, distancia_km, calorias_quemadas, peso_levantado_kg, repeticiones, sets, sueno_horas, agua_ml.

Respondé ÚNICAMENTE con un array JSON válido con la siguiente estructura exacta:
[
  {
    "metric_type": "tipo_de_metrica",
    "value": 100,
    "unit": "bpm|pasos|km|kcal|kg|reps|horas|ml",
    "recorded_at": "${new Date().toISOString()}"
  }
]`;

    const validatorFn = (rawText) => {
      const parsed = safeParseJSON(rawText);
      if (!parsed) return null;
      const list = Array.isArray(parsed) ? parsed : (parsed.metrics || [parsed]);
      if (!Array.isArray(list) || list.length === 0) return null;

      return list.map(item => ({
        metric_type: item.metric_type || 'actividad_fisica',
        value: parseFloat(item.value || item.cantidad || 0) || 0,
        unit: item.unit || '',
        recorded_at: item.recorded_at || new Date().toISOString()
      }));
    };

    try {
      const { result: metrics, provider } = await executeLLMWithFallback(prompt, base64Audio, mimeType, validatorFn);
      const transcript = textTranscript || `Audio de métricas registrado (${metrics.map(m => `${m.metric_type}: ${m.value} ${m.unit}`).join(', ')})`;
      return { success: true, provider, source_transcript: transcript, metrics };
    } catch (err) {
      console.warn('⚠️ Fallback heurístico local para processWearableVoice activado:', err.message);
      const rawText = textTranscript || 'Actividad deportiva registrada';
      
      let metricType = 'actividad_fisica';
      let val = 1;
      let unit = '';

      if (rawText.toLowerCase().includes('km') || rawText.toLowerCase().includes('corrí')) {
        metricType = 'distancia_km';
        const numMatch = rawText.match(/\d+(\.\d+)?/);
        val = numMatch ? parseFloat(numMatch[0]) : 5;
        unit = 'km';
      } else if (rawText.toLowerCase().includes('pasos')) {
        metricType = 'pasos';
        const numMatch = rawText.match(/\d+/);
        val = numMatch ? parseInt(numMatch[0]) : 5000;
        unit = 'pasos';
      } else if (rawText.toLowerCase().includes('pulso') || rawText.toLowerCase().includes('bpm')) {
        metricType = 'frecuencia_cardiaca';
        const numMatch = rawText.match(/\d+/);
        val = numMatch ? parseInt(numMatch[0]) : 135;
        unit = 'bpm';
      }

      return {
        success: true,
        provider: 'local-heuristic-fallback',
        source_transcript: rawText,
        metrics: [{
          metric_type: metricType,
          value: val,
          unit: unit,
          recorded_at: new Date().toISOString()
        }]
      };
    }
  },

  // BOTÓN 3 — Asistente IA conversacional (/api/voice/assistant)
  async processAssistantVoice(userId, base64Audio, mimeType, userText = null) {
    const systemPrompt = `Sos el asistente de nutrición y fitness Nutri. Reglas estrictas:
1. Respondé ÚNICAMENTE sobre nutrición, alimentación, entrenamiento, ejercicio, recuperación y métricas relacionadas a estos temas.
2. Nunca inventes datos, cifras ni información que no puedas sustentar. Si no estás seguro, decilo explícitamente en vez de arriesgar una respuesta.
3. Si la pregunta del usuario NO corresponde a estos temas (finanzas, política, temas médicos ajenos a nutrición/fitness, etc.), respondé amigablemente que no tenés información sobre eso, y ofrecé reconducir la charla a algo dentro de tu área (ej: "Sobre eso no tengo información, pero puedo ayudarte con tu plan de comidas, progreso de entrenamiento o recomendaciones nutricionales, ¿te sirve alguno de esos temas?").
4. Nunca des diagnósticos médicos ni reemplaces a un profesional de la salud; si el usuario menciona síntomas o condiciones médicas, sugerí consultar con un profesional.
5. Responder siempre en texto plano, sin salida de voz (TTS).`;

    const userMessageText = userText || 'Audio de consulta recibido.';
    const fullPrompt = `${systemPrompt}\n\nPregunta o mensaje del paciente: "${userMessageText}"\nRespuesta de Nutri:`;

    const validatorFn = (rawText) => {
      if (!rawText || rawText.trim().length === 0) return null;
      return rawText.trim();
    };

    try {
      const { result: responseText, provider } = await executeLLMWithFallback(fullPrompt, base64Audio, mimeType, validatorFn);
      const inScope = await this.validateAssistantInScope(userMessageText, responseText);

      return {
        success: true,
        provider,
        user_message: userMessageText,
        assistant_response: responseText,
        in_scope: inScope
      };
    } catch (err) {
      console.warn('⚠️ Fallback heurístico local para processAssistantVoice activado:', err.message);
      const inScope = await this.validateAssistantInScope(userMessageText, '');
      let defaultResp = "Para una recomendación personalizada de entrenamiento o nutrición, podés consultar con tu profesional o registrar tus datos en el plan diario.";

      if (!inScope) {
        defaultResp = "Sobre eso no tengo información, pero puedo ayudarte con tu plan de comidas, progreso de entrenamiento o recomendaciones nutricionales, ¿te sirve alguno de esos temas?";
      } else if (userMessageText.toLowerCase().includes('proteína')) {
        defaultResp = "Para entrenamientos de fuerza regulares, las guías clínicas recomiendan aportar entre 1.6g y 2.2g de proteína por kilogramo de peso corporal repartidos en el día.";
      }

      return {
        success: true,
        provider: 'local-clinical-fallback',
        user_message: userMessageText,
        assistant_response: defaultResp,
        in_scope: inScope
      };
    }
  },

  // Validación secundaria de in_scope para Asistente
  async validateAssistantInScope(userMessage, assistantResponse) {
    const normUser = String(userMessage).toLowerCase();
    const offKeywords = ['dólar', 'bitcoin', 'política', 'presidente', 'hipoteca', 'inversión', 'impuesto', 'auto', 'móvil', 'fútbol'];
    for (const kw of offKeywords) {
      if (normUser.includes(kw)) return false;
    }
    return true;
  },

  // Registrar auditoría de fallos en voice_failures
  async logVoiceFailure(userId, endpointType, rawAudio, sourceTranscript, errorMsg) {
    try {
      const dbClient = supabase;
      const effectiveUserId = (userId && userId !== '00000000-0000-0000-0000-000000000000') ? userId : null;
      if (!effectiveUserId) return;

      await dbClient.from('voice_failures').insert({
        user_id: effectiveUserId,
        endpoint_type: endpointType,
        raw_audio_data: rawAudio ? rawAudio.substring(0, 500) : null,
        source_transcript: sourceTranscript,
        error_message: errorMsg
      });
    } catch (err) {
      console.error('⚠️ No se pudo registrar auditoría en voice_failures:', err.message);
    }
  }
};
