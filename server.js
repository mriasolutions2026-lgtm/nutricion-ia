const express = require('express');
const cors = require('cors');
const path = require('path');
const { supabase } = require('./server/services/supabaseService');
const aiGatewayService = require('./server/services/aiGatewayService');
const queueService = require('./server/services/queueService');
const usageLimitService = require('./server/services/usageLimitService');
const voiceService = require('./server/services/voiceService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' })); // Permitir imágenes en base64 grandes para análisis de platos

// ==========================================
// MIDDLEWARE DE AUTENTICACIÓN SUPABASE
// ==========================================
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Falta token de autenticación (JWT).' });
  }

  const token = authHeader.split(' ')[1];
  
  if (token.startsWith('simple-token:')) {
    const parts = token.split(':');
    req.user = { id: parts[1], email: parts[2], role: 'patient' };
    return next();
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Token de sesión inválido o expirado.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Error del servidor al validar autenticación.' });
  }
}

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = { id: '00000000-0000-0000-0000-000000000000', email: 'guest@local.com', role: 'patient' };
    return next();
  }

  const token = authHeader.split(' ')[1];
  
  if (token.startsWith('simple-token:')) {
    const parts = token.split(':');
    req.user = { id: parts[1], email: parts[2], role: 'patient' };
    return next();
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      req.user = { id: '00000000-0000-0000-0000-000000000000', email: 'guest@local.com', role: 'patient' };
      return next();
    }
    req.user = user;
    next();
  } catch (err) {
    req.user = { id: '00000000-0000-0000-0000-000000000000', email: 'guest@local.com', role: 'patient' };
    next();
  }
}

// ==========================================
// ENDPOINTS DE AUTENTICACIÓN (PROXY)
// ==========================================

// Registro de usuario
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, role, organizationName } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y Password requeridos.' });

  try {
    let orgId = null;
    // Si se provee nombre de organización y el rol es admin/professional, crearla
    if (organizationName && (role === 'admin' || role === 'professional')) {
      const { data: org, error: orgErr } = await supabase
        .from('organizations')
        .insert({ name: organizationName })
        .select()
        .single();
      if (orgErr) throw orgErr;
      orgId = org.id;
    }

    // Registrar en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || 'Usuario',
          role: role || 'patient'
        }
      }
    });

    if (error) throw error;

    // Vincular perfil creado con la organización si corresponde
    if (data.user && orgId) {
      await supabase
        .from('user_profiles')
        .update({ organization_id: orgId })
        .eq('id', data.user.id);
    }

    res.json({ success: true, user: data.user, session: data.session });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Inicio de sesión
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // Obtener rol del perfil de usuario
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({ success: true, session: data.session, user: data.user, profile });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Identificación rápida por email sin contraseña (Onboarding y Login directo)
app.post('/api/auth/identify', async (req, res) => {
  const { email, profileData } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Se requiere un correo electrónico válido.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    // 1. Buscar si el perfil con este email ya existe en public.user_profiles
    let { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (error) throw error;

    let isNew = false;
    if (!profile) {
      isNew = true;
      // Generar un nuevo UUID usando crypto.randomUUID() nativo de Node.js
      const crypto = require('crypto');
      const newId = crypto.randomUUID();

      // Crear el perfil
      const name = profileData?.name || 'Usuario';
      const insertData = {
        id: newId,
        email: cleanEmail,
        name: name,
        role: profileData?.role || 'patient',
        age: profileData?.age || null,
        sex: profileData?.sex || null,
        weight: profileData?.weight || null,
        height: profileData?.height || null,
        target_weight: profileData?.targetWeight || null,
        diet: profileData?.diet || 'omnivoro',
        goal: profileData?.goal || 'saludGeneral',
        activity: profileData?.activity || 'moderado',
        tdee: profileData?.tdee || null,
        target_cals: profileData?.targetCals || null,
        prot: profileData?.prot || null,
        carb: profileData?.carb || null,
        fat: profileData?.fat || null,
        allergies: profileData?.allergies || [],
        conditions: profileData?.conditions || [],
        dislikes: profileData?.dislikes || ''
      };

      const { data: insertedProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert(insertData)
        .select('*')
        .single();

      if (insertError) throw insertError;
      profile = insertedProfile;

      // Crear límites de uso para el nuevo usuario
      await supabase
        .from('usage_limits')
        .insert({
          user_id: newId,
          plan_tier: 'free',
          daily_ai_consults_limit: 10,
          monthly_ai_consults_limit: 300,
          image_analysis_limit: 4,
          pdf_generation_limit: 1
        });
    }

    // Generar simple-token
    const token = `simple-token:${profile.id}:${profile.email}`;

    // Obtener los logs de nutrición del usuario
    const { data: logs, error: logsError } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', profile.id);

    if (logsError) throw logsError;

    res.json({
      success: true,
      isNew,
      token,
      profile,
      logs: logs || []
    });

  } catch (err) {
    console.error('❌ [auth/identify] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Eliminar cuenta y todos los datos asociados de forma permanente (Cumplimiento GDPR/App Store)
app.delete('/api/auth/delete-account', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const client = getSupabase(req);

  console.log(`🚨 [delete-account] Solicitud de eliminación permanente para el usuario ID: ${userId}`);

  try {
    // 1. Eliminar de tablas dependientes
    await client.from('patients').delete().eq('id', userId);
    await client.from('patients').delete().eq('professional_id', userId);
    await client.from('professionals').delete().eq('id', userId);
    await client.from('nutrition_logs').delete().eq('user_id', userId);
    await client.from('usage_limits').delete().eq('user_id', userId);
    await client.from('subscriptions').delete().eq('user_id', userId);

    // 2. Eliminar el perfil del usuario principal
    const { error: profileError } = await client.from('user_profiles').delete().eq('id', userId);
    if (profileError) throw profileError;

    res.json({ success: true, message: 'Cuenta y datos asociados eliminados de forma permanente.' });
  } catch (err) {
    console.error('❌ [delete-account] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ==========================================
// CLIENTE SUPABASE CON CONTEXTO DE USUARIO (PARA RLS)
// ==========================================
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

function getSupabase(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token.startsWith('simple-token:')) {
      return supabase;
    }
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
  }
  return supabase;
}

// ==========================================
// ENDPOINTS CRUD MULTI-TENANT (COMPACTOS)
// ==========================================

// Obtener perfil activo
app.get('/api/profile', requireAuth, async (req, res) => {
  try {
    const client = getSupabase(req);
    const { data, error } = await client
      .from('user_profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Guardar/Actualizar perfil
app.post('/api/profile', requireAuth, async (req, res) => {
  try {
    const client = getSupabase(req);
    const { data, error } = await client
      .from('user_profiles')
      .update(req.body)
      .eq('id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtener registros de nutrición (comidas, hidratación, peso...)
app.get('/api/logs', requireAuth, async (req, res) => {
  const { date, type } = req.query;
  try {
    const client = getSupabase(req);
    let query = client
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', req.user.id);
    
    if (date) query = query.eq('date', date);
    if (type) query = query.eq('type', type);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Registrar un log nutricional
app.post('/api/logs', requireAuth, async (req, res) => {
  const { date, type, payload } = req.body;
  try {
    const client = getSupabase(req);
    const { data, error } = await client
      .from('nutrition_logs')
      .insert({
        user_id: req.user.id,
        date: date || new Date().toISOString().split('T')[0],
        type,
        payload
      })
      .select();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar un log
app.delete('/api/logs/:id', requireAuth, async (req, res) => {
  try {
    const client = getSupabase(req);
    const { error } = await client
      .from('nutrition_logs')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// ENDPOINTS DE IA (GATEWAY Y COLA DE TAREAS)
// ==========================================

// Consultar límites de uso del usuario actual
app.get('/api/limits', requireAuth, async (req, res) => {
  try {
    const client = getSupabase(req);
    const chatLimit = await usageLimitService.checkUsageLimit(req.user.id, 'ai_consult', client);
    const imageLimit = await usageLimitService.checkUsageLimit(req.user.id, 'image_analysis', client);
    const pdfLimit = await usageLimitService.checkUsageLimit(req.user.id, 'pdf_generation', client);

    res.json({
      plan: 'free',
      chat: { limit: chatLimit.limit, current: chatLimit.current, remaining: chatLimit.limit - chatLimit.current },
      image: { limit: imageLimit.limit, current: imageLimit.current, remaining: imageLimit.limit - imageLimit.current },
      pdf: { limit: pdfLimit.limit, current: pdfLimit.current, remaining: pdfLimit.limit - pdfLimit.current }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Procesar análisis de plato (Cola asíncrona BullMQ con Fallback)
app.post('/api/analyze-plate', optionalAuth, async (req, res) => {
  const { base64Image, mimeType, prompt, date } = req.body;
  console.log(`📥 [analyze-plate] Request from user ID: ${req.user ? req.user.id : 'none'}`);
  if (!base64Image || !mimeType) {
    return res.status(400).json({ error: 'Se requiere la imagen en base64 y el tipo mime.' });
  }

  try {
    // 1. Validar cuota diaria de análisis de imagen
    const client = getSupabase(req);
    const usage = await usageLimitService.checkUsageLimit(req.user ? req.user.id : null, 'image_analysis', client);
    console.log(`📊 [analyze-plate] Limit check result:`, usage);
    if (!usage.allowed) {
      return res.status(429).json({
        error: `Has superado tu límite de plan gratuito de ${usage.limit} análisis de platos diarios. Actualiza a Premium para análisis ilimitados.`,
        limitExceeded: true
      });
    }

    // 2. Encolar tarea pesada
    const task = await queueService.addHeavyTask('PLATE_ANALYSIS', {
      userId: req.user.id,
      base64Image,
      mimeType,
      prompt: prompt || 'Analizar esta comida',
      date
    });

    console.log(`✅ [analyze-plate] Task processed. queued: ${task.queued}`);
    if (task.queued) {
      res.json({ success: true, queued: true, jobId: task.jobId, message: 'Análisis de plato encolado correctamente.' });
    } else {
      res.json({ success: true, queued: false, result: task.result });
    }
  } catch (err) {
    console.error('❌ [analyze-plate] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Ruta de completado de IA unificada con fallback (usada por PWA local-first)
app.post('/api/ai-completion', optionalAuth, async (req, res) => {
  const { prompt, base64Image, mimeType } = req.body;
  try {
    const text = await aiGatewayService.getCompletion(prompt, base64Image, mimeType);
    res.json({ success: true, text });
  } catch (err) {
    console.error('❌ [ai-completion] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Chatbot IA (Directo de baja latencia con AI Gateway y Filtro Médico)
app.post('/api/chat-ia', optionalAuth, async (req, res) => {
  const { message, history } = req.body;
  console.log(`📥 [chat-ia] Request from user ID: ${req.user ? req.user.id : 'none'}`);
  if (!message) return res.status(400).json({ error: 'Mensaje requerido.' });

  try {
    // 1. Validar cuotas del plan
    const client = getSupabase(req);
    const usage = await usageLimitService.checkUsageLimit(req.user.id, 'ai_consult', client);
    console.log(`📊 [chat-ia] Limit check result:`, usage);
    if (!usage.allowed) {
      return res.status(429).json({
        error: `Has superado tu límite de plan gratuito de ${usage.limit} consultas de chat diarias. Consulta de nuevo mañana.`,
        limitExceeded: true
      });
    }

    // 2. Ejecutar consulta mediante AI Gateway (Gemini con fallback a DeepSeek y reducción de historial)
    const reply = await aiGatewayService.chatbotResponse(req.user.id, message, history || []);
    console.log(`✅ [chat-ia] Reply generated successfully.`);
    res.json({ reply });
  } catch (err) {
    console.error('❌ [chat-ia] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Generar PDF mensual (Encolado BullMQ)
app.post('/api/generate-pdf', requireAuth, async (req, res) => {
  const { userName, dateRange } = req.body;
  try {
    // Validar límites mensuales
    const client = getSupabase(req);
    const usage = await usageLimitService.checkUsageLimit(req.user.id, 'pdf_generation', client);
    if (!usage.allowed) {
      return res.status(429).json({
        error: `Has superado tu límite de plan gratuito de ${usage.limit} PDF mensual. Actualiza para reportes adicionales.`
      });
    }

    const task = await queueService.addHeavyTask('GENERATE_REPORT_PDF', {
      userId: req.user.id,
      userName: userName || 'Usuario',
      dateRange: dateRange || 'Último mes'
    });

    if (task.queued) {
      res.json({ success: true, queued: true, jobId: task.jobId, message: 'Generación de PDF mensual encolada.' });
    } else {
      res.json({ success: true, queued: false, pdfUrl: task.result.pdfUrl });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener estado de un job en la cola (BullMQ)
app.get('/api/jobs/:id', optionalAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const job = await queueService.getJob(id);
    if (!job) {
      return res.status(404).json({ error: 'Trabajo no encontrado.' });
    }
    const state = await job.getState();
    const result = job.returnvalue;
    res.json({ id, state, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ENDPOINTS DE CARGA POR VOZ E IA (3 BOTONES)
// ==========================================

// BOTÓN 1: Procesar audio/transcripción de comidas
app.post('/api/voice/food', optionalAuth, async (req, res) => {
  const { base64Audio, mimeType, textTranscript } = req.body;
  try {
    const result = await voiceService.processFoodVoice(req.user.id, base64Audio, mimeType, textTranscript);
    res.json(result);
  } catch (err) {
    res.status(422).json({ error: 'No se pudo estructurar la comida por voz. Por favor realiza una carga manual.', detail: err.message });
  }
});

// BOTÓN 1: Confirmar y guardar comidas en Supabase (food_entries + nutrition_logs)
app.post('/api/voice/food/confirm', optionalAuth, async (req, res) => {
  const { items, source_transcript, meal_type } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Se requiere una lista de alimentos válidos para guardar.' });
  }

  try {
    const client = getSupabase(req);
    const effectiveUserId = (req.user && req.user.id !== '00000000-0000-0000-0000-000000000000') ? req.user.id : null;
    const savedEntries = [];

    for (const item of items) {
      const entry = {
        user_id: effectiveUserId,
        food_name: item.food_name || 'Comida',
        quantity: item.quantity || 1,
        unit: item.unit || 'porción',
        meal_type: meal_type || item.meal_type || 'almuerzo',
        calories: item.calories || 0,
        protein_g: item.protein_g || 0,
        carbs_g: item.carbs_g || 0,
        fat_g: item.fat_g || 0,
        source_transcript: source_transcript || 'Carga por voz'
      };

      if (effectiveUserId) {
        const { data, error } = await client.from('food_entries').insert(entry).select().single();
        if (error) console.warn('⚠️ Error al insertar en food_entries Supabase:', error.message);
        else savedEntries.push(data);

        // Guardar log unificado en nutrition_logs
        await client.from('nutrition_logs').insert({
          user_id: effectiveUserId,
          type: 'meal',
          payload: entry
        });
      } else {
        savedEntries.push({ ...entry, id: Date.now() });
      }
    }

    res.json({ success: true, message: 'Alimentos guardados con éxito.', savedEntries });
  } catch (err) {
    res.status(500).json({ error: 'Error al persistir la comida en Supabase: ' + err.message });
  }
});

// BOTÓN 2: Procesar audio/transcripción de wearables y deportes
app.post('/api/voice/wearable', optionalAuth, async (req, res) => {
  const { base64Audio, mimeType, textTranscript } = req.body;
  try {
    const result = await voiceService.processWearableVoice(req.user.id, base64Audio, mimeType, textTranscript);
    res.json(result);
  } catch (err) {
    res.status(422).json({ error: 'No se pudo reconocer la métrica deportiva. Por favor realiza una carga manual.', detail: err.message });
  }
});

// BOTÓN 2: Confirmar y guardar métricas wearables en Supabase (wearable_metrics + nutrition_logs)
app.post('/api/voice/wearable/confirm', optionalAuth, async (req, res) => {
  const { metrics, source_transcript } = req.body;
  if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
    return res.status(400).json({ error: 'Se requiere una lista de métricas válidas.' });
  }

  try {
    const client = getSupabase(req);
    const effectiveUserId = (req.user && req.user.id !== '00000000-0000-0000-0000-000000000000') ? req.user.id : null;
    const savedMetrics = [];

    for (const m of metrics) {
      const metricRecord = {
        user_id: effectiveUserId,
        metric_type: m.metric_type || 'actividad_fisica',
        value: m.value || 0,
        unit: m.unit || '',
        recorded_at: m.recorded_at || new Date().toISOString(),
        source_transcript: source_transcript || 'Carga por voz'
      };

      if (effectiveUserId) {
        const { data, error } = await client.from('wearable_metrics').insert(metricRecord).select().single();
        if (error) console.warn('⚠️ Error al insertar en wearable_metrics Supabase:', error.message);
        else savedMetrics.push(data);

        await client.from('nutrition_logs').insert({
          user_id: effectiveUserId,
          type: 'activity',
          payload: metricRecord
        });
      } else {
        savedMetrics.push({ ...metricRecord, id: Date.now() });
      }
    }

    res.json({ success: true, message: 'Métricas deportivas guardadas con éxito.', savedMetrics });
  } catch (err) {
    res.status(500).json({ error: 'Error al persistir métricas en Supabase: ' + err.message });
  }
});

// BOTÓN 3: Asistente conversacional IA (Chat Nutri con prompt estricto y auditoría)
app.post('/api/voice/assistant', optionalAuth, async (req, res) => {
  const { base64Audio, mimeType, userText } = req.body;
  try {
    const result = await voiceService.processAssistantVoice(req.user.id, base64Audio, mimeType, userText);

    // Auditoría en assistant_conversations
    const client = getSupabase(req);
    const effectiveUserId = (req.user && req.user.id !== '00000000-0000-0000-0000-000000000000') ? req.user.id : null;

    if (effectiveUserId) {
      await client.from('assistant_conversations').insert({
        user_id: effectiveUserId,
        user_message: result.user_message,
        assistant_response: result.assistant_response,
        in_scope: result.in_scope
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error en la respuesta del asistente Nutri: ' + err.message });
  }
});

// ==========================================
// RENDERIZADO ESTÁTICO (COMPATIBILIDAD SPA/PWA)
// ==========================================
const PUBLIC_DIR = path.join(__dirname, 'www');
app.use(express.static(PUBLIC_DIR));

// Carga inicial SPA (Compatible con Express 5)
app.use((req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Inicializar Servidor Express
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 [SaaS Server] Ejecutándose en puerto ${PORT} (0.0.0.0)`);
  console.log(`📡 [SaaS Server] Estado de Redis: ${queueService.isRedisActive() ? 'CONECTADO (BullMQ activo)' : 'CAÍDO (Fallback síncrono activo)'}`);
  console.log(`📂 [SaaS Server] Carpeta pública: ${PUBLIC_DIR}\n`);
});
