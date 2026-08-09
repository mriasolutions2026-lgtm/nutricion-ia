const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const aiGatewayService = require('./aiGatewayService');
const { supabase } = require('./supabaseService');
require('dotenv').config();

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let connection = null;
let heavyTaskQueue = null;
let isRedisAvailable = false;

try {
  // Configurar conexión a Redis con políticas de reintento controladas
  connection = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    reconnectOnError: (err) => {
      console.warn('⚠️ Error de conexión en Redis, intentando reconectar...');
      return true;
    }
  });

  connection.on('connect', () => {
    console.log('🔌 Conectado exitosamente a Redis para BullMQ.');
    isRedisAvailable = true;
  });

  connection.on('error', (err) => {
    console.warn('⚠️ Redis no disponible. Usando fallback de procesamiento síncrono/inline.');
    isRedisAvailable = false;
  });

  // Inicializar la cola
  heavyTaskQueue = new Queue('heavy-tasks', {
    connection,
    defaultJobOptions: {
      attempts: 3, // Reintentos automáticos
      backoff: {
        type: 'exponential',
        delay: 1000 // Multiplicador exponencial (1s, 2s, 4s...)
      },
      removeOnComplete: true, // Limpiar tareas exitosas
      removeOnFail: false    // Dejar tareas fallidas en la cola (para Dead-Letter Queue)
    }
  });
} catch (e) {
  console.warn('⚠️ No se pudo conectar a Redis. Las tareas pesadas se ejecutarán en línea (síncronas).');
  isRedisAvailable = false;
}

// Handler de las tareas del Worker
async function processJob(jobName, data) {
  console.log(`🤖 Iniciando procesamiento de tarea: ${jobName}`);
  
  if (jobName === 'PLATE_ANALYSIS') {
    const { userId, base64Image, mimeType, prompt, date } = data;
    // 1. Llamar al AI Gateway
    const analysisText = await aiGatewayService.analyzePlate(userId, base64Image, mimeType, prompt);
    
    // 2. Parsear el resultado a formato JSON esperado por el app para registrarlo
    // Si la respuesta es segura de advertencia médica, no creamos plato, sólo devolvemos
    if (analysisText.includes("revisión profesional")) {
      return { success: true, isMedicalDisclaimer: true, analysisText };
    }

    // Guardar el análisis en Supabase
    let parsedPayload = { raw_analysis: analysisText };
    try {
      // Intentar extraer el bloque JSON si la respuesta del modelo está formateada
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedPayload = JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.warn('⚠️ No se pudo formatear el análisis a JSON, se guardará como texto plano.');
    }

    if (userId && userId !== '00000000-0000-0000-0000-000000000000') {
      await supabase
        .from('nutrition_logs')
        .insert({
          user_id: userId,
          date: date || new Date().toISOString().split('T')[0],
          type: 'meal',
          payload: {
            name: parsedPayload.plato || 'Plato analizado',
            kcal: parsedPayload.calorias || 0,
            protein: parsedPayload.proteinas || 0,
            carbs: parsedPayload.carbohidratos || 0,
            fat: parsedPayload.grasas || 0,
            raw_response: analysisText
          }
        });
    }

    return { success: true, isMedicalDisclaimer: false, analysisText, payload: parsedPayload };
  }

  if (jobName === 'GENERATE_REPORT_PDF') {
    const { userId, userName, dateRange } = data;
    // Simular procesamiento de generación de PDF pesado (p. ej. usando pdfkit)
    console.log(`📄 Generando reporte de salud en PDF para el usuario ${userName}...`);
    
    // Encolamos una espera de 2 segundos para simular proceso de renderizado
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const fakePdfUrl = `https://ndhvhldokqulosycspdw.supabase.co/storage/v1/object/public/reports/reporte_${userId}_${Date.now()}.pdf`;
    
    // Guardar registro de reporte en Supabase
    if (userId) {
      await supabase
        .from('nutrition_logs')
        .insert({
          user_id: userId,
          type: 'metric',
          payload: {
            isReport: 'true',
            title: `Reporte de Salud - Período ${dateRange}`,
            pdf_url: fakePdfUrl
          }
        });
    }

    return { success: true, pdfUrl: fakePdfUrl };
  }

  throw new Error(`Tipo de tarea desconocido: ${jobName}`);
}

// Configurar Worker de BullMQ (sólo si Redis está conectado)
let worker = null;
if (isRedisAvailable && connection) {
  worker = new Worker('heavy-tasks', async (job) => {
    return await processJob(job.name, job.data);
  }, { connection });

  worker.on('completed', (job, result) => {
    console.log(`✅ Tarea completada exitosamente: ${job.id} (${job.name})`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Tarea fallida: ${job?.id} (${job?.name}). Error: ${err.message}`);
    // Dead-Letter Queue (DLQ): Registrar falla en auditoría de Supabase
    if (job && job.data.userId) {
      supabase
        .from('ai_responses')
        .insert({
          response_text: `[DLQ] Falla en worker tras reintentos: ${err.message}`,
          model_used: 'none',
          is_fallback_applied: false,
          error_message: `Queue failure: ${err.message}`
        }).then(() => {
          console.log(`🚨 Falla de tarea ${job.id} enviada a logs de error.`);
        });
    }
  });
}

module.exports = {
  isRedisActive() {
    return isRedisAvailable;
  },

  async getJob(id) {
    if (heavyTaskQueue) {
      return await heavyTaskQueue.getJob(id);
    }
    return null;
  },

  // Añadir una tarea a la cola o procesarla de forma síncrona si no hay Redis
  async addHeavyTask(name, data) {
    if (isRedisAvailable && heavyTaskQueue) {
      const job = await heavyTaskQueue.add(name, data);
      return { jobId: job.id, queued: true };
    } else {
      // Fallback síncrono si Redis está caído o desactivado
      console.log(`⚠️ Procesando tarea ${name} en línea de forma síncrona (Failsafe)...`);
      const result = await processJob(name, data);
      return { result, queued: false };
    }
  }
};
