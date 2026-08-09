const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ SUPABASE_URL o SUPABASE_ANON_KEY faltan en .env.');
}

// Iniciar cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = {
  supabase,
  
  // Helpers para perfiles de usuario
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async updateUserProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Helpers para el registro de logs nutricionales (Comida, Agua, Peso, etc.)
  async getNutritionLogs(userId, date, type = null) {
    let query = supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date);
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async saveNutritionLog(userId, date, type, payload) {
    const { data, error } = await supabase
      .from('nutrition_logs')
      .insert({ user_id: userId, date, type, payload })
      .select();
    if (error) throw error;
    return data;
  },

  async deleteNutritionLog(userId, logId) {
    const { error } = await supabase
      .from('nutrition_logs')
      .delete()
      .eq('id', logId)
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  }
};
