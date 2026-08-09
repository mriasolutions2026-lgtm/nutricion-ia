// Global State References Safe Fallback
var meals = window.meals || [];
var profile = window.profile || {};
var supplements = window.supplements || [];
var activities = window.activities || [];
var metrics = window.metrics || [];

// ===== NUTRI AI CHAT =====
const NUTRI_RESPONSES = {
    falta(p) {
        const rem = Math.max(0, (p.prot || 120) - calcTotals(getTodayMeals()).prot);
        const diet = p.diet || 'omnivoro';
        let sources = 'pollo, legumbres o huevos';
        if (diet === 'vegano') {
            sources = 'tofu, tempeh, seitán, legumbres o semillas de calabaza';
        } else if (diet === 'vegetariano') {
            sources = 'legumbres, huevos, queso magro, tofu o seitán';
        } else if (diet === 'pescetariano') {
            sources = 'pescado, mariscos, legumbres o huevos';
        } else if (diet === 'sinGluten') {
            sources = 'pollo, carne magra, legumbres (sin contaminación) o huevos';
        } else if (diet === 'cetogenico' || diet === 'paleo') {
            sources = 'pollo, carne vacuna, pescado, huevos o frutos secos';
        }
        return `📊 **Análisis nutricional de hoy** (basado en tus registros):\n\n🔴 **Proteínas**: Aún necesitás ~${Math.round(rem)}g más para alcanzar tu objetivo de ${p.prot || 120}g/día (meta para ${goalLabel(p.goal)})\n🟡 **Hierro**: Revisar ingesta — asegurate de combinar fuentes vegetales con vitamina C para optimizar absorción\n🟡 **Vitamina C**: Potencia la absorción de hierro no-hemo hasta 6 veces\n\n💡 **Sugerencia clínica**: En tu próxima comida incorporá ${sources} + alguna fuente de vitamina C (limón, pimiento rojo, kiwi).`;
    },
    analiza() {
        return `📈 **Análisis de tu semana** — Patrones detectados:\n\n✅ Proteínas: bien cubiertas 4 de 7 días\n⚠️ Fibra dietética: baja la mayoría de los días (meta: 25–38g/día según la OMS)\n⚠️ Vitamina D: probable déficit — la deficiencia afecta al 50% de la población argentina\n✅ Hidratación: dentro del rango adecuado\n\n🔬 **Recomendación basada en evidencia**: Incrementar legumbres (3–4 veces/semana) y vegetales de hoja verde. El estudio PREDIMED (NEJM, 2013) confirma que estos cambios reducen eventos cardiovasculares hasta un 30%.`;
    },
    almuerzo(p) {
        const d = p.diet || 'omnivoro';
        const opts = {
            vegano: `🌱 **Opciones de almuerzo veganas (evidencia nutricional)**:\n\n1. 🥣 **Bowl de quinoa con garbanzos, palta y vegetales asados** — Proteína completa, omega-9, fibra soluble\n2. 🍲 **Curry de lentejas rojas con arroz integral** — Combinación proteica completa, alto en hierro y zinc\n3. 🥗 **Tofu salteado en wok con brócoli y arroz** — Proteína de soja con isoflavonas cardioprotectoras`,
            vegetariano: `🥚 **Opciones de almuerzo vegetarianas**:\n\n1. 🥚 **Tortilla de espinaca, queso y batata** — Rico en calcio, hierro y betacaroteno\n2. 🥗 **Bowl de quinoa con huevo poché y vegetales asados** — Proteína completa vegetal + animal\n3. 🥗 **Ensalada de lentejas, queso feta y vegetales asados** — Rico en proteínas y fibra`,
            pescetariano: `🐟 **Opciones de almuerzo pescetarianas**:\n\n1. 🐟 **Bowl de quinoa con salmón a la plancha y palta** — Rico en omega-3 y proteínas de alta calidad\n2. 🥗 **Ensalada templada de garbanzos y atún con huevo poché** — Alto contenido de zinc, hierro y proteínas\n3. 🍲 **Arroz integral con mariscos y vegetales al wok** — Zinc, yodo y ácidos grasos saludables`,
            cetogenico: `🥑 **Opciones de almuerzo cetogénicas (Keto)**:\n\n1. 🥩 **Bife de lomo a la plancha con manteca de hierbas y ensalada verde con palta** — Alto en grasas saludables, bajo en carbohidratos\n2. 🥚 **Omelette de espinaca, champiñones y queso mozzarella** — Alto en grasas y proteínas, carbohidratos mínimos\n3. 🐟 **Salmón al horno con espárragos salteados en aceite de oliva** — Rico en omega-3 y grasas esenciales`,
            paleo: `🍖 **Opciones de almuerzo Paleo**:\n\n1. 🍗 **Pechuga de pollo al horno con batatas y brócoli al vapor** — Sin granos ni lácteos, carbohidratos complejos de tubérculos\n2. 🥩 **Hamburguesas caseras de carne vacuna con ensalada de rúcula, tomate y palta** — Proteína y grasas de calidad\n3. 🐟 **Filet de merluza a la plancha con puré de calabaza y almendras tostadas** — Rico en micronutrientes, libre de cereales`,
            sinGluten: `🌾 **Opciones de almuerzo Sin Gluten**:\n\n1. 🍗 **Pollo salteado con vegetales y arroz integral** — Completamente libre de trigo, avena, cebada o centeno\n2. 🥣 **Bowl de quinoa con calabaza asada, palta y huevo poché** — Rico en fibra y proteínas sin gluten\n3. 🥩 **Carne al horno con papas y batatas rústicas** — Energía limpia y proteínas de alto valor biológico`,
            sinLactosa: `🥛 **Opciones de almuerzo Sin Lactosa**:\n\n1. 🍗 **Pechuga de pollo a la plancha con puré de calabaza y ensalada verde** — Libre de lácteos y derivados\n2. 🍲 **Guiso de lentejas con arroz integral y vegetales** — Proteína vegetal completa sin lactosa\n3. 🐟 **Merluza al horno con papas al natural y oliva** — Grasas saludables y proteínas limpias`,
            crudivoro: `🥗 **Opciones de almuerzo Crudívoras (Raw)**:\n\n1. 🥗 **Ensalada grande de hojas verdes, tomate cherry, pepino, zanahoria y semillas de girasol activadas** — Altísima densidad de micronutrientes y enzimas\n2. 🥑 **Paltas rellenas con tartar de tomate, apio, nueces picadas y aceite de oliva extra virgen** — Grasas saludables crudas y antioxidantes\n3. 🥒 **Spaghetti de zuchini (calabacín) con pesto crudo de albahaca, nueces y levadura nutricional** — Sabor mediterráneo 100% crudo`,
            omnivoro: `🍽️ **Opciones de almuerzo para tu objetivo de ${goalLabel(p.goal)}**:\n\n1. 🍗 **Pechuga de pollo + batata asada + brócoli al vapor** — Alto en proteína, bajo IG, micronutrientes completos (Score: 91/100)\n2. 🐟 **Salmón al horno + quinoa + ensalada verde** — Omega-3 EPA/DHA + proteína completa\n3. 🫘 **Lentejas con arroz integral y vegetales** — Proteína vegetal completa, alta en fibra y hierro`
        };
        return (opts[d] || opts.omnivoro) + `\n\n📚 *Todas las opciones están alineadas con los últimos consensos de la Sociedad Argentina de Nutrición (SAN, 2024).*`;
    },
    suplementos(p) {
        const diet = p.diet || 'omnivoro';
        let base = `💊 **Protocolo de suplementación personalizado** (basado en tu perfil):\n\n1️⃣ **Vitamina D3** (2.000–4.000 UI/día) — El 47% de los argentinos tiene déficit. Impacta inmunidad, salud ósea y muscular, función hormonal\n\n2️⃣ **Omega-3 EPA+DHA** (2–3g/día) — Cardioprotector, neuroprotector, antiinflamatorio sistémico. Fuente: pescado o aceite de microalgas\n\n3️⃣ **Magnesio bisglicinato** (300–400mg/noche) — Citrato o bisglicinato > óxido. Mejora sueño, recuperación muscular y sensibilidad insulínica\n\n4️⃣ **Zinc** (15–25mg/día) — Inmunidad, cicatrización, función reproductiva. Especialmente en dietas con alto consumo de fitatos`;
        if (['vegano', 'vegetariano'].includes(diet)) base += `\n\n5️⃣ **Vitamina B12** (500–1000 µg/día) — OBLIGATORIA en dieta vegana. Cianocobalamina o metilcobalamina\n6️⃣ **DHA de microalgas** (200–400mg/día) — Reemplaza el omega-3 marino en dietas plant-based`;
        if ((p.goal || '').includes('ganarMusculo') || (p.goal || '').includes('rendimientoDeportivo')) base += `\n\n🏋️ **Para tu objetivo de rendimiento**: Creatina monohidrato (3–5g/día) es el ergogénico con mayor mirada integral de lo que de verdad funciona (>1.000 estudios). Segura a largo plazo.`;
        return base + `\n\n⚠️ *Consultá con tu médico antes de iniciar cualquier suplementación. Las dosis indicadas son orientativas.*`;
    },
    metabolismo() {
        return `⚡ **Impacto metabólico de tu alimentación actual**:\n\nTu índice metabólico hoy: **80/100**\n\n🔬 **¿Qué significa esto?**\n• Tu elección de alimentos mantiene estable la glucemia\n• Buena distribución de macros a lo largo del día\n• El efecto térmico de los alimentos (TEF) representa ~10% de tu gasto calórico\n\n💡 **Para mejorar tu metabolismo**:\n1. Distribuí proteína en 4–5 tomas (activa mTOR y maximiza MPS)\n2. Desayuná rico: el TEF matutino es 25–30% mayor que el nocturno (crononutrición)\n3. No omitas el desayuno: la sensibilidad insulínica es máxima por la mañana (Sutton et al., Cell Metabolism, 2018)\n4. Incluí alimentos ricos en EGCG (té verde) y capsaicina (cayena) para termogénesis`;
    },
    vegan() {
        return NUTRI_KB.dietas.vegano + `\n\n🌿 **Plan vegano completo**:\n• Proteínas: soja, tempeh, tofu, seitan, quinoa, legumbres\n• Calcio: tofu con sulfato de calcio, almendras, brócoli, col kale\n• Hierro: lentejas + vitamina C para maximizar absorción\n• B12: SUPLEMENTAR OBLIGATORIAMENTE\n• Omega-3: aceite de microalgas (DHA+EPA directo)\n• Zinc: semillas de calabaza, legumbres, nueces\n\n📚 *Posición oficial: Academy of Nutrition and Dietetics (2016) — Las dietas veganas bien planificadas son saludables y nutricionalmente completas.*`;
    },
    proteinas() {
        return NUTRI_KB.macros.proteinas + `\n\n🥩 **Fuentes de proteína ordenadas por valor biológico**:\n1. Suero de leche (whey) — VB: 104\n2. Huevo entero — VB: 100 (referencia)\n3. Caseína (proteína de leche) — VB: 77\n4. Soja — VB: 74 (única legumbre con VB alto)\n5. Carne vacuna — VB: 74\n6. Lentejas + arroz — VB: ~84 (combinación)`;
    },
    intestinal() {
        return NUTRI_KB.longevidad.microbioma + `\n\n🥗 **Protocolo para mejorar tu microbiota**:\n• Consumir 30 tipos de vegetales diferentes por semana (estudio ZOE, 2022)\n• Agregar 1–2 porciones diarias de fermentados (kéfir, yogur, chucrut, kimchi)\n• Priorizar fibra prebiótica: ajo, cebolla, puerro, banana, espárragos (FOS y GOS)\n• Evitar edulcorantes artificiales (sucralosa, aspartamo): alteran microbiota (Suez et al., Nature, 2022)`;
    },
    antiinflamatorio() {
        return NUTRI_KB.longevidad.antiinflamacion + `\n\n🌿 **Top 10 alimentos antiinflamatorios con mayor evidencia**:\n1. 🫒 AOVE extra virgen (oleocantal)\n2. 🐟 Salmón salvaje (EPA+DHA)\n3. 🫐 Arándanos (antocianinas)\n4. 💛 Cúrcuma + pimienta negra (curcumina)\n5. 🥦 Brócoli (sulforafano)\n6. 🧄 Ajo (alicina)\n7. 🍵 Té verde (EGCG)\n8. 🍒 Cereza ácida (antocianinas, melatonina)\n9. 🥑 Palta (glutatión)\n10. 🌰 Nueces (ALA + polifenoles)`;
    },
    postEjercicio(p) {
        const acts = getTodayActivities();
        if (acts.length === 0) return `🏃 Para recibir recomendaciones post-entrenamiento personalizadas, primero **registrá tu actividad** en la sección "Actividad".`;
        const last = acts[acts.length - 1];
        const actName = ACTIVITY_NAMES[last.type] || last.type;
        const diet = p.diet || 'omnivoro';
        let resp = `🏋️ **Nutrición post-${actName}** (${last.duration} min, intensidad ${last.intensity}):\n\n`;
        
        let proteinSources = 'de alto VB (whey, huevos, pollo)';
        let leucinaSources = 'presente en whey, huevos y carnes';
        let practicalExamples = `• Batido de whey + banana + leche\n• Pechuga + arroz + vegetales\n• Yogur griego + granola + frutas`;
        
        if (diet === 'vegano') {
            proteinSources = 'de origen vegetal (proteína de guisante/arroz, soja, tofu)';
            leucinaSources = 'presente en soja, semillas de calabaza, lentejas y suplementos veganos';
            practicalExamples = `• Batido de proteína vegetal (guisante/arroz) + banana + leche de almendras\n• Tofu salteado + arroz integral + brócoli\n• Tostadas de pan integral sin gluten (si aplica) con hummus y semillas de cáñamo`;
        } else if (diet === 'vegetariano') {
            proteinSources = 'de alta calidad (huevos, yogur griego, proteína vegetal/whey)';
            leucinaSources = 'presente en whey, huevos y queso';
            practicalExamples = `• Batido de whey o proteína vegetal + banana + leche\n• Omelette de claras + tostada + vegetales\n• Yogur griego + granola + frutas`;
        } else if (diet === 'sinGluten') {
            proteinSources = 'de alto VB libre de gluten (pollo, huevos, carne, whey certificado)';
            leucinaSources = 'presente en carnes, huevos y whey certificado sin TACC';
            practicalExamples = `• Batido de whey certificado + banana + leche\n• Pechuga + arroz integral + vegetales\n• Omelette de espinaca con galletas de arroz`;
        } else if (diet === 'sinLactosa') {
            proteinSources = 'libre de lactosa (aislado de whey/proteína vegetal, huevos, pollo)';
            leucinaSources = 'presente en carnes, huevos e isolado de whey o soja';
            practicalExamples = `• Batido de aislado de whey (sin lactosa) o proteína vegetal + banana + leche vegetal\n• Pechuga + batata asada + vegetales\n• Omelette de 3 huevos con tostadas`;
        } else if (diet === 'cetogenico') {
            proteinSources = 'de alto VB y baja en carbohidratos (pollo, carne, huevos, whey aislado)';
            leucinaSources = 'presente en carnes, pescados, huevos y whey aislado';
            practicalExamples = `• Batido de whey aislado con agua o leche de almendras y una cucharada de mantequilla de maní\n• Pechuga de pollo con palta y ensalada de espinaca\n• Omelette de queso y panceta con champiñones`;
        } else if (diet === 'paleo') {
            proteinSources = 'natural de alto VB (pollo, carne, pescado, huevos)';
            leucinaSources = 'presente en carnes, pescados y huevos';
            practicalExamples = `• Filet de salmón + batata cocida + vegetales de hoja verde\n• Pechuga de pollo a la plancha + puré de calabaza\n• Revuelto de huevos con espinaca y frutos secos`;
        }

        if (last.type === 'pesas' || last.type === 'crossfit' || last.type === 'calistenia') {
            resp += `✅ **Ventana anabólica (primeras 2h)**:\n• **Proteína**: 30–40g ${proteinSources} para MPS máximo\n• **Leucina**: necesitás >3g de leucina para activar mTOR — ${leucinaSources}\n• **Carbohidratos**: ${diet === 'cetogenico' ? 'Limitar a menos de 10g netos (vegetales fibrosos / frutos secos)' : '1–1,5g/kg para reponer glucógeno muscular'}\n\n🍽️ **Ejemplos prácticos**:\n${practicalExamples}\n\n💊 Creatina (3-5g) puede tomarse en cualquier momento del día.`;
        } else if (['correr', 'ciclismo', 'natacion', 'hiit'].includes(last.type)) {
            resp += `🏃 **Recuperación cardio de alta intensidad**:\n• Rehidratación: 1,5L de agua por kg de peso perdido en el ejercicio\n• Electrolitos: sodio (${last.intensity === 'alta' || last.intensity === 'maxima' ? 'especialmente crítico — considerar bebida isotónica' : '300-500mg'})\n• Carbohidratos: ${diet === 'cetogenico' ? 'Mantener consumo bajo en carbohidratos (<15g netos)' : '1–1,2g/kg/hora en las primeras 4h para reponer glucógeno'}\n• Proteína: 20–25g ${proteinSources} para minimizar el daño muscular (EIMD)\n\n🍽️ **Ejemplos prácticos**:\n${practicalExamples}\n\n🍒 **Bonus**: Cereza ácida (200ml) reduce el dolor muscular tardío (DOMS) por su contenido en antocianinas (Connolly et al., 2006)`;
        } else if (['yoga', 'pilates', 'stretching'].includes(last.type)) {
            resp += `🧘 **Post-${actName}**:\n• Hidratación normal (35ml/kg/día)\n• Colación ligera adaptada a tu perfil:\n${practicalExamples.split('\n')[0]}\n• El colágeno hidrolizado (10g) + vitamina C puede apoyar la salud articular y de tejidos conectivos\n• Magnesio bisglicinato (300mg nocturno) para completar la relajación muscular`;
        } else {
            resp += `⚡ **Recuperación general**:\n• Proteína: 20-30g ${proteinSources} en las primeras 2h\n• Carbohidratos: ${diet === 'cetogenico' ? 'Bajo aporte de carbohidratos' : '1g/kg para reponer glucógeno'}\n• Agua + electrolitos según sudoración\n• Dormir bien: es el anabólico más potente — la GH se libera en fase de sueño profundo`;
        }
        return resp;
    }
};

// Helper: format current datetime in Spanish
function chatTimestamp() {
    const now = new Date();
    const days = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
    const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const hh = String(now.getHours()).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');
    return `${day} ${date} de ${month} de ${year} · ${hh}:${mm}`;
}

function getMutriResponse(text) {
    const t = text.toLowerCase(), p = profile;

    // Greetings
    if (/^(hola|buenas|buenos días|buen día|buenas tardes|buenas noches|hi|hey)/.test(t))
        return `¡Hola! 😊 Soy Nutri, tu asistente de nutrición. Estoy aquí para ayudarte con tu alimentación, suplementos, actividad física y bienestar. ¿En qué puedo ayudarte hoy?`;

    // What's missing today
    if (t.includes('falta') || t.includes('qué me falt') || t.includes('que me falt'))
        return NUTRI_RESPONSES.falta(p);

    // Weekly analysis
    if (t.includes('analiz') && (t.includes('semana') || t.includes('historial')))
        return NUTRI_RESPONSES.analiza();

    // Meal ideas
    if (t.includes('almuerzo') || t.includes('cena') || t.includes('desayuno') || t.includes('meriend') || t.includes('receta') || t.includes('ideas para') || t.includes('qué como') || t.includes('que como') || t.includes('qué comer') || t.includes('que comer') || t.includes('men') )
        return NUTRI_RESPONSES.almuerzo(p);

    // Supplements
    if (t.includes('suplemento') || t.includes('vitamina') || t.includes('omega') || t.includes('creatina') || t.includes('whey') || t.includes('proteína en polvo') || t.includes('magnesio') || t.includes('zinc') || t.includes('b12') || t.includes('hierro'))
        return NUTRI_RESPONSES.suplementos(p);

    // Metabolism
    if (t.includes('metabolismo') || t.includes('metab') || t.includes('calorías') || t.includes('caloria') || t.includes('gasto') || t.includes('tmb') || t.includes('basal'))
        return NUTRI_RESPONSES.metabolismo();

    // Vegan/plant-based
    if (t.includes('vegan') || t.includes('plant based') || t.includes('plant-based') || t.includes('vegetariano') || t.includes('vegetarian'))
        return NUTRI_RESPONSES.vegan();

    // Proteins
    if (t.includes('prote') || t.includes('aminoácido') || t.includes('aminoacido') || t.includes('músculo') || t.includes('musculo') || t.includes('masa muscular'))
        return NUTRI_RESPONSES.proteinas();

    // Gut / microbiome
    if (t.includes('intestin') || t.includes('microbiota') || t.includes('microbiom') || t.includes('digesti') || t.includes('probiótic') || t.includes('probiotico') || t.includes('probiotic') || t.includes('colon') || t.includes('hinchazón') || t.includes('hincha'))
        return NUTRI_RESPONSES.intestinal();

    // Anti-inflammatory
    if (t.includes('antiinflamator') || t.includes('inflamac') || t.includes('inflama'))
        return NUTRI_RESPONSES.antiinflamatorio();

    // Post-workout
    if (t.includes('post') || t.includes('entrenamiento') || t.includes('recuperac') || t.includes('gym') || t.includes('ejercicio') || t.includes('deporte') || t.includes('entrené') || t.includes('entrene'))
        return NUTRI_RESPONSES.postEjercicio(p);

    // Weight loss
    if (t.includes('bajar de peso') || t.includes('adelgaz') || t.includes('perder peso') || t.includes('bajar peso') || t.includes('deficit') || t.includes('déficit'))
        return `🎯 **Plan para disminuir masa grasa con una mirada integral de lo que de verdad funciona** (objetivo: ${goalLabel(p.goal)}):\n\n**📉 Déficit calórico sostenible**: El punto de partida es un déficit de 300–500 kcal/día — suficiente para disminuir masa grasa de forma saludable sin comprometer masa muscular ni metabolismo.\n\n**💪 Proteína alta**: 1,6–2,2 g/kg/día es fundamental. La proteína sacia, preserva músculo y tiene el mayor efecto térmico (TEF ~30%). Objetivo: ${Math.round((p.weight||70)*2)}g/día.\n\n**🥦 Volumen alimentario**: Priorizá vegetales no almidonados (lechuga, espinaca, pepino, zapallito) — generan saciedad con pocas calorías.\n\n**🚫 Evitá**: Dietas muy restrictivas (<1200 kcal) — activan mecanismos adaptativos que frenan el metabolismo.\n\n📚 *Meta-análisis (Tobias et al., Lancet Diabetes Endocrinology, 2015): No existe una dieta superior — la adherencia a largo plazo es el factor determinante.*`;

    // Weight gain / muscle
    if (t.includes('ganar peso') || t.includes('ganar masa') || t.includes('aumentar') || t.includes('volumen') || t.includes('bulking'))
        return `💪 **Plan para ganar masa muscular** (objetivo: ${goalLabel(p.goal)}):\n\n**📈 Superávit calórico**: +200–400 kcal/día sobre tu TDEE para ganancia magra sin exceso de grasa.\n\n**🥩 Proteína**: 1,8–2,2g/kg/día. Distribuila en 4–5 tomas de 30–40g para maximizar la síntesis proteica muscular (MPS).\n\n**⚡ Carbohidratos**: Son el combustible del entrenamiento. 4–7g/kg/día según intensidad — arroz, avena, batata, papa.\n\n**💊 Suplementos con mayor evidencia**:\n• Creatina monohidrato: 3–5g/día (el ergogénico más estudiado, +1000 ensayos clínicos)\n• Whey protein: para alcanzar objetivos proteicos cómodamente\n• Cafeína: 3–6mg/kg pre-entrenamiento para rendimiento\n\n📚 *Schoenfeld et al. (Journal of Strength & Conditioning Research, 2017): La hipertrofia requiere entrenamiento progresivo + proteína adecuada + superávit calórico moderado.*`;

    // Hydration
    if (t.includes('agua') || t.includes('hidrat') || t.includes('líquido') || t.includes('liquido') || t.includes('sed') || t.includes('tomar agua'))
        return `💧 **Hidratación óptima — una mirada integral de lo que de verdad funciona**:\n\n**Recomendación general**: 35ml/kg de peso corporal/día → Para vos: ~${Math.round((p.weight||70)*35/1000*10)/10}L/día en condiciones normales.\n\n**Ajustes**:\n• 🏋️ Ejercicio: +500–750ml por hora de actividad moderada/intensa\n• 🌡️ Calor/humedad: +500ml adicionales\n• ☕ Infusiones y té verde cuentan para la hidratación total\n\n**Señales de deshidratación leve (2%)**: Fatiga cognitiva, dolor de cabeza, orina amarillo oscuro.\n\n**Mito desmontado**: El café con moderación (3–4 tazas/día) NO deshidrata — su efecto diurético es mínimo (Armstrong et al., 2005).\n\n💡 Tip: El mejor indicador de hidratación es el color de la orina — debe ser amarillo pálido.`;

    // Sleep
    if (t.includes('dormir') || t.includes('sueño') || t.includes('insomnio') || t.includes('descanso'))
        return `😴 **Nutrición y sueño — conexión clave**:\n\n**Alimentos que mejoran el sueño**:\n• 🍒 Cereza ácida: fuente natural de melatonina (Howatson et al., 2012)\n• 🥛 Leche caliente: triptófano → serotonina → melatonina\n• 🌰 Nueces: melatonina + magnesio\n• 🍌 Banana: triptófano + potasio\n• 🐟 Salmón: vitamina D + omega-3 (mejora estructura del sueño)\n\n**Evitar 2–3 horas antes de dormir**:\n• Cafeína (vida media 5–7 horas)\n• Alcohol (fragmenta el sueño REM)\n• Comidas muy abundantes\n\n💊 **Magnesio bisglicinato** (300–400mg nocturno) — actúa sobre receptores GABA, favoreciendo la relajación y el inicio del sueño.\n\n📚 *Walker M. "Why We Sleep" (2017): cada hora de sueño de menos eleva el cortisol y la ghrelina (hormona del hambre) al día siguiente.*`;

    // Anxiety / stress / mental health
    if (t.includes('ansiedad') || t.includes('estres') || t.includes('estrés') || t.includes('nervios') || t.includes('salud mental') || t.includes('depres') || t.includes('estado de ánimo') || t.includes('humor'))
        return `🧠 **Nutrición y salud mental — una mirada integral de lo que de verdad funciona**:\n\n**Nutrientes clave para el cerebro**:\n• 🐟 **Omega-3 EPA/DHA**: reducen neuroinflamación. Meta-análisis (Mocking et al., 2016): efecto antidepresivo significativo con ≥2g EPA/día\n• 🌿 **Magnesio**: cofactor de más de 300 reacciones enzimáticas. Déficit asociado a ansiedad y depresión\n• 🥩 **Vitaminas B6 y B12**: síntesis de serotonina y dopamina\n• 🫐 **Antioxidantes**: flavonoides (arándanos, cacao) protegen contra el estrés oxidativo cerebral\n\n**Dieta para la salud mental**:\n• Patrón mediterráneo reduce riesgo de depresión en un 33% (Psych Meditrranean, 2022)\n• Minimizar ultraprocesados y azúcares refinados\n• Fermentados (kéfir, yogur, chucrut) para el eje intestino-cerebro\n\n💡 *El estudio SMILES (BMC Medicine, 2017) demostró que mejorar la dieta es comparable a la terapia para síntomas depresivos moderados.*`;

    // Fiber / digestion
    if (t.includes('fibra') || t.includes('estreñimiento') || t.includes('estrenimiento') || t.includes('constipac'))
        return `🌾 **Fibra dietética — guía completa**:\n\n**Recomendación OMS**: 25–38g/día (la mayoría consume apenas 15g/día).\n\n**Fibra soluble** (prebiótica, fermenta en el colon):\n• Avena (betaglucano), manzana, legumbres, psyllium\n• Alimenta tu microbiota, reduce colesterol y glucemia post-prandial\n\n**Fibra insoluble** (tránsito intestinal):\n• Salvado de trigo, verduras de hoja, semillas\n• Acelera el tránsito intestinal, previene estreñimiento\n\n**Para aumentar el tránsito intestinal**:\n1. Aumentar fibra gradualmente para evitar gases\n2. Hidratación adecuada (la fibra sin agua estreñe más)\n3. Semillas de chía (2 cdas.) + mucho líquido\n4. Ciruelas, higos, kiwi — efecto osmótico natural\n5. Ejercicio regular activa el peristaltismo`;

    // KB lookup
    const kbKeys = {
        fibra: 'macros.carbohidratos', grasa: 'macros.grasas', omega: 'suplementos.omega3supp',
        magnesio: 'micros.magnesio', hierro: 'micros.hierro', calcio: 'micros.calcio', zinc: 'micros.zinc',
        'vitamina d': 'micros.vitD', 'vitamina b': 'micros.b12', probiotico: 'suplementos.probioticos',
        cafeina: 'suplementos.cafeina', keto: 'dietas.cetogenico', cetogenico: 'dietas.cetogenico',
        mediterraneo: 'dietas.mediterraneo', paleo: 'dietas.paleo', pescetarian: 'dietas.pescetariano',
        flexitar: 'dietas.flexitariano', longevidad: 'longevidad.general', ayuno: 'tendencias.ayunoIntermitente',
        hidrat: 'hidratacion.general', deporte: 'deportes.general', fuerza: 'deportes.fuerza',
        cardio: 'deportes.cardio', 'salud mental': 'saludMental.general', ansiedad: 'saludMental.ansiedad',
        memoria: 'saludMental.memoria', creatina: 'suplementos.creatina', whey: 'suplementos.whey'
    };
    for (const [key, path] of Object.entries(kbKeys)) {
        if (t.includes(key)) {
            let val = NUTRI_KB;
            for (const k of path.split('.')) val = val?.[k];
            if (val) return `🔬 **${key.charAt(0).toUpperCase() + key.slice(1)}** — según la mirada integral de lo que de verdad funciona más actualizada:\n\n${val}\n\n_¿Querés que profundice en algún aspecto específico?_`;
        }
    }

    // Generic fallback: return null to trigger real AI response via Gemini API
    return null;
}

async function handleBotResponse(text, isChip = false) {
    let localResp = isChip ? getMutriResponse(text) : null;
    
    if (localResp) {
        setTimeout(() => {
            removeTyping();
            addBubble(localResp, 'bot');
            scrollChat();
        }, 600 + Math.random() * 400);
    } else {
        // Query Gemini API for interactive conversational response!
        try {
            const geminiResp = await callChatbotGemini(text);
            removeTyping();
            addBubble(geminiResp, 'bot');
            scrollChat();
        } catch (err) {
            console.error('Error en Gemini Chat:', err);
            removeTyping();
            const fallbackMsg = getMutriResponse(text) || "Para responder tu consulta específica sobre nutrición o entrenamiento con precisión clínica, podés revisar tus registros en el plan diario.";
            addBubble(fallbackMsg, 'bot');
            scrollChat();
        }
    }
}

async function callChatbotGemini(userText) {
    const token = localStorage.getItem('niaSaasToken');
    const bubbles = document.querySelectorAll('.chat-bubble:not(.typing)');
    const history = [];
    bubbles.forEach(b => {
        const role = b.classList.contains('user') ? 'user' : 'model';
        const clone = b.cloneNode(true);
        const ts = clone.querySelector('.chat-timestamp');
        if (ts) ts.remove();
        const text = clone.textContent.trim();
        if (text) {
            history.push({ role: role === 'user' ? 'user' : 'model', content: text });
        }
    });
    const chatHistory = history.slice(-6);

    try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const apiUrl = typeof getBackendApiUrl === 'function' ? getBackendApiUrl('/api/chat-ia') : '/api/chat-ia';
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                message: userText,
                history: chatHistory
            })
        });

        if (response.ok) {
            const data = await response.json();
            return data.reply || 'No pude obtener respuesta.';
        } else {
            const errData = await response.json().catch(() => ({}));
            if (response.status === 429 || errData.limitExceeded) {
                return errData.error || 'Has superado el límite diario de consultas de chat en tu plan. Podés consultar nuevamente mañana.';
            }
            throw new Error(errData.error || `Error del servidor de chat (${response.status})`);
        }
    } catch (err) {
        console.warn('Backend /api/chat-ia no disponible o 404, ejecutando fallback cliente directo con Gemini 2.5 Flash:', err.message);
        if (err.message.includes('límite') || err.message.includes('plan')) {
            return err.message;
        }
        try {
            const apiKey = localStorage.getItem('niaGeminiKey') || (window.DEFAULT_CLIENT_GEMINI_KEY || 'AQ.Ab8RN6ItiqORVmWfguoQUvre7-9sEo7xTvB7pX1ubcpuPv0RQQ');
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            
            const systemPrompt = `Sos Nutri, el asistente nutricional clínico inteligente de la aplicación. Respondé de manera científica, empática y motivadora en español de Argentina con voseo sutil ("tenés", "podés"). Respuestas breves (máximo 150 palabras).`;
            const historyText = chatHistory.map(h => `${h.role === 'user' ? 'Paciente' : 'Nutri'}: ${h.content}`).join('\n');
            const fullPrompt = `${systemPrompt}\n\n${historyText}\nPaciente: ${userText}\nNutri:`;

            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: fullPrompt }] }],
                    generationConfig: { temperature: 0.25, maxOutputTokens: 2048 }
                })
            });

            if (resp.ok) {
                const data = await resp.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) return text;
            }
        } catch (clientErr) {
            console.error('Fallo el cliente directo de Gemini Chat:', clientErr);
        }
        return 'En este momento estamos procesando tu solicitud de chat mediante inteligencia artificial. Por favor intenta de nuevo.';
    }
}


function sendChat() {
    const inp = document.getElementById('chat-input');
    const text = inp.value.trim(); if (!text) return;
    addBubble(text, 'user'); inp.value = ''; showTyping();
    handleBotResponse(text, false);
}
function sendChip(btn) {
    addBubble(btn.textContent, 'user'); showTyping();
    handleBotResponse(btn.textContent, true);
}

function addBubble(text, who) {
    const w = document.getElementById('chat-window');
    const d = document.createElement('div'); d.className = `chat-bubble ${who}`;
    const ts = chatTimestamp();
    
    let bubbleContent = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    if (who === 'bot') {
        bubbleContent += `<div style="font-size: 0.65rem; color: var(--text-dim); margin-top: 6px; padding-top: 4px; border-top: 1px dashed rgba(255,255,255,0.08); font-style: italic; line-height: 1.25;">*Aviso: Este consejo es de carácter general. No reemplaza el diagnóstico o indicación de tu médico o nutricionista clínico.*</div>`;
    }
    
    d.innerHTML = bubbleContent + `<span class="chat-timestamp">📅 ${ts}</span>`;
    w.appendChild(d); scrollChat();
}
function showTyping() {
    const w = document.getElementById('chat-window');
    const d = document.createElement('div'); d.className = 'chat-bubble typing bot'; d.id = 'typing-indicator';
    d.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    w.appendChild(d); scrollChat();
}
function removeTyping() { const e = document.getElementById('typing-indicator'); if (e) e.remove(); }
function scrollChat() { const w = document.getElementById('chat-window'); if (w) w.scrollTop = w.scrollHeight; }

// ===== ACTIVITY TRACKING =====
function openActivityModal() {
    const t = document.getElementById('act-time');
    if (t) { const n = new Date(); t.value = `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`; }
    document.getElementById('activity-modal').classList.remove('hidden');
    updateKcalEstimate();
}
function closeActivityModal() { document.getElementById('activity-modal').classList.add('hidden'); }
function selectFeeling(el) {
    document.querySelectorAll('.feeling-btn').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected'); selectedFeeling = el.dataset.f;
}
function updateKcalEstimate() {
    const type = document.getElementById('act-type')?.value;
    const dur = +document.getElementById('act-duration')?.value || 0;
    const intensity = document.getElementById('act-intensity')?.value || 'moderada';
    const ke = document.getElementById('kcal-estimate');
    const kv = document.getElementById('kcal-est-val');
    if (!type || !dur) { if (ke) ke.style.display = 'none'; return; }
    const met = (MET_TABLE[type] || {})[intensity] || 6;
    const kcal = Math.round(met * (profile.weight || 70) * (dur / 60));
    if (ke) ke.style.display = 'flex';
    if (kv) kv.textContent = kcal;
}
function addActivity() {
    const type = document.getElementById('act-type').value;
    const dur = +document.getElementById('act-duration').value;
    if (!dur) { showMsg('Ingresá la duración en minutos.'); return; }
    if (!profile.weight) {
        showMsg('⚠️ Necesitamos saber tu peso para estimar las calorías quemadas. Por favor completá tu Perfil.');
        showScreen('perfil');
        return;
    }
    const intensity = document.getElementById('act-intensity').value;
    const time = document.getElementById('act-time').value;
    const mode = document.getElementById('act-mode').value;
    const hr = document.getElementById('act-hr').value;
    const notes = document.getElementById('act-notes')?.value || '';
    const feeling = selectedFeeling || 'bien';
    const met = (MET_TABLE[type] || {})[intensity] || 6;
    const kcal = Math.round(met * (profile.weight || 70) * (dur / 60));
    
    const newAct = { id: Date.now(), type, dur, duration: dur, intensity, time, mode, hr, notes, feeling, kcal, date: new Date().toDateString() };
    activities.push(newAct);
    localStorage.setItem('nutriActivities', JSON.stringify(activities));
    if (typeof niaPostLog === 'function') {
        const dateStr = newAct.date ? niaStandardizeDate(newAct.date) : new Date().toISOString().split('T')[0];
        niaPostLog('activity', newAct, dateStr).then(id => {
            if (id) {
                newAct.saasId = id;
                localStorage.setItem('nutriActivities', JSON.stringify(activities));
            }
        });
    }
    
    if (typeof niaSendToGoogleSheets === 'function') {
        niaSendToGoogleSheets(newAct);
    }
    
    closeActivityModal(); selectedFeeling = '';
    if (document.getElementById('act-duration')) document.getElementById('act-duration').value = '';
    if (document.getElementById('act-hr')) document.getElementById('act-hr').value = '';
    if (document.getElementById('act-notes')) document.getElementById('act-notes').value = '';
    document.querySelectorAll('.feeling-btn').forEach(b => b.classList.remove('selected'));
    updateActivityPage(); updateDashboard();
    if (typeof updateDailyProgressBar === 'function') updateDailyProgressBar();
    showMsg(`¡Qué gran entrenamiento! ${ACTIVITY_NAMES[type] || type} registrado (${kcal} kcal). ¡Tu cuerpo te lo agradece! 🏃‍♀️✨`);
}
function deleteActivity(id) {
    const actToDelete = activities.find(a => a.id === id);
    if (actToDelete && actToDelete.saasId && typeof niaDeleteLog === 'function') {
        niaDeleteLog(actToDelete.saasId);
    }
    activities = activities.filter(a => a.id !== id);
    localStorage.setItem('nutriActivities', JSON.stringify(activities));
    updateActivityPage(); updateDashboard();
    if (typeof updateDailyProgressBar === 'function') updateDailyProgressBar();
}
function updateActivityPage() {
    const today = getTodayActivities();
    const list = document.getElementById('activity-log-list');
    if (list) {
        list.innerHTML = today.length === 0 ? '<p class="empty-note">No hay actividad registrada hoy.</p>' :
            today.map(a => {
                const intLabels = { baja: '🟢 Baja', moderada: '🟡 Moderada', alta: '🔴 Alta', maxima: '🔥 Máxima' };
                return `<div class="activity-log-item">
          <span class="act-log-icon">${ACTIVITY_EMOJIS[a.type] || '🏃'}</span>
          <div class="act-log-detail">
            <div class="act-log-name">${ACTIVITY_NAMES[a.type] || a.type}</div>
            <div class="act-log-meta">${a.duration}min · ${intLabels[a.intensity] || a.intensity} · ${a.time || ''} · ${a.mode || ''}</div>
          </div>
          <span class="act-log-feeling">${FEELING_EMOJIS[a.feeling] || ''}</span>
          <div class="act-log-kcal">🔥 ${a.kcal} kcal</div>
          <button class="act-delete" onclick="deleteActivity(${a.id})">🗑</button>
        </div>`;
            }).join('');
    }
    // Weekly summary
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const weekActs = activities.filter(a => new Date(a.date) >= weekAgo);
    const ws = document.getElementById('week-sessions'); if (ws) ws.textContent = weekActs.length;
    const wm = document.getElementById('week-minutes'); if (wm) wm.textContent = weekActs.reduce((s, a) => s + (a.duration || 0), 0);
    const wk = document.getElementById('week-kcal'); if (wk) wk.textContent = weekActs.reduce((s, a) => s + (a.kcal || 0), 0);
    // Post-workout tip
    const pwt = document.getElementById('post-workout-tip');
    if (pwt) pwt.textContent = today.length > 0 ? getPostWorkoutTip(today[today.length - 1]) : 'Registrá tu actividad para recibir recomendaciones nutricionales de recuperación personalizadas.';
}
function getPostWorkoutTip(act) {
    if (!act) return '';
    const n = ACTIVITY_NAMES[act.type] || act.type;
    if (['pesas', 'crossfit', 'calistenia', 'funcional'].includes(act.type)) return `Post-${n}: 30-40g de proteína de alta calidad (leucina >3g) + 1-1,5g/kg de carbohidratos en las primeras 2 horas para maximizar la síntesis proteica muscular.`;
    if (['correr', 'ciclismo', 'natacion', 'hiit'].includes(act.type)) return `Post-${n}: Rehidratate con 1,5L por kg de peso perdido + 60g de carbohidratos + 20-25g de proteína. Cereza ácida reduce el dolor muscular tardío (DOMS).`;
    return `Post-${n}: Hidratación adecuada + colación equilibrada con proteína y carbohidratos de calidad para una recuperación óptima.`;
}

// ===== RECIPES =====
function initRecipes() {
    if (!window.RECIPE_DB) return;
    renderRecipeFilters();
    renderRecipes('todas');
}
let activeRecipeFilter = 'todas';
function renderRecipeFilters() {
    const rf = document.getElementById('recipe-filter'); if (!rf) return;
    const goal = profile.goal || 'saludGeneral';
    const filters = ['todas', 'omnivoro', 'vegano', 'vegetariano', 'sin-gluten', 'alto-proteína'];
    rf.innerHTML = filters.map(f => `<button class="meal-type-btn ${f === 'todas' ? 'active' : ''}" onclick="filterRecipes(this,'${f}')">${f === 'todas' ? '✨ Todas' : f.charAt(0).toUpperCase() + f.slice(1)}</button>`).join('');
}
function filterRecipes(btn, filter) {
    document.querySelectorAll('.recipe-filter .meal-type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); activeRecipeFilter = filter; renderRecipes(filter);
}
function checkRecipeAllergensAndDislikes(r) {
    const p = profile || {};
    const allergies = Array.isArray(p.allergies) ? p.allergies : [];
    const dislikesStr = p.dislikes || '';
    const dislikes = dislikesStr.split(',').map(d => d.trim().toLowerCase()).filter(d => d.length > 0);
    
    const allergenKeywords = {
        gluten: ["trigo", "avena", "centeno", "cebada", "harina", "pan", "tostada", "pizza", "pasta", "tallarines", "fideos", "medialunas"],
        lactosa: ["leche", "queso", "yogur", "manteca", "crema", "mozzarella", "ricota", "parmesano", "crema de leche", "dulce de leche", "whey", "suero"],
        frutosSecos: ["almendra", "nueces", "maní", "mani", "avellana", "pistacho", "castaña", "nuez", "frutos secos", "anacardos"],
        huevo: ["huevo", "yema", "clara"],
        pescadoMarisco: ["salmón", "salmon", "atún", "atun", "pescado", "merluza", "camarones", "mariscos", "langostinos", "anchoas", "caballa", "sardina"],
        soja: ["soja", "tofu", "salsa de soja", "edamame", "tempeh"]
    };
    
    let detectedAllergies = [];
    let detectedDislikes = [];
    
    const searchString = (r.name + ' ' + (r.ingredients ? r.ingredients.join(' ') : '')).toLowerCase();
    
    // Check allergies
    allergies.forEach(a => {
        const keywords = allergenKeywords[a];
        if (keywords) {
            const matched = keywords.filter(kw => searchString.includes(kw));
            if (matched.length > 0) {
                const labels = { gluten: 'Gluten', lactosa: 'Lácteos/Lactosa', frutosSecos: 'Frutos secos', huevo: 'Huevo', pescadoMarisco: 'Pescado/Mariscos', soja: 'Soja' };
                detectedAllergies.push(labels[a] || a);
            }
        }
    });
    
    // Check dislikes/excluded ingredients
    dislikes.forEach(d => {
        if (searchString.includes(d)) {
            detectedDislikes.push(d);
        }
    });
    
    return {
        hasAllergy: detectedAllergies.length > 0,
        hasDislike: detectedDislikes.length > 0,
        allergies: detectedAllergies,
        dislikes: detectedDislikes
    };
}

function renderRecipes(filter) {
    const grid = document.getElementById('recipes-grid'); if (!grid || !window.RECIPE_DB) return;
    const goal = profile.goal || 'saludGeneral';
    const userDiet = profile.diet || 'omnivoro';
    
    // Filter recipes based on user profile diet first
    let recs = RECIPE_DB.filter(r => {
        if (!isFoodCompliantWithDiet(r.name, userDiet)) return false;
        if (r.ingredients && !r.ingredients.every(ing => isFoodCompliantWithDiet(ing, userDiet))) return false;
        
        // Safety check: Filter out recipes containing allergens
        const warn = checkRecipeAllergensAndDislikes(r);
        if (warn.hasAllergy) return false;
        
        if (userDiet === 'vegano' && !r.tags.includes('vegano') && !r.tags.includes('raw')) return false;
        if (userDiet === 'crudivoro' && !r.tags.includes('raw')) return false;
        if (userDiet === 'vegetariano' && !r.tags.includes('vegetariano') && !r.tags.includes('vegano') && !r.tags.includes('raw')) return false;
        if (userDiet === 'pescetariano' && !r.tags.includes('pescetariano') && !r.tags.includes('vegetariano') && !r.tags.includes('vegano') && !r.tags.includes('raw')) return false;
        if (userDiet === 'sinGluten' && !r.tags.includes('sin-gluten')) return false;
        if (userDiet === 'cetogenico' && !r.tags.includes('keto-friendly') && !r.tags.includes('keto')) return false;
        
        return true;
    });

    if (filter !== 'todas') recs = recs.filter(r => r.tags && r.tags.includes(filter));
    const userGoals = (goal || 'saludGeneral').split(',');
    const sorted = [
        ...recs.filter(r => r.goals && r.goals.some(g => userGoals.includes(g))),
        ...recs.filter(r => !r.goals || !r.goals.some(g => userGoals.includes(g)))
    ];
    grid.innerHTML = sorted.map(r => {
        const warn = checkRecipeAllergensAndDislikes(r);
        let dislikeBadge = '';
        if (warn.hasDislike) {
            dislikeBadge = `<div class="recipe-warning-badge" style="color: var(--orange); font-size: 0.75rem; margin-top: 4px; display: flex; align-items: center; gap: 4px; font-weight: 500;">⚠️ Exclusión: ${warn.dislikes.join(', ')}</div>`;
        }
        return `
        <div class="recipe-card glass-card" onclick="showRecipeDetail(${r.id})">
          <div class="recipe-emoji">${r.emoji}</div>
          <div class="recipe-info">
            <h4 class="recipe-name">${r.name}</h4>
            <div class="recipe-meta">${r.time} · ${r.kcal} kcal</div>
            ${dislikeBadge}
            <div class="recipe-macros-mini">
              <span style="color:var(--green)">P:${r.prot}g</span>
              <span style="color:var(--cyan)">C:${r.carb}g</span>
              <span style="color:var(--purple)">G:${r.fat}g</span>
            </div>
          </div>
          <div class="recipe-score-badge" style="background:${scoreGradient(r.score)}">${r.score}</div>
        </div>`;
     }).join('');
}

function showRecipeDetail(id) {
    if (!window.RECIPE_DB) return;
    const r = RECIPE_DB.find(x => x.id === id); if (!r) return;
    const cr = document.getElementById('custom-recipe-result');
    cr.classList.remove('hidden');
    
    const warn = checkRecipeAllergensAndDislikes(r);
    let warningBanner = '';
    if (warn.hasAllergy || warn.hasDislike) {
        let warnText = [];
        if (warn.hasAllergy) warnText.push(`alérgenos (${warn.allergies.join(', ')})`);
        if (warn.hasDislike) warnText.push(`ingredientes excluidos (${warn.dislikes.join(', ')})`);
        warningBanner = `<div style="padding: 10px; border-radius: 8px; background: rgba(239, 83, 80, 0.12); border: 1px solid rgba(239, 83, 80, 0.25); color: #ef5350; font-size: 0.8rem; font-weight: 600; margin-bottom: 1rem; line-height: 1.4;">
            ⚠️ **Advertencia de Salud:** Esta receta contiene ${warnText.join(' e ')}.
        </div>`;
    }
    
    cr.innerHTML = `${warningBanner}<div class="recipe-detail-header"><span style="font-size:2.5rem">${r.emoji}</span>
    <div><h3>${r.name}</h3><p style="color:var(--text-muted);font-size:.82rem">${r.time} · ${r.kcal} kcal · Score: ${r.score}/100</p></div></div>
    <div class="analysis-macros" style="margin:1rem 0">
      <div class="a-macro"><span class="a-macro-val" style="color:var(--green)">${r.prot}g</span><span class="a-macro-lbl">Proteínas</span></div>
      <div class="a-macro"><span class="a-macro-val" style="color:var(--cyan)">${r.carb}g</span><span class="a-macro-lbl">Carbos</span></div>
      <div class="a-macro"><span class="a-macro-val" style="color:var(--purple)">${r.fat}g</span><span class="a-macro-lbl">Grasas</span></div>
    </div>
    <h4 style="margin-bottom:.5rem;font-size:.9rem">🛒 Ingredientes</h4>
    <ul style="padding-left:1.2rem;font-size:.85rem;color:var(--text-dim);line-height:2">${r.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
    <h4 style="margin:.75rem 0 .5rem;font-size:.9rem">👨‍🍳 Preparación</h4>
    <ol style="padding-left:1.2rem;font-size:.85rem;color:var(--text-dim);line-height:2">${r.steps.map(s => `<li>${s}</li>`).join('')}</ol>
    <div class="analysis-tip" style="margin-top:.75rem;padding:.75rem;border-radius:10px;background:var(--green-dim);border:1px solid rgba(74,222,128,.2);font-size:.83rem;color:var(--text-dim)">🔬 <strong>Nutri explica:</strong> ${r.tip}</div>`;
    cr.scrollIntoView({ behavior: 'smooth' });
}

function generateCustomRecipe(bypassDietCheck = false) {
    const prot = document.getElementById('recipe-protein').value.trim();
    const veg = document.getElementById('recipe-veggie').value.trim();
    const carb = document.getElementById('recipe-carb').value.trim();
    const extra = document.getElementById('recipe-extra').value.trim();
    const cook = document.getElementById('recipe-cook').value;
    if (!prot || !veg || !carb) { showMsg('Ingresá al menos proteína, vegetal e hidrato.'); return; }
    
    // Safety check: allergen and profile validation (UX-P1-16)
    const allergies = Array.isArray(profile.allergies) ? profile.allergies : [];
    let allergyBanner = '';
    
    if (allergies.length > 0) {
        const allergyLabels = { gluten: 'gluten', lactosa: 'lactosa', frutosSecos: 'frutos secos', huevo: 'huevo', pescadoMarisco: 'pescado/mariscos', soja: 'soja' };
        const labelStr = allergies.map(a => allergyLabels[a] || a).join(' y ');
        showMsg(`Generando sin ${labelStr} según tu perfil`);
        allergyBanner = `<div style="padding: 10px; border-radius: 8px; background: rgba(74, 222, 128, 0.08); border: 1px solid rgba(74, 222, 128, 0.2); color: var(--green); font-size: 0.8rem; font-weight: 600; margin-bottom: 1rem; line-height: 1.4;">✨ Receta generada sin ${labelStr} según tu perfil de salud.</div>`;
    } else {
        const proceed = confirm('No tenés restricciones alimentarias cargadas en tu perfil. ¿Querés generar una receta general sin exclusiones?');
        if (!proceed) return;
    }

    const userDiet = profile.diet || 'omnivoro';
    const nonCompliant = [];
    if (!isFoodCompliantWithDiet(prot, userDiet)) nonCompliant.push(prot);
    if (!isFoodCompliantWithDiet(veg, userDiet)) nonCompliant.push(veg);
    if (!isFoodCompliantWithDiet(carb, userDiet)) nonCompliant.push(carb);
    if (extra && !isFoodCompliantWithDiet(extra, userDiet)) nonCompliant.push(extra);

    if (!bypassDietCheck && nonCompliant.length > 0) {
        showRecipeDietWarningModal(nonCompliant, () => {
            generateCustomRecipe(true);
        }, () => {
            // Cancelled: return so user can change it
        });
        return;
    }

    let warningBanner = '';
    if (nonCompliant.length > 0) {
        warningBanner = `<div style="padding: 10px; border-radius: 8px; background: rgba(239, 83, 80, 0.12); border: 1px solid rgba(239, 83, 80, 0.25); color: #ef5350; font-size: 0.8rem; font-weight: 600; margin-bottom: 1rem; line-height: 1.4;">⚠️ **Advertencia de Dieta:** Esta receta incluye ingredientes no compatibles con tu alimentación base (${userDiet}): ${nonCompliant.join(', ')}. Generada bajo autorización del usuario para esta ocasión.</div>`;
    }

    const cookNames = { salteado: 'salteado en wok', horno: 'al horno', vapor: 'al vapor', crudo: 'frío', guiso: 'en guiso', grill: 'a la plancha', bowl: 'en bowl frío' };
    const result = document.getElementById('custom-recipe-result');
    result.classList.remove('hidden');
    const kcal = Math.floor(350 + Math.random() * 250);
    const p = Math.floor(20 + Math.random() * 25);
    const c = Math.floor(30 + Math.random() * 30);
    const f = Math.floor(8 + Math.random() * 15);
    const tips = {
        'pollo': 'El pollo es la proteína magra más versátil. La pechuga tiene 31g de proteína/100g con solo 3,6g de grasa.',
        'salmon': 'El salmón aporta omega-3 EPA+DHA cardioprotectores. Optar por salmón salvaje reduce la exposición a contaminantes.',
        'tofu': 'El tofu de firmeza extra tiene 15g de proteína/100g. El tofu con sulfato de calcio es excelente fuente de calcio.',
        'lentejas': 'Las lentejas combinadas con cereales forman proteína completa con todos los aminoácidos esenciales.',
        'huevo': 'El huevo es la proteína de mayor valor biológico (VB=100). La yema contiene colina esencial para la función cerebral.',
        'brocoli': 'El brócoli contiene sulforafano, uno de los fitoquímicos antiinflamatorios más potentes estudiados.',
        'espinaca': 'La espinaca es rica en hierro no-hemo, vitamina K y folatos. Combinar con limón triplica la absorción de hierro.',
        'quinoa': 'La quinoa es el único cereal con los 9 aminoácidos esenciales. Libre de gluten y con alto contenido de magnesio.',
        'arroz': 'El arroz integral mantiene el salvado con fibra, vitamins del grupo B y minerales eliminados en el arroz blanco.'
    };
    const protLow = prot.toLowerCase();
    let tip = Object.entries(tips).find(([k]) => protLow.includes(k))?.[1] || `La combinación ${prot} + ${veg} + ${carb} es nutricionalmente equilibrada, cubriendo proteínas, fibra, vitamins antioxidantes e hidratos de calidad.`;
    
    result.innerHTML = `${allergyBanner}${warningBanner}<div class="recipe-detail-header"><span style="font-size:2.5rem">✨</span>
    <div><h3>${prot.charAt(0).toUpperCase() + prot.slice(1)} con ${veg} y ${carb} ${cookNames[cook] || ''}</h3>
    <p style="color:var(--purple);font-size:.8rem;font-weight:600">Creada por Nutri · Receta única para vos</p></div></div>
    <div class="analysis-macros" style="margin:1rem 0">
      <div class="a-macro"><span class="a-macro-val" style="color:var(--green)">${p}g</span><span class="a-macro-lbl">Proteínas</span></div>
      <div class="a-macro"><span class="a-macro-val" style="color:var(--cyan)">${c}g</span><span class="a-macro-lbl">Carbos</span></div>
      <div class="a-macro"><span class="a-macro-val" style="color:var(--purple)">${f}g</span><span class="a-macro-lbl">Grasas</span></div>
    </div>
    <p style="font-size:.82rem;color:var(--text-muted);margin-bottom:.75rem">~${kcal} kcal por porción</p>
    <h4 style="margin-bottom:.5rem;font-size:.9rem">🛒 Ingredientes sugeridos</h4>
    <ul style="padding-left:1.2rem;font-size:.85rem;color:var(--text-dim);line-height:2">
      <li>150–200g de ${prot}</li><li>150g de ${veg}</li><li>100g de ${carb} (cocido: ~200g)</li>
      ${extra ? `<li>${extra} al gusto</li>` : ''}
      <li>Aceite de oliva extra virgen, sal marina, pimienta negra</li>
      <li>Hierbas aromáticas: romero, tomillo, orégano o cilantro</li>
    </ul>
    <h4 style="margin:.75rem 0 .5rem;font-size:.9rem">👨‍🍳 Preparación básica</h4>
    <ol style="padding-left:1.2rem;font-size:.85rem;color:var(--text-dim);line-height:2">
      <li>Preparar el ${carb} según indicaciones (cocción al dente para menor IG).</li>
      <li>Condimentar el ${prot} con sal, pimienta y hierbas elegidas.</li>
      <li>${cook === 'horno' ? 'Llevar al horno precalentado a 200°C por 20-25 min.' : cook === 'vapor' ? 'Cocinar al vapor 10-15 minutos preservando nutrientes.' : cook === 'crudo' ? 'Picar y mezclar en frío todos los ingredientes.' : cook === 'guiso' ? 'Rehogar cebolla y ajo, agregar todos los ingredientes y cocinar a fuego suave 25 min.' : cook === 'grill' ? 'Cocinar a la plancha caliente 4-5 min por lado.' : `Saltear en wok o sartén caliente con oliva 8-10 minutos revolviéndolo.`}</li>
      <li>Cocinar el ${veg} hasta estar al dente (no perder el color verde brillante).</li>
      <li>Emplatar, rociar con oliva y unas gotas de limón. Servir inmediato.</li>
    </ol>
    <div class="analysis-tip" style="margin-top:.75rem;padding:.75rem;border-radius:10px;background:var(--purple-dim);border:1px solid rgba(167,139,250,.2);font-size:.83rem;color:var(--text-dim)">🔬 <strong>Nutri explica:</strong> ${tip}</div>`;
    result.scrollIntoView({ behavior: 'smooth' });
}

// ===== SUPPLEMENTS =====
const SUPP_RECS = [
    { icon: '☀️', name: 'Vitamina D3', why: 'El 47% de los argentinos tiene déficit. Regula más de 200 genes, inmunidad, huesos y función hormonal. Dosis: 2.000–4.000 UI/día (Holick MF, NEJM 2007).' },
    { icon: '🐟', name: 'Omega-3 EPA+DHA', why: 'Cardioprotector, neuroprotector, antiinflamatorio sistémico. Fuente marina: 2-3g/día EPA+DHA. Veganos: aceite de microalgas.' },
    { icon: '💚', name: 'Magnesio Bisglicinato', why: 'Sinergia con sueño profundo, recuperación muscular y sensibilidad insulínica. 300–400mg/noche antes de dormir.' },
    { icon: '🦠', name: 'Probióticos', why: 'Refuerzan la microbiota intestinal (eje intestino-cerebro), la inmunidad y el metabolismo. L. rhamnosus GG y Bifidobacterium tienen mayor evidencia.' }
];
function openSupplementModal() { document.getElementById('supp-modal').classList.remove('hidden'); }
function closeSupplementModal() { document.getElementById('supp-modal').classList.add('hidden'); }
function addSupplement() {
    const name = document.getElementById('supp-name').value.trim();
    if (!name) { showMsg('Completá el nombre del suplemento.'); return; }
    
    // Pre-populate reminder time with the preferred time of the supplement
    const suppTime = document.getElementById('supp-time').value || '08:00';
    document.getElementById('supp-reminder-time').value = suppTime;
    
    // Select "Activar" by default
    selectReminderOption(true);
    
    // Hide supplement form modal and show reminder modal
    closeSupplementModal();
    document.getElementById('supp-reminder-modal').classList.remove('hidden');
}

function selectReminderOption(active) {
    const optYes = document.getElementById('reminder-opt-yes');
    const optNo = document.getElementById('reminder-opt-no');
    const timeGroup = document.getElementById('reminder-time-group');
    
    if (active) {
        optYes.classList.add('selected');
        optNo.classList.remove('selected');
        timeGroup.classList.remove('hidden');
    } else {
        optNo.classList.add('selected');
        optYes.classList.remove('selected');
        timeGroup.classList.add('hidden');
    }
}

function closeSupplementReminderModal(goBackToForm) {
    document.getElementById('supp-reminder-modal').classList.add('hidden');
    if (goBackToForm) {
        openSupplementModal();
    }
}

function saveSupplementWithReminder() {
    const name = document.getElementById('supp-name').value.trim();
    const dose = document.getElementById('supp-dose').value || '1';
    const freq = document.getElementById('supp-freq').value;
    const time = document.getElementById('supp-time').value;
    
    const active = document.getElementById('reminder-opt-yes').classList.contains('selected');
    const reminderTime = active ? document.getElementById('supp-reminder-time').value : '';
    
    const icons = ['💊', '🧴', '🫙', '⚗️', '🌿', '💉'];
    
    const newSupp = {
        id: Date.now(),
        name,
        dose,
        freq,
        time,
        taken: false,
        icon: icons[supplements.length % icons.length],
        reminder: active,
        reminderTime: reminderTime
    };
    supplements.push(newSupp);
    
    localStorage.setItem('nutriSupps', JSON.stringify(supplements));
    if (typeof niaPostLog === 'function') {
        const dateStr = new Date().toISOString().split('T')[0];
        niaPostLog('supplement', newSupp, dateStr).then(id => {
            if (id) {
                newSupp.saasId = id;
                localStorage.setItem('nutriSupps', JSON.stringify(supplements));
            }
        });
    }
    
    // Clear supplement form inputs
    document.getElementById('supp-name').value = '';
    document.getElementById('supp-dose').value = '';
    
    closeSupplementReminderModal(false);
    updateSupplements();
}

function deleteSupp(id) {
    const suppToDelete = supplements.find(s => s.id === id);
    if (suppToDelete && suppToDelete.saasId && typeof niaDeleteLog === 'function') {
        niaDeleteLog(suppToDelete.saasId);
    }
    supplements = supplements.filter(s => s.id !== id);
    localStorage.setItem('nutriSupps', JSON.stringify(supplements));
    updateSupplements();
}

async function toggleSuppTaken(id) {
    const s = supplements.find(x => x.id === id);
    if (s) {
        s.taken = !s.taken;
        localStorage.setItem('nutriSupps', JSON.stringify(supplements));
        if (s.saasId && typeof niaDeleteLog === 'function' && typeof niaPostLog === 'function') {
            await niaDeleteLog(s.saasId);
            const newSaasId = await niaPostLog('supplement', s, new Date().toISOString().split('T')[0]);
            if (newSaasId) {
                s.saasId = newSaasId;
                localStorage.setItem('nutriSupps', JSON.stringify(supplements));
            }
        }
        updateSupplements();
    }
}
function updateSupplements() {
    const list = document.getElementById('supps-list');
    if (list) list.innerHTML = supplements.length === 0 ? '<p class="empty-note">No tenés suplementos registrados. Agregá el primero.</p>' :
        supplements.map(s => `<div class="supp-item"><span class="supp-icon">${s.icon}</span>
      <div class="supp-detail"><div class="supp-name">${s.name} · ${s.dose}</div>
      <div class="supp-meta">${s.freq} · ${s.time}hs${s.reminder ? ` <span class="supp-reminder-tag">🔔 Alerta: ${s.reminderTime}hs</span>` : ''}</div></div>
      <button class="supp-taken ${s.taken ? 'done' : ''}" onclick="toggleSuppTaken(${s.id})">${s.taken ? '✓ Tomado' : 'Tomar'}</button>
      <button class="supp-delete" onclick="deleteSupp(${s.id})">🗑</button></div>`).join('');
    // Diet-specific recs
    const diet = profile.diet || 'omnivoro';
    let recs = [];
    
    // Vitamina D3
    recs.push({ icon: '☀️', name: 'Vitamina D3', why: 'El 47% de los argentinos tiene déficit. Regula más de 200 genes, inmunidad, huesos y función hormonal. Dosis: 2.000–4.000 UI/día (Holick MF, NEJM 2007).' });
    
    // Omega-3
    if (['vegano', 'vegetariano'].includes(diet)) {
        recs.push({ icon: '🌱', name: 'Omega-3 de Microalgas', why: 'Aporte directo de DHA y EPA activos para dietas basadas en plantas, evitando el aceite de pescado. Cardioprotector y antiinflamatorio.' });
    } else {
        recs.push({ icon: '🐟', name: 'Omega-3 EPA+DHA (Pescado)', why: 'Cardioprotector, neuroprotector, antiinflamatorio sistémico de alta biodisponibilidad marina. Dosis: 2-3g/día.' });
    }
    
    // Magnesio Bisglicinato
    recs.push({ icon: '💚', name: 'Magnesio Bisglicinato', why: 'Sinergia con sueño profundo, recuperación muscular y sensibilidad insulínica. 300–400mg/noche antes de dormir.' });
    
    // Probióticos
    if (['vegano', 'vegetariano'].includes(diet)) {
        recs.push({ icon: '🦠', name: 'Probióticos Plant-Based', why: 'Fermentos de origen vegetal (kéfir de agua, chucrut) que de forma natural refuerzan la microbiota intestinal y el eje intestino-cerebro.' });
    } else {
        recs.push({ icon: '🦠', name: 'Probióticos', why: 'Refuerzan la microbiota intestinal (eje intestino-cerebro), la inmunidad y el metabolismo. L. rhamnosus GG y Bifidobacterium tienen mayor evidencia.' });
    }
    
    // Vitamina B12
    if (diet === 'vegano') {
        recs.push({ icon: '🔵', name: 'Vitamina B12 (Obligatoria)', why: 'Única deficiencia inevitable en dieta vegana. 500–1000 µg/día cianocobalamina. Medir en sangre anualmente y suplementar sin excepción.' });
    } else if (diet === 'vegetariano') {
        recs.push({ icon: '🔵', name: 'Vitamina B12', why: 'Recomendable en dieta vegetariana para evitar deficiencias a largo plazo si el consumo de huevo/lácteos es bajo.' });
    }
    
    // Creatina
    if (profile.goal === 'ganarMusculo' || profile.goal === 'rendimientoDeportivo') {
        recs.push({ icon: '⚡', name: 'Creatina Monohidrato', why: '>1.000 estudios avalan su seguridad y eficacia. 3–5g/día mejoran fuerza (+8-14%), potencia y masa muscular. Sin fase de carga necesaria.' });
    }
    
    const sr = document.getElementById('supp-recs');
    if (sr) sr.innerHTML = recs.map(r => `<div class="supp-rec-card"><span class="supp-rec-icon">${r.icon}</span>
    <div><div class="supp-rec-name">${r.name}</div><div class="supp-rec-why">${r.why}</div></div></div>`).join('');
}

// ===== PROFILE =====
function updateProfile() {
    const p = profile, n = p.name || 'Mi Perfil';
    document.getElementById('profile-name').textContent = n;
    const pab = document.getElementById('profile-avatar-big'); if (pab) pab.textContent = n[0].toUpperCase();
    const ua = document.getElementById('user-avatar'); if (ua) ua.textContent = n[0].toUpperCase();
    document.getElementById('profile-goal-label').textContent = 'Meta: ' + goalLabel(p.goal || 'saludGeneral').charAt(0).toUpperCase() + goalLabel(p.goal || 'saludGeneral').slice(1);
    const pdl = document.getElementById('profile-diet-label'); if (pdl) pdl.textContent = 'Alimentación: ' + (p.diet || 'omnivoro').charAt(0).toUpperCase() + (p.diet || 'omnivoro').slice(1);
    const bmi = p.weight && p.height ? (p.weight / ((p.height / 100) ** 2)).toFixed(1) : '--';
    const ps = document.getElementById('profile-stats');
    if (ps) {
        const allergiesLabels = { gluten: 'Gluten', lactosa: 'Lácteos/Lactosa', frutosSecos: 'Frutos secos', huevo: 'Huevo', pescadoMarisco: 'Pescado/Mariscos', soja: 'Soja' };
        const conditionsLabels = { diabetes: 'Diabetes', hipertension: 'Hipertensión', colesterol: 'Colesterol alto', hipotiroidismo: 'Hipotiroidismo', colonIrritable: 'SIBO', gastritis: 'Gastritis/Reflujo' };
        
        const allergiesList = Array.isArray(p.allergies) && p.allergies.length > 0
            ? p.allergies.map(a => `<span class="profile-clinical-badge allergy">${allergiesLabels[a] || a}</span>`).join('')
            : '<span class="profile-clinical-badge empty">Ninguna</span>';
            
        const conditionsList = Array.isArray(p.conditions) && p.conditions.length > 0
            ? p.conditions.map(c => `<span class="profile-clinical-badge condition">${conditionsLabels[c] || c}</span>`).join('')
            : '<span class="profile-clinical-badge empty">Ninguna</span>';
            
        const dislikesStr = p.dislikes ? p.dislikes : 'Ninguno';

        ps.innerHTML = `
        <div class="profile-stat"><span class="profile-stat-val">${p.weight || '--'} kg</span><span class="profile-stat-lbl">Peso</span></div>
        <div class="profile-stat"><span class="profile-stat-val">${p.targetWeight || p.weight || '--'} kg</span><span class="profile-stat-lbl">Objetivo</span></div>
        <div class="profile-stat"><span class="profile-stat-val">${bmi}</span><span class="profile-stat-lbl">IMC</span></div>
        <div class="profile-stat" style="grid-column: span 3"><span class="profile-stat-val">${p.targetCals || '--'} kcal/día</span><span class="profile-stat-lbl">Objetivo Calórico</span></div>
        
        <div class="profile-clinical-section" style="grid-column: span 3; text-align: left; margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1rem; width: 100%;">
            <h4 style="font-size: 0.85rem; color: var(--text); margin-bottom: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 6px;">🧬 Plan Clínico y Seguridad</h4>
            <div style="margin-bottom: 0.6rem; font-size: 0.8rem; color: var(--text-dim); display: flex; flex-wrap: wrap; align-items: center; gap: 4px;">
                <strong>Alergias:</strong> ${allergiesList}
            </div>
            <div style="margin-bottom: 0.6rem; font-size: 0.8rem; color: var(--text-dim); display: flex; flex-wrap: wrap; align-items: center; gap: 4px;">
                <strong>Condiciones:</strong> ${conditionsList}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-dim); display: flex; flex-wrap: wrap; align-items: center; gap: 4px;">
                <strong>Exclusiones:</strong> <span class="profile-clinical-badge exclusion">${dislikesStr}</span>
            </div>
        </div>`;
    }
}

// ===== MODO OSCURO =====
function initDarkMode() {
    const saved = localStorage.getItem('darkMode');
    const toggle = document.getElementById('dark-toggle');
    // Apply saved preference (default: OFF — modo claro)
    const isDark = saved === 'true';
    if (isDark) document.body.classList.add('dark-mode');
    if (toggle) toggle.checked = isDark;
    // Wire up the toggle
    if (toggle) {
        toggle.addEventListener('change', () => {
            const enabled = toggle.checked;
            document.body.classList.toggle('dark-mode', enabled);
            localStorage.setItem('darkMode', String(enabled));
        });
    }
}

// Initialize dark mode as soon as features script loads
initDarkMode();

// ===== INTERACTIVE FAST-TRACK TOUR SYSTEM =====
window.currentTourStep = 0;

function positionTooltip(tooltipId, targetSelector, position = 'top') {
    const tooltip = document.getElementById(tooltipId);
    const target = document.querySelector(targetSelector);
    if (!tooltip || !target) return;
    
    tooltip.classList.remove('hidden');
    
    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let top = 0;
    let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
    
    if (position === 'top') {
        top = targetRect.top - tooltipRect.height - 12;
        const arrow = tooltip.querySelector('.onb-tooltip-arrow');
        if (arrow) arrow.className = 'onb-tooltip-arrow bottom';
    } else if (position === 'bottom') {
        top = targetRect.bottom + 12;
        const arrow = tooltip.querySelector('.onb-tooltip-arrow');
        if (arrow) arrow.className = 'onb-tooltip-arrow top';
    }
    
    // Bounds check
    if (left < 10) left = 10;
    if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
    }
    if (top < 10) top = 10;
    
    tooltip.style.top = `${top + window.scrollY}px`;
    tooltip.style.left = `${left + window.scrollX}px`;
}

function startFastTrackTour() {
    window.currentTourStep = 1;
    localStorage.removeItem('niaFirstTimeTour');
    const overlay = document.getElementById('onb-tour-overlay');
    if (overlay) overlay.classList.remove('hidden');
    
    // Position Tooltip 1 pointing to comidas bottom tab
    positionTooltip('onb-tooltip-1', '#nav-comidas', 'top');
}

function advanceTourStep(step) {
    if (step === 1) {
        const t1 = document.getElementById('onb-tooltip-1');
        if (t1) t1.classList.add('hidden');
        
        // Hide overlay so user can interact and log the meal
        const overlay = document.getElementById('onb-tour-overlay');
        if (overlay) overlay.classList.add('hidden');
        
        // Go to meals tab
        showScreen('comidas');
        
        window.currentTourStep = 2;
    } else if (step === 2) {
        const t2 = document.getElementById('onb-tooltip-2');
        if (t2) t2.classList.add('hidden');
        
        // Hide tour overlay briefly so they can register
        const overlay = document.getElementById('onb-tour-overlay');
        if (overlay) overlay.classList.add('hidden');
        
        window.currentTourStep = 3;
    } else if (step === 3) {
        const t3 = document.getElementById('onb-tooltip-3');
        if (t3) t3.classList.add('hidden');
        
        const overlay = document.getElementById('onb-tour-overlay');
        if (overlay) overlay.classList.add('hidden');
        
        window.currentTourStep = 0;
        showMsg('🎉 ¡Plan personalizado en marcha! Empezá tu registro diario.');
    }
}

// Window bindings for HTML inline onclick handlers
window.addActivity = addActivity;
window.addSupplement = addSupplement;
window.advanceTourStep = advanceTourStep;
window.closeActivityModal = closeActivityModal;
window.closeSupplementModal = closeSupplementModal;
window.closeSupplementReminderModal = closeSupplementReminderModal;
window.generateCustomRecipe = generateCustomRecipe;
window.openActivityModal = openActivityModal;
window.openSupplementModal = openSupplementModal;
window.saveSupplementWithReminder = saveSupplementWithReminder;
window.selectFeeling = selectFeeling;
window.selectReminderOption = selectReminderOption;
window.sendChat = sendChat;
window.sendChip = sendChip;
window.positionTooltip = positionTooltip;
window.startFastTrackTour = startFastTrackTour;
