// Configurar mock robusto para el constructor de consultas de Supabase (Chaining + Promises)
const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  filter: jest.fn().mockReturnThis(),
  single: jest.fn().mockImplementation(() => {
    return Promise.resolve({
      data: {
        plan_tier: 'free',
        daily_ai_consults_limit: 10,
        monthly_ai_consults_limit: 300,
        image_analysis_limit: 3,
        pdf_generation_limit: 1
      },
      error: null
    });
  }),
  // Permite hacer await directo sobre el query builder (como en las consultas de conteo)
  then: jest.fn().mockImplementation(function(onFulfilled) {
    return Promise.resolve({ count: 2, error: null }).then(onFulfilled);
  })
};

jest.mock('../services/supabaseService', () => {
  return {
    supabase: {
      from: jest.fn().mockReturnValue(mockQueryBuilder)
    }
  };
});

const validationService = require('../services/validationService');
const usageLimitService = require('../services/usageLimitService');

describe('SaaS Service Layers Unit Tests', () => {

  describe('Medical/Clinical Validation Service', () => {
    test('Should approve normal clinical/nutritional response', () => {
      const normalText = 'Tu plato contiene proteínas de alta calidad del pollo y fibra del arroz integral. Es una excelente opción balanceada.';
      const res = validationService.validateAiResponse(normalText);
      expect(res.isApproved).toBe(true);
      expect(res.riskDetected).toBe(false);
      expect(res.text).toBe(normalText);
    });

    test('Should block pharmacological drug claims (e.g. metformina, ozempic)', () => {
      const riskyText = 'Te recomiendo tomar metformina de 850mg y ozempic una vez a la semana para perder peso rápido.';
      const res = validationService.validateAiResponse(riskyText);
      expect(res.isApproved).toBe(false);
      expect(res.riskDetected).toBe(true);
      expect(res.text).toContain('Esta información requiere revisión profesional.');
      expect(res.riskDetails).toContain('metformina');
      expect(res.riskDetails).toContain('ozempic');
    });

    test('Should block extreme calories suggestions (< 1000 kcal)', () => {
      const extremeCalText = 'Haz una dieta extrema de 500 calorías al día para entrar en déficit severo rápidamente.';
      const res = validationService.validateAiResponse(extremeCalText);
      expect(res.isApproved).toBe(false);
      expect(res.riskDetected).toBe(true);
      expect(res.text).toContain('Esta información requiere revisión profesional.');
      expect(res.riskDetails).toContain('500 kcal');
    });
  });

  describe('Usage Limit Validation Service', () => {
    test('Should return correct limits based on mocked profile', async () => {
      const res = await usageLimitService.checkUsageLimit('user-123', 'ai_consult');
      expect(res).toHaveProperty('allowed');
      expect(res).toHaveProperty('limit');
      expect(res).toHaveProperty('current');
      expect(res.limit).toBe(10); // Coincide con el mock
      expect(res.current).toBe(2); // Coincide con el conteo simulado
    });
  });

});
