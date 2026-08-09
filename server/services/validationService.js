const RISK_KEYWORDS = [
  // Fármacos para descenso de peso o control glucémico
  'metformina', 'orlistat', 'ozempic', 'saxenda', 'wegovy', 'liraglutida', 'semaglutida', 
  'prescribo', 'receto', 'prescribir', 'recetar', 'toma este medicamento', 'medicamento para adelgazar',
  // Diagnósticos médicos definitivos
  'tienes diabetes', 'tienes anemia', 'tienes hipotiroidismo', 'tienes hipertiroidismo',
  'diagnóstico clínico', 'anemia crónica', 'enfermedad renal', 'insuficiencia renal',
  // Regímenes extremos o peligrosos
  'ayuno de agua', 'dieta de agua', 'menos de 500 kcal', 'menos de 800 kcal', 
  'dieta de 600 calorías', 'dieta de 500 calorías', 'ayuno extremo', 'dieta de hambre'
];

module.exports = {
  // Analizar respuesta para detectar riesgos de salud/medicamentos
  validateAiResponse(responseText) {
    if (!responseText) {
      return { isApproved: true, riskDetected: false, text: responseText, riskDetails: null };
    }

    const lowerText = responseText.toLowerCase();
    let riskDetected = false;
    let riskDetailsList = [];

    // 1. Validar por palabras clave de riesgo
    for (const keyword of RISK_KEYWORDS) {
      if (lowerText.includes(keyword)) {
        riskDetected = true;
        riskDetailsList.push(`Palabra de riesgo: "${keyword}"`);
      }
    }

    // 2. Validar si recomienda un consumo calórico extremadamente bajo (< 1000 kcal)
    const calMatch = lowerText.match(/(\d+)\s*(kcal|calorías|calorias)/);
    if (calMatch) {
      const cals = parseInt(calMatch[1], 10);
      if (cals > 0 && cals < 1000 && (lowerText.includes('dieta') || lowerText.includes('comer') || lowerText.includes('consumir') || lowerText.includes('límite'))) {
        riskDetected = true;
        riskDetailsList.push(`Consumo calórico extremo sugerido: ${cals} kcal`);
      }
    }

    if (riskDetected) {
      const safeResponse = "Esta información requiere revisión profesional. Consulta con tu nutricionista o médico antes de aplicar cambios.";
      return {
        isApproved: false,
        riskDetected: true,
        riskDetails: riskDetailsList.join(' | '),
        text: safeResponse
      };
    }

    return {
      isApproved: true,
      riskDetected: false,
      riskDetails: null,
      text: responseText
    };
  }
};
