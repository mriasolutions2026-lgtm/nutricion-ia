// =============================================
//  NUTRICION IA — Knowledge Base (knowledge.js)
//  PhD-level nutrition & health knowledge
// =============================================

const NUTRI_KB = {

    // ===== MACRONUTRIENTS =====
    macros: {
        proteinas: `Las proteínas son macronutrientes esenciales compuestos por aminoácidos. Tienen funciones estructurales (músculo, colágeno, enzimas), reguladoras (hormonas, anticuerpos) y energéticas. La RDA es 0,8g/kg/día para sedentarios, pero la evidencia actual (Phillips et al., 2016; Morton et al., 2018) sugiere 1,6–2,2g/kg/día para quienes hacen ejercicio de fuerza. Las fuentes completas incluyen carnes, huevos, lácteos, soja y quinoa. Fuentes vegetales complementarias: arroz+legumbres, maíz+porotos. El timing proteico post-entrenamiento (ventana anabólica) es relevante pero no crítico si la ingesta diaria total es adecuada.`,
        carbohidratos: `Los carbohidratos son la principal fuente de energía, especialmente para el sistema nervioso y el ejercicio de alta intensidad. Se clasifican en simples (monosacáridos, disacáridos) y complejos (almidones, fibra). El índice glucémico (IG) y la carga glucémica son herramientas útiles pero no determinantes aisladas de la calidad nutricional. La fibra dietética (soluble e insoluble) es fundamental: mejora la microbiota, regula la glucemia, reduce el colesterol LDL y protege contra el cáncer colorrectal (Gibiino et al., 2021). Objetivo: 25–38g fibra/día.`,
        grasas: `Las grasas son esenciales para la absorción de vitaminas liposolubles (A, D, E, K), síntesis hormonal (esteroides, testosterona, estrógenos) y función cerebral (60% del cerebro es grasa). Los ácidos grasos omega-3 (EPA y DHA) tienen efectos antiinflamatorios probados: reducen triglicéridos, protegen la función cardiovascular y neurológica (Calder, 2020). Las grasas trans industriales deben evitarse completamente. Las saturadas deben limitarse. Las monoinsaturadas (AOVE, palta, nueces) son protectoras.`
    },

    // ===== MICRONUTRIENTS =====
    micros: {
        vitD: `La vitamina D3 es en realidad una prohormona. Su déficit es pandémico (1.000 millones de personas). Regula más de 200 genes, esencial para calcio, inmunidad, función muscular, salud mental y prevención de enfermedades autoinmunes. Síntesis cutánea requiere exposición solar UVB. Fuentes: pescados grasos, yemas, hongos expuestos al sol. Suplementación: 2.000–4.000 UI/día es segura y recomendada en latitudes >35°N/S (Holick, 2011). Idealmente medir 25(OH)D en sangre; óptimo: 40–60 ng/mL.`,
        omega3: `Los omega-3 son ácidos grasos poliinsaturados: ALA (vegetal), EPA y DHA (marines). EPA y DHA tienen la mayor evidencia: cardioprotectores (reducen TG hasta 30%), neuroprotectores, antiinflamatorios sistémicos. El cerebro fetal y neonatal los necesita críticamente. Fuentes: salmón, sardinas, caballa, semillas de lino, chía (solo ALA). Para veganos: microalgas (fuente directa de DHA/EPA). Dosis terapéutica: 2–4g EPA+DHA/día (GISSI, REDUCE-IT trial).`,
        magnesio: `El magnesio participa en más de 300 reacciones enzimáticas. Deficiencia es frecuente (50% población occidental). Impacta en: sueño (activa GABA), función muscular (calambres), salud cardiovascular, metabolismo de glucosa (resistencia insulínica), salud ósea. Formas biodisponibles: bisglicinato, malato, citrato. El óxido de magnesio tiene baja absorción. Dosis: 300–400 mg/día. Tomar en la noche para mejorar sueño (Abbasi et al., 2012).`,
        hierro: `El hierro hemo (carnes rojas, hígado) tiene absorción del 15–35%. El no-hemo (legumbres, vegetales) absorbe 2–20%, potenciado por vitamina C y reducido por fitatos, calcio y taninos. La deficiencia es la carencia nutricional más común: afecta a 2.000 millones de personas. En mujeres premenopáusicas y deportistas el riesgo es mayor. Síntomas: fatiga, palidez, anemia ferropénica. El exceso (hemocromatosis) es igualmente dañino; no suplementar sin control médico.`,
        b12: `La B12 (cobalamina) es crítica para la función neurológica y la formación de glóbulos rojos. Solo presente en alimentos animales — es la única deficiencia nutricional inevitable en dietas completamente veganas. La levadura nutricional y algas NO son fuentes confiables de B12 activa. Suplementar: cianocobalamina o metilcobalamina, 250–1000 µg/día o 2.500 µg/semana. Absorción disminuye con metformina, IBPs y edad. Medir niveles en sangre regularmente si se sigue dieta vegana.`,
        zinc: `El zinc interviene en más de 300 reacciones enzimáticas: síntesis de ADN, cicatrización, inmunidad, función sexual masculina y sentido del gusto. Fuentes: carnes, mariscos (ostras: la fuente más rica), semillas de calabaza, nueces. Los fitatos de cereales integrales y legumbres reducen su absorción. Los veganos necesitan 50% más de zinc en la dieta. Déficit causa: retraso de crecimiento, alopecia, acné, disfunción inmune.`,
        calcio: `El calcio es el mineral más abundante en el cuerpo (99% en huesos y dientes). Crucial para contracción muscular, transmisión nerviosa, coagulación. La vitamina D3 es imprescindible para su absorción intestinal. Fuentes: lácteos, sardinas con espinas, tofu (con sulfato de calcio), almendras, brócoli, col rizada. El calcio de plantas tiene menor biodisponibilidad. La acidosis crónica (dieta occidental) puede desmineralizar huesos. No exagerar suplementación: riesgo cardiovascular con dosis superiores a 1.500 mg/día.`
    },

    // ===== VEGETARIAN / VEGAN VARIANTS =====
    dietas: {
        vegano: `La dieta vegana excluye todos los productos animales. Bien planificada es nutricionalmente completa (posición AND, 2016) y asociada a menor riesgo de DM2, obesidad, cardiopatía y algunos cánceres. Nutrientes a vigilar OBLIGATORIAMENTE: B12 (suplementar siempre), vitamina D3 (de algas o suplemento), omega-3 EPA/DHA (aceite de microalgas), calcio (tofu, verduras de hoja oscura), hierro (con vitamina C), zinc, yodo (sal yodada o algas nori moderadas). Las fuentes proteicas completas veganas: soja, quinoa, amaranto. Combinaciones: arroz+legumbres, maíz+porotos.`,
        vegetariano: `La dieta vegetariana excluye carnes pero puede incluir huevos (ovolactovegetariano), lácteos o ambos. Es la dieta con menos riesgos nutricionales entre las basadas en plantas. El huevo es la proteína de mayor valor biológico (VB=100). Los lácteos aportan B12, calcio y vitamina D. Los vegetarianos igualmente deben vigilar: hierro, zinc, omega-3 y B12 (especialmente si no consumen huevos/lácteos). Bien planificada protege contra enfermedades crónicas y tiene menor impacto ambiental.`,
        flexitariano: `El flexitarianismo (Dawn Jackson Blatner, 2009) es un enfoque principalmente vegetariano que permite consumo ocasional de carne. Evidencia sólida de beneficios metabólicos y cardiovasculares manteniendo mayor flexibilidad social y practicidad. Estrategia "Meatless Monday" o "Plant-forward": 80% alimentos de origen vegetal, 20% animal. Reduce riesgo de síndrome metabólico vs. dieta occidental estándar (Hemler & Hu, 2019).`,
        pescetariano: `El pescetarianismo excluye carnes rojas y aves pero incluye pescados y mariscos. Los omega-3 EPA y DHA de pescados grasos (salmón, sardinas, caballa, anchoas) son su principal ventaja nutricional. Asociado a menor mortalidad cardiovascular (Zheng et al., 2019). El riesgo de contaminación por mercurio (atún, pez espada) es real: limitar a 2 veces/semana en embarazadas. Los mariscos aportan gran cantidad de zinc, selenio, yodo y B12.`,
        crudivoro: `La dieta crudívora consume solo alimentos sin cocción (temperatura <42°C). Ventajas: alta en enzimas vegetales, fibra, antioxidantes, fitoquímicos. Desventajas: deficiencias nutricionales severas sin planificación experta (B12, D, hierro, zinc, calcio, proteínas). Algunos alimentos MEJORAN su biodisponibilidad con cocción: tomate (licopeno), zanahoria (betacaroteno), espárragos, espinaca. La fermentación (sauerkraut, kimchi) es compatible y mejora absorción de minerales al reducir fitatos.`,
        cetogenico: `La dieta cetogénica es alta en grasas (70-80%), moderada en proteínas (15-20%) y muy baja en carbohidratos (<50g/día), induciendo cetosis metabólica. Evidencia sólida en epilepsia refractaria pediátrica. Beneficios estudiados: pérdida de peso inicial rápida, mejora de resistencia a la insulina, posibles efectos neuroprotectores. Riesgos: déficit de fibra, micronutrientes, impacto en microbiota, sostenibilidad limitada, "keto flu" inicial. No recomendada en embarazo, insuficiencia hepática o renal, o pancreatitis.`,
        mediterraneo: `La Dieta Mediterránea es el patrón dietético con la mirada integral de lo que de verdad funciona de beneficio para la salud. El estudio PREDIMED (2013, NEJM) demostró reducción del 30% en eventos cardiovasculares graves. Caracterizada por: abundante AOVE, vegetales, frutas, legumbres, cereales integrales, frutos secos; pescado moderado; carne roja ocasional; vino tinto con moderación (opcional). Sus efectos se atribuyen a antiinflamatorios (polifenoles, omega-3), fibra y la sinergia entre sus componentes.`,
        paleo: `La dieta Paleo imita la alimentación del Paleolítico: carnes magras, pescados, huevos, vegetales, frutas, nueces y semillas. Excluye cereales, legumbres, lácteos, azúcares procesados. Beneficios documentados: mejora en sensibilidad insulínica, reducción de marcadores inflamatorios, pérdida de peso (Frassetto et al., 2009). Críticas: carácter restrictivo, exclusión de legumbres y cereales integrales (con fuerte evidencia beneficiosa), costo elevado y sostenibilidad ambiental cuestionable.`
    },

    // ===== SPORTS NUTRITION =====
    deportes: {
        general: `La nutrición deportiva gestiona la energía para el rendimiento y la recuperación. El modelo periodización nutricional ajusta la ingesta de macros al tipo y volumen de entrenamiento. Los tres pilares son: disponibilidad energética adecuada (evitar bajo RED-S/síndrome de la tríada), hidratación óptima y timing de nutrientes. La proteína post-entrenamiento (20-40g de proteína completa en las 2h posteriores) maximiza la síntesis proteica muscular (MPS). Los carbohidratos pre-entrenamiento (1-4g/kg, 1-4h antes) optimizan el glucógeno muscular.`,
        fuerza: `En entrenamiento de fuerza el objetivo nutricional es maximizar la hipertrofia muscular y la recuperación. Proteína: 1,6–2,2g/kg/día distribuida en 4-5 tomas de 30-40g (leucina >3g/toma activa mTOR). Creatina monohidrato: 3-5g/día es el suplemento de mayor mirada integral de lo que de verdad funciona para fuerza e hipertrofia (Rawson & Volek, 2003). Carbohidratos post-entrenamiento reponen glucógeno: 1-1,5g/kg en las primeras 2h. Deficit calórico moderado (300-500 kcal) para recomposición corporal sin perder masa muscular.`,
        cardio: `En ejercicio de resistencia aeróbica el combustible principal es el glucógeno muscular y hepático. La "carga de carbohidratos" (carboloading) 24-48h antes de eventos >90 min (8-12g CHO/kg/día) optimiza reservas. Durante el ejercicio >60 min: 30-60g CHO/hora (geles, bebidas deportivas). Electrolitos: sodio (1-2g/hora en sudoración intensa), potasio, magnesio previenen calambres y disrupciones osmóticas. Los ácidos grasos omega-3 mejoran la economía del ejercicio y reducen el EIMD (daño muscular inducido por ejercicio).`,
        recuperacion: `La ventana de recuperación post-entrenamiento es crítica: las primeras 30-120 minutos maximizan la síntesis de glucógeno y proteínas. Ratio recomendado: 3-4:1 CHO:Proteína. Ejemplos: batido de whey + banana, pollo + arroz, yogur griego + granola + frutas. El sueño es el anabólico más potente: durante el sueño profundo se libera hormona de crecimiento y ocurre la mayor síntesis proteica. La cereza ácida (Montmorency) reduce el dolor muscular tardío (DOMS) por su contenido en antocianinas (Connolly et al., 2006).`
    },

    // ===== SUPPLEMENTS =====
    suplementos: {
        creatina: `La creatina monohidrato es el suplemento ergogénico con mayor mirada integral de lo que de verdad funciona (>1.000 estudios). Mecanismo: aumenta las reservas de fosfocreatina (PCr) para la regeneración de ATP en ejercicios de alta intensidad cortos. Beneficios demostrados: +8-14% fuerza máxima, +12-14% potencia, mayor masa muscular, mejoras cognitivas (Benton & Donohoe, 2011), neuroprotección. Dosis óptima: 3-5g/día (sin fase de carga necesaria). Segura a largo plazo incluso en personas con función renal normal. Monohidrato > otras formas (etil éster, HCl) en relación costo-eficacia.`,
        whey: `La proteína de suero (whey) es un derivado del procesamiento del queso. Es la proteína de referencia por su rápida digestión y alto contenido de aminoácidos esenciales y BCAA (leucina 10-11%). Tipos: concentrado (70-80% proteína, algo de lactosa), aislado (90%+ proteína, mínima lactosa), hidrolizado (pre-digerido, más rápido). Para intolerantes a la lactosa: proteína de guisante, arroz o cáñamo son alternativas veganas de alta calidad. Dosis: 20-40g/toma, preferentemente post-entrenamiento.`,
        bcaa: `Los BCAA (leucina, isoleucina, valina) son aminoácidos de cadena ramificada que el músculo oxida directamente. La leucina es el principal activador de mTOR y la síntesis proteica. Su suplementación tiene beneficio real SOLO si la ingesta proteica total diaria es insuficiente. Si se consume proteína adecuada (1,6-2,2g/kg/día), el BCAA adicional es redundante y costoso. Para veganos con dietas a veces incompletas en leucina, puede ser útil. Dosis si se usa: 5-10g alrededor del entrenamiento.`,
        omega3supp: `La suplementación con omega-3 (EPA+DHA) es recomendable cuando el consumo de pescado graso es <2 veces/semana. Dosis terapéutica: 1-4g EPA+DHA/día. Para hipertrigliceridemia: 4g/día reduce TG 25-30% (Bhatt et al., 2019, REDUCE-IT). Para veganos: aceite de microalgas (Schizochytrium sp.) contiene DHA y algo de EPA directamente. Buscar productos con certificación IFOS o similar (pureza, ausencia de mercurio). Guardar en frío para evitar oxidación.`,
        cafeina: `La cafeína es el estimulante más consumido del mundo y el ergogénico legal más eficaz. Mecanismo: bloquea receptores de adenosina (reduce percepción de fatiga), libera adrenalina, mejora contracción muscular. Mejora el rendimiento en resistencia (3-7%), fuerza, potencia y concentración. Dosis efectiva: 3-6 mg/kg (200-400mg). El pico plasmático es a los 30-60min de la ingesta. La tolerancia se desarrolla rápido: ciclar (5 días sí, 2 días off) maximiza el efecto. Evitar después de las 14hs para no afectar el sueño (vida media: 5-6 horas).`,
        vitaminac: `La vitamina C (ácido ascórbico) es un antioxidante hidrosoluble esencial (no sintetizamos endógenamente). Funciones: síntesis de colágeno, absorción de hierro no-hemo, inmunidad, neutralización de radicales libres. Evidencia real: reduce duración del resfriado en personas con alta actividad física (Hemilä, 2017). Megadosis (>2g/día) pueden atenuar adaptaciones al entrenamiento bloqueando señales de ROS. Fuentes: kiwi, pimiento rojo, cítricos, guayaba. Suplementar con 200-500mg/día es seguro y justificado en dietas bajas en vegetales.`,
        melatonina: `La melatonina es una neurohormona producida por la glándula pineal que regula el ritmo circadiano. La suplementación es útil para: jet lag (0,5-5mg antes de dormir en destino), insomnio de inicio (no mantención del sueño), trabajadores nocturnos. La dosis efectiva es mucho menor de lo que se comercializa: 0,1-0,5mg ya es efectiva; dosis altas (5-10mg) pueden generar "resaca" y suprimir la producción endógena. La exposición a luz azul de pantallas suprime la melatonina natural — evitar 1-2h antes de dormir.`,
        probioticos: `Los probióticos son microorganismos vivos que, en cantidades adecuadas, confieren un beneficio a la salud del huésped (OMS, 2001). El microbioma intestinal (1,5kg de bacterias, 38 billones de microorganismos) influye en inmunidad, metabolismo, salud mental (eje intestino-cerebro) y producción de vitaminas (K2, B12, biotina). Cepas más estudiadas: Lactobacillus rhamnosus GG (diarrea, SII), L. acidophilus, Bifidobacterium longum. Los prebióticos (fibra fermentable: FOS, GOS, inulina) nutren a los probióticos. Alimentos probióticos: kefir, yogur, chucrut, kimchi, miso, tempeh.`
    },

    // ===== MENTAL HEALTH & NUTRITION =====
    saludMental: {
        general: `La psiconutrición estudia el impacto de la dieta en la salud mental. El 90% de la serotonina se produce en el intestino (células enterocromafines) — el eje intestino-cerebro (gut-brain axis) es bidireccional. El estudio SMILES (2017, BMC Medicine) demostró que una intervención dietética mediterránea redujo síntomas depresivos significativamente vs. soporte social. La Dieta MIND (Mediterranean-DASH Intervention for Neurodegenerative Delay) reduce el riesgo de Alzheimer hasta 53% en quienes la siguen estrictamente (Morris et al., 2015).`,
        ansiedad: `Para la ansiedad y el estrés, la nutrición puede modular la respuesta del eje HPA (hipotálamo-hipófisis-adrenal). Nutrientes clave: magnesio (regula NMDA y GABA), omega-3 (antiinflamatorio, modula serotonina), vitamina D (modula cortisol), zinc, vitaminas del complejo B. Los probióticos reducen marcadores de ansiedad social en estudios controlados. El azúcar y ultraprocesados generan picos de glucemia que contribuyen a la ansiedad e irritabilidad (hiperglucemia-hipoglucemia reactiva).`,
        memoria: `Para la función cognitiva y memoria: DHA es el omega-3 más abundante en el cerebro (6% del peso seco). La fosfatidilserina (presente en soja, atún) apoya la función neuronal. Los flavonoides de bayas, cacao puro y té verde mejoran el flujo sanguíneo cerebral (BDNF). La glucosa es el combustible cerebral preferido — el ayuno prolongado puede impactar la función cognitiva aguda. El ayuno intermitente estimula la autofagia neuronal y el BDNF (factor neurotrófico) a largo plazo.`
    },

    // ===== LONGEVITY & ANTI-INFLAMMATORY =====
    longevidad: {
        general: `La nutrición para la longevidad busca reducir el ritmo de envejecimiento biológico (edad epigenética). Los principios más sólidos (Blue Zones, Dan Buettner): base vegetal, restricción calórica moderada, legumbres diarias, movimiento natural constante, ayuno nocturno ≥12h, propósito y conexión social. El ayuno intermitente (16:8 o 5:2) activa AMPK y autofagia (mecanismo de reciclaje celular premiado con Nobel 2016 - Ohsumi). La restricción de metionina (aminoácido abund. en carnes) extiende la vida en modelos animales.`,
        antiinflamacion: `La inflamación crónica de bajo grado ("inflammaging") acelera el envejecimiento y está en la base de la mayoría de enfermedades crónicas. Alimentos antiinflamatorios: cúrcuma (curcumina + pimienta negra para biodisponibilidad), jengibre, bayas, AOVE (oleocantal similar al ibuprofeno), pescados grasos, vegetales de hoja verde, hongos. Alimentos proinflamatorios: aceites de semillas oxidados, azúcares, harinas refinadas, carnes procesadas (nitritos, aminas heterocíclicas), alcohol en exceso. El índice inflamatorio de la dieta (DII) puede calcularse.`,
        microbioma: `El microbioma intestinal es un órgano metabólico que pesa 1,5kg y genera ácidos grasos de cadena corta (AGCC: butirato, propionato, acetato) esenciales para la salud del colonocito y la regulación inmune sistémica. La diversidad microbiana es el principal marcador de un microbioma saludable. Para mejorarla: aumentar fibra (25-38g/día), consumir alimentos fermentados (10-20 veces/semana), reducir antibióticos innecesarios, evitar edulcorantes artificiales (alteran microbiota - Suez et al., 2022). Cada antibiótico puede tardar hasta 2 años en restaurar el microbioma basal.`
    },

    // ===== TENDENCIAS =====
    tendencias: {
        ayunoIntermitente: `El Ayuno Intermitente (AI) engloba varios protocolos: 16:8 (16h ayuno, 8h ventana alimentaria), 5:2 (2 días de 500 kcal/semana), OMAD (una comida al día). Mecanismos: autofagia, reducción de IGF-1, mejora de sensibilidad insulínica, reducción de inflamación. Meta-análisis de 2022 (Harris et al.): pérdida de peso comparable a restricción calórica continua. Mujeres pueden ser más sensibles a protocolos agresivos (impacto en eje HPA y hormonas reproductivas). No recomendado en embarazo, trastornos alimentarios o atletas de alto volumen.`,
        plantBased: `El movimiento "Plant-Based" (basado en plantas) es la tendencia nutricional de mayor crecimiento global. Diferente a vegano: puede incluir cantidades mínimas de proteína animal. Association of UK Dietitians, AND y Dietitians of Canada la declaran nutricionalmente completa. Beneficios: menor BMI, menor riesgo DM2 (-23%), menor mortalidad cardiovascular (-16%). Nuevas fuentes proteicas plant-based: proteína de guisante, algas spirulina/chlorella, proteína de cáñamo, micoproteína (Quorn). La biodisponibilidad de proteínas vegetales es 60-80% vs. 90-95% de proteínas animales.`,
        cronobiologia: `La crononutrición estudia el impacto del TIMING de la alimentación sobre el metabolismo (cronobiología). Comer a destiempo del ritmo circadiano ("jet lag metabólico") aumenta el riesgo de obesidad y síndrome metabólico. El desayuno es la comida de mayor eficiencia termogénica (+25-30% TEF matutino vs. nocturno). Comer la mayoría de calorías antes del mediodía mejora la sensibilidad insulínica, la saciedad y el control de peso (Sutton et al., Cell Metabolism, 2018). Evitar comer las últimas 2-3 horas antes de dormir.`
    },

    // ===== HYDRATION =====
    hidratacion: {
        general: `La deshidratación del 2% del peso corporal ya reduce el rendimiento físico y cognitivo. El agua no se puede reemplazar. Fórmula básica: 35ml/kg/día + 500-750ml por cada hora de ejercicio. Los electrolitos son críticos en ejercicio prolongado — el sodio regula la osmolalidad plasmática (hiponatremia dilucional es peligrosa en maratonistas que solo beben agua). Bebidas isotónicas son útiles en ejercicio >60 min. La orina clara-amarilla pálida indica buena hidratación. El café y el té cuentan como líquidos (paradoja del diurético leve).`
    }
};

// ===== RECIPE DATABASE =====
const RECIPE_DB = [
    {
        id: 1, name: "Bowl de Quinoa con Salmón y Palta", emoji: "🥣", time: "25 min",
        kcal: 520, prot: 38, carb: 42, fat: 18, score: 95,
        tags: ["pescetariano", "omnivoro", "sin-gluten", "mediterráneo", "alto-proteína"],
        goals: ["recomposicion", "ganarMusculo", "saludGeneral", "longevidad"],
        ingredients: ["150g salmón", "100g quinoa cocida", "½ palta", "Rúcula", "Tomate cherry", "Limón", "Aceite de oliva", "Sal y pimienta"],
        steps: ["Cocinar la quinoa (2:1 agua, 15 min).", "Sellar el salmón a la plancha 3-4 min por lado con sal y pimienta.", "Armar el bowl: base de quinoa y rúcula.", "Añadir salmón desmenuzado, tomate y palta en rodajas.", "Aliñar con limón y AOVE. Servir inmediato."],
        tip: "La quinoa es la única proteína vegetal con los 9 aminoácidos esenciales. El salmón aporta DHA y EPA directamente."
    },
    {
        id: 2, name: "Tortilla de Espinaca y Huevo", emoji: "🥚", time: "15 min",
        kcal: 320, prot: 22, carb: 8, fat: 22, score: 88,
        tags: ["vegetariano", "sin-gluten", "keto-friendly"],
        goals: ["perderPeso", "saludGeneral", "energia"],
        ingredients: ["3 huevos", "100g espinaca fresca", "½ cebolla", "AOVE", "Sal y cúrcuma"],
        steps: ["Saltear la cebolla en oliva hasta transparente.", "Agregar espinaca y cocinar hasta marchar (2 min).", "Batir huevos con sal y cúrcuma.", "Verter sobre la sartén y cocinar tapada a fuego bajo 5-7 min.", "Doblar o servir abierta."],
        tip: "La cúrcuma con grasa y pimienta negra mejora la absorción de curcumina hasta 2000%."
    },
    {
        id: 3, name: "Lentejas Rojas al Curry con Arroz Integral", emoji: "🍲", time: "35 min",
        kcal: 480, prot: 24, carb: 78, fat: 8, score: 92,
        tags: ["vegano", "vegetariano", "sin-gluten", "alto-fibra"],
        goals: ["saludGeneral", "longevidad", "saludMental", "perderPeso"],
        ingredients: ["150g lentejas rojas", "100g arroz integral", "400ml leche de coco", "1 lata tomate triturado", "Cebolla, ajo, jengibre", "Curry, cúrcuma, comino", "Espinaca, cilantro"],
        steps: ["Saltear cebolla, ajo y jengibre.", "Agregar especias y tostar 1 min.", "Añadir lentejas, tomate y leche de coco. Cocinar 20 min.", "Incorporar espinaca al final.", "Servir sobre arroz integral con cilantro fresco."],
        tip: "Las lentejas rojas no necesitan remojo y se cocinan en 20 minutos. Combinada con arroz forman proteína completa."
    },
    {
        id: 4, name: "Pechuga de Pollo con Batata Asada y Brócoli", emoji: "🍗", time: "40 min",
        kcal: 450, prot: 42, carb: 38, fat: 10, score: 91,
        tags: ["omnivoro", "sin-gluten", "alto-proteína"],
        goals: ["ganarMusculo", "recomposicion", "rendimientoDeportivo"],
        ingredients: ["180g pechuga de pollo", "200g batata", "150g brócoli", "AOVE", "Ajo, pimentón dulce, orégano"],
        steps: ["Precalentar horno a 200°C.", "Marinar pollo con oliva, ajo y pimentón 10 min.", "Cortar batata en cubos, mezclar con oliva y orégano.", "Llevar todo al horno 25-30 min.", "Cocinar brócoli al vapor en los últimos 8 min."],
        tip: "La batata tiene bajo índice glucémico a pesar de su dulzor. El brócoli al vapor preserva el 30% más de nutrientes que hervido."
    },
    {
        id: 5, name: "Smoothie Bowl Verde Energizante", emoji: "🥤", time: "10 min",
        kcal: 380, prot: 18, carb: 52, fat: 10, score: 89,
        tags: ["vegano", "vegetariano", "sin-gluten", "raw"],
        goals: ["energia", "saludGeneral", "longevidad", "saludMental"],
        ingredients: ["1 banana frozen", "100g espinaca", "200ml leche de almendras", "30g proteína de guisante", "1 cdita maca", "Toppings: granola, banana, chía, cacao nibs"],
        steps: ["Licuar banana, espinaca, leche y proteína hasta suave.", "Verter en bol ancho.", "Decorar con granola, rodajas de banana, chía y cacao nibs.", "Consumir inmediatamente."],
        tip: "La maca (Lepidium meyenii) modula el eje hipotálamo-hipófisis-suprarrenal: evidencia en energía y equilibrio hormonal."
    },
    {
        id: 6, name: "Tofu Teriyaki con Brócoli y Arroz", emoji: "🥢", time: "30 min",
        kcal: 420, prot: 28, carb: 52, fat: 12, score: 87,
        tags: ["vegano", "vegetariano"],
        goals: ["saludGeneral", "perderPeso", "longevidad"],
        ingredients: ["200g tofu firme", "150g brócoli", "100g arroz integral", "Salsa teriyaki casera: tamari, mirin, miel de agave, jengibre", "Sésamo, cebolla de verdeo"],
        steps: ["Prensar el tofu 15 min para eliminar el exceso de agua.", "Cortar en cubos y marinar con teriyaki 10 min.", "Cocinar tofu en sartén caliente hasta dorar (5 min por lado).", "Saltear brócoli en wok con ajo.", "Servir sobre arroz, acabar con sésamo y cebolla."],
        tip: "El tofu es rico en calcio (con sulfato de calcio) e isoflavonas: antioxidantes con evidencia en salud ósea y hormonal femenina."
    },
    {
        id: 7, name: "Ensalada Mediterránea con Garbanzos", emoji: "🥗", time: "15 min",
        kcal: 340, prot: 16, carb: 44, fat: 12, score: 90,
        tags: ["vegano", "vegetariano", "mediterraneo", "sin-gluten"],
        goals: ["perderPeso", "saludGeneral", "longevidad"],
        ingredients: ["400g garbanzos cocidos", "Pepino, tomate, pimiento rojo", "Aceitunas negras", "Cebolla morada", "AOVE, jugo de limón", "Orégano, perejil"],
        steps: ["Picar todos los vegetales en cubos medianos.", "Escurrir y enjuagar los garbanzos.", "Mezclar todo en bowl grande.", "Aliñar con oliva, limón, orégano y sal.", "Reposar 10 min antes de servir."],
        tip: "Los garbanzos tienen un índice de saciedad muy alto por su combinación de proteína y fibra. Son la legumbre base de la Dieta Mediterránea."
    },
    {
        id: 8, name: "Avena Nocturna con Frutas y Semillas", emoji: "🥣", time: "5 min + reposo",
        kcal: 390, prot: 15, carb: 56, fat: 12, score: 86,
        tags: ["vegetariano", "vegano", "sin-gluten"],
        goals: ["energia", "saludGeneral", "saludMental"],
        ingredients: ["80g avena sin gluten", "200ml leche vegetal o vaca", "1 cdita chía", "1 cdita proteína de vainilla", "Banana, arándanos, frutos rojos", "Mantequilla de almendras"],
        steps: ["Mezclar avena con leche, chía y proteína en un frasco.", "Tapar y refrigerar toda la noche (mínimo 4h).", "Por la mañana: añadir frutas y mantequilla de almendras.", "Consumir frío o templar 90 sec en microondas."],
        tip: "El beta-glucano de la avena reduce el colesterol LDL hasta 10% (FDA health claim). También mejora la velocidad de tránsito intestinal."
    }
];

// ===== MET TABLE (activity calorie burn) =====
const MET_TABLE = {
    correr: { baja: 6, moderada: 9.8, alta: 13, maxima: 16 },
    caminata: { baja: 2.8, moderada: 3.5, alta: 4.5, maxima: 5.5 },
    ciclismo: { baja: 4, moderada: 7, alta: 10, maxima: 14 },
    natacion: { baja: 5.8, moderada: 7.5, alta: 9.8, maxima: 12 },
    hiit: { baja: 6, moderada: 9, alta: 12, maxima: 15 },
    eliptico: { baja: 4.5, moderada: 6, alta: 8, maxima: 10 },
    remo: { baja: 4.8, moderada: 7, alta: 9.5, maxima: 12 },
    saltar: { baja: 7, moderada: 10, alta: 12, maxima: 14 },
    pesas: { baja: 3, moderada: 5, alta: 6, maxima: 8 },
    crossfit: { baja: 7, moderada: 10, alta: 13, maxima: 16 },
    calistenia: { baja: 3.5, moderada: 5, alta: 7, maxima: 9 },
    funcional: { baja: 4, moderada: 6, alta: 8, maxima: 10 },
    yoga: { baja: 2.5, moderada: 3.5, alta: 4.5, maxima: 5 },
    pilates: { baja: 2.8, moderada: 3.5, alta: 4.5, maxima: 5.5 },
    stretching: { baja: 2, moderada: 2.5, alta: 3, maxima: 3.5 },
    meditacion: { baja: 1.5, moderada: 2, alta: 2, maxima: 2.5 },
    futbol: { baja: 5, moderada: 7, alta: 9, maxima: 11 },
    basquet: { baja: 5, moderada: 7, alta: 9, maxima: 11 },
    tenis: { baja: 5, moderada: 7, alta: 9, maxima: 11 },
    boxeo: { baja: 6, moderada: 9, alta: 12, maxima: 15 },
    baile: { baja: 4, moderada: 6, alta: 8, maxima: 10 },
    otro: { baja: 4, moderada: 6, alta: 8, maxima: 10 }
};

const ACTIVITY_EMOJIS = {
    correr: '🏃', caminata: '🚶', ciclismo: '🚴', natacion: '🏊', hiit: '⚡', eliptico: '🔄', remo: '🚣', saltar: '⭕',
    pesas: '🏋️', crossfit: '💪', calistenia: '🤸', funcional: '🔧',
    yoga: '🧘', pilates: '🌀', stretching: '🤾', meditacion: '🧠',
    futbol: '⚽', basquet: '🏀', tenis: '🎾', boxeo: '🥊', baile: '💃', otro: '🏅'
};

const ACTIVITY_NAMES = {
    correr: 'Running', caminata: 'Caminata', ciclismo: 'Ciclismo', natacion: 'Natación', hiit: 'HIIT', eliptico: 'Elíptico', remo: 'Remo',
    saltar: 'Saltar soga', pesas: 'Musculación', crossfit: 'CrossFit', calistenia: 'Calistenia', funcional: 'Entrenamiento funcional',
    yoga: 'Yoga', pilates: 'Pilates', stretching: 'Stretching', meditacion: 'Meditación',
    futbol: 'Fútbol', basquet: 'Básquet', tenis: 'Tenis/Pádel', boxeo: 'Boxeo', baile: 'Baile/Zumba', otro: 'Deporte'
};

const FEELING_EMOJIS = { excelente: '😄', bien: '🙂', regular: '😐', agotado: '😫' };
