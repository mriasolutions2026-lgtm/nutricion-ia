const voiceService = require('../services/voiceService');

describe('Voice Processing Endpoints & Service Tests', () => {
  
  test('Botón 1 (Food Voice): Should parse text/voice input into structured food JSON with macros', async () => {
    const textTranscript = "Almorcé 200g de pechuga de pollo con ensalada mixta";
    const result = await voiceService.processFoodVoice('00000000-0000-0000-0000-000000000000', null, null, textTranscript);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.items.length).toBeGreaterThan(0);

    const firstItem = result.items[0];
    expect(firstItem).toHaveProperty('food_name');
    expect(firstItem).toHaveProperty('calories');
    expect(firstItem).toHaveProperty('protein_g');
    expect(firstItem).toHaveProperty('carbs_g');
    expect(firstItem).toHaveProperty('fat_g');
  });

  test('Botón 2 (Wearable Voice): Should parse wearable sports metrics into structured JSON', async () => {
    const textTranscript = "Corrí 5 km en 25 minutos con pulso promedio de 145 bpm";
    const result = await voiceService.processWearableVoice('00000000-0000-0000-0000-000000000000', null, null, textTranscript);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(Array.isArray(result.metrics)).toBe(true);
    expect(result.metrics.length).toBeGreaterThan(0);

    const metric = result.metrics[0];
    expect(metric).toHaveProperty('metric_type');
    expect(metric).toHaveProperty('value');
    expect(metric).toHaveProperty('unit');
  });

  test('Botón 3 (Assistant Voice): Should respond adhering to nutrition/fitness scope and flag in_scope', async () => {
    const userText = "¿Cuánta proteína debo consumir si entreno fuerza 4 días a la semana?";
    const result = await voiceService.processAssistantVoice('00000000-0000-0000-0000-000000000000', null, null, userText);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.in_scope).toBe(true);
    expect(result.assistant_response).toBeDefined();
    expect(typeof result.assistant_response).toBe('string');
  });

  test('Botón 3 Out-of-scope validation: Should flag non-fitness questions', async () => {
    const inScope = await voiceService.validateAssistantInScope("¿Cómo va la cotización del dólar en el mercado hoy?", "No tengo info de eso");
    expect(inScope).toBe(false);
  });

});
