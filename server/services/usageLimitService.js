const { supabase } = require('./supabaseService');

module.exports = {
  // Verificar si un usuario ha superado su cuota según su plan
  async checkUsageLimit(userId, type, reqClient = null) {
    const dbClient = reqClient || supabase;
    if (!userId || userId === '00000000-0000-0000-0000-000000000000') {
      return { allowed: true, limit: 9999, current: 0 };
    }
    try {
      // 1. Obtener límites del usuario (tabla usage_limits)
      let { data: limits, error: limitError } = await dbClient
        .from('usage_limits')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      // Si no existe el registro de límites en base de datos, aplicar por defecto el plan gratuito
      if (limitError || !limits) {
        limits = {
          plan_tier: 'free',
          daily_ai_consults_limit: 10,
          monthly_ai_consults_limit: 300,
          image_analysis_limit: 4, // Plan Free: 4 análisis de platos/día
          pdf_generation_limit: 1   // Plan Free: 1 PDF/mes
        };
      }

      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

      // 2. Contar consumo actual según el tipo solicitado
      if (type === 'ai_consult') {
        // Contar consultas de chat de hoy
        const { count, error } = await dbClient
          .from('ai_requests')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .in('model_requested', ['gemini-2.0-flash', 'gemini-2.5-flash']) // O cualquier chat consult
          .gte('created_at', `${today}T00:00:00.000Z`);

        if (error) throw error;
        const currentCount = count || 0;
        return {
          allowed: currentCount < limits.daily_ai_consults_limit,
          limit: limits.daily_ai_consults_limit,
          current: currentCount
        };
      }

      if (type === 'image_analysis') {
        // Contar análisis de imágenes de hoy
        const { count, error } = await dbClient
          .from('ai_requests')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .in('model_requested', ['gemini-2.0-flash', 'gemini-2.5-flash-vision']) // Identificador para análisis de imagen
          .gte('created_at', `${today}T00:00:00.000Z`);

        if (error) throw error;
        const currentCount = count || 0;
        return {
          allowed: currentCount < limits.image_analysis_limit,
          limit: limits.image_analysis_limit,
          current: currentCount
        };
      }

      if (type === 'pdf_generation') {
        // Contar PDFs generados en el mes en curso (registrados en nutrition_logs con type='pdf_report')
        const { count, error } = await dbClient
          .from('nutrition_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('type', 'metric') // O un subcampo en el payload
          .filter('payload->>isReport', 'eq', 'true') // Filtrar por reportes PDF en el payload JSONB
          .gte('created_at', startOfMonth);

        if (error) throw error;
        const currentCount = count || 0;
        return {
          allowed: currentCount < limits.pdf_generation_limit,
          limit: limits.pdf_generation_limit,
          current: currentCount
        };
      }

      return { allowed: true, limit: 9999, current: 0 };
    } catch (e) {
      console.error('❌ Error checking usage limits:', e.message);
      // Failsafe: permitir en caso de error de conexión para no degradar experiencia de usuario bruscamente
      return { allowed: true, limit: 9999, current: 0 };
    }
  }
};
