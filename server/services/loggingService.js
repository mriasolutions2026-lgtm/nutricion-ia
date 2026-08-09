const { supabase } = require('./supabaseService');

module.exports = {
  // Registrar una solicitud de IA en Supabase
  async logAiRequest(userId, prompt, modelRequested, tokensEstimated = null, costEstimated = null) {
    try {
      const { data, error } = await supabase
        .from('ai_requests')
        .insert({
          user_id: userId || null,
          prompt,
          model_requested: modelRequested,
          tokens_estimated: tokensEstimated,
          cost_estimated: costEstimated
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error logging AI request to Supabase:', error.message);
        return null;
      }
      return data.id; // Retorna el ID para poder enlazar la respuesta posterior
    } catch (e) {
      console.error('❌ Logging request failed:', e);
      return null;
    }
  },

  // Registrar la respuesta recibida (o el error en caso de fallo total)
  async logAiResponse(aiRequestId, responseText, modelUsed, isFallbackApplied = false, errorMessage = null) {
    try {
      if (!aiRequestId) return null;
      
      const { data, error } = await supabase
        .from('ai_responses')
        .insert({
          ai_request_id: aiRequestId,
          response_text: responseText || null,
          model_used: modelUsed || null,
          is_fallback_applied: isFallbackApplied,
          error_message: errorMessage || null
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error logging AI response to Supabase:', error.message);
        return null;
      }
      return data.id;
    } catch (e) {
      console.error('❌ Logging response failed:', e);
      return null;
    }
  },

  // Registrar el estado de la validación médica/clínica
  async logMedicalValidation(aiResponseId, isApproved, riskDetected, riskDetails = null, validationOverrideText = null) {
    try {
      if (!aiResponseId) return null;

      const { data, error } = await supabase
        .from('medical_validations')
        .insert({
          ai_response_id: aiResponseId,
          is_approved: isApproved,
          risk_detected: riskDetected,
          risk_details: riskDetails || null,
          validation_override_text: validationOverrideText || null
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error logging medical validation to Supabase:', error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.error('❌ Logging medical validation failed:', e);
      return null;
    }
  }
};
