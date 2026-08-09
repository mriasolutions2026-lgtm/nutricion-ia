// =============================================
//  NUTRICIÓN IA — App Logic
// =============================================

// ===== STATE =====
let profile = {};
let meals = [];
let supplements = [];
let metrics = [];
let currentMealType = 'desayuno';
let currentAnalysis = null;
let selectedGoals = [];
let selectedActivity = '';

const MORFEO_TIPS = [
  "Hoy tu ingesta de Vitamina C es baja. Considerá agregar una naranja o pimiento rojo a tu próxima comida. 🍊",
  "Tu consumo de proteínas está por debajo del objetivo. Sumá una porción de pollo, huevo o legumbres. 💪",
  "Excelente equilibrio de macros hoy. Tu metabolismo lo va a agradecer. ⚡",
  "Notamos poca fibra en tu registro. Un puñado de avena o vegetales en tu próxima comida puede ayudar. 🌾",
  "Buen trabajo registrando tus comidas. La consistencia es clave para resultados reales. 🎯",
  "Tu impacto cardiovascular mejora con más omega-3. Considerá salmón o semillas de chía. ❤️",
  "Recordá hidratarte bien: mínimo 8 vasos de agua por día ayudan a tu metabolismo. 💧"
];

const FOOD_DB = [
  { name:"Pollo a la plancha", emoji:"🍗", kcal:165, prot:31, carb:0, fat:3.6, score:88, cardio:85, meta:82, micro:70 },
  { name:"Arroz integral", emoji:"🍚", kcal:112, prot:2.6, carb:23, fat:0.9, score:79, cardio:72, meta:78, micro:65 },
  { name:"Huevo revuelto", emoji:"🥚", kcal:149, prot:10, carb:1.6, fat:11, score:82, cardio:74, meta:81, micro:88 },
  { name:"Avena con leche", emoji:"🥣", kcal:158, prot:6, carb:27, fat:3, score:85, cardio:80, meta:76, micro:72 },
  { name:"Ensalada César", emoji:"🥗", kcal:120, prot:8, carb:6, fat:9, score:74, cardio:78, meta:70, micro:82 },
  { name:"Salmón al horno", emoji:"🐟", kcal:208, prot:28, carb:0, fat:10, score:92, cardio:94, meta:89, micro:90 },
  { name:"Banana", emoji:"🍌", kcal:89, prot:1.1, carb:23, fat:0.3, score:78, cardio:76, meta:80, micro:65 },
  { name:"Yogur griego", emoji:"🫙", kcal:59, prot:10, carb:3.6, fat:0.4, score:86, cardio:81, meta:83, micro:75 },
  { name:"Tostada integral", emoji:"🍞", kcal:80, prot:3, carb:14, fat:1, score:71, cardio:68, meta:72, micro:60 },
  { name:"Lenteja estofada", emoji:"🫘", kcal:230, prot:18, carb:40, fat:0.8, score:90, cardio:82, meta:87, micro:93 },
  { name:"Pizza casera", emoji:"🍕", kcal:266, prot:11, carb:33, fat:10, score:48, cardio:42, meta:50, micro:44 },
  { name:"Medialunas", emoji:"🥐", kcal:280, prot:5, carb:36, fat:14, score:38, cardio:35, meta:40, micro:32 },
  { name:"Batata asada", emoji:"🍠", kcal:103, prot:2.3, carb:24, fat:0.1, score:83, cardio:79, meta:84, micro:78 },
  { name:"Brócoli al vapor", emoji:"🥦", kcal:31, prot:2.5, carb:6, fat:0.4, score:96, cardio:91, meta:90, micro:97 },
  { name:"Pechuga de pavo", emoji:"🦃", kcal:135, prot:28, carb:0, fat:3, score:89, cardio:86, meta:85, micro:80 },
];

const MICROS_MAP = [
  { name:"Vitamina C", unit:"mg", good:90, icon:"🍊" },
  { name:"Vitamina D", unit:"UI", good:600, icon:"☀️" },
  { name:"Hierro", unit:"mg", good:18, icon:"🔴" },
  { name:"Calcio", unit:"mg", good:1000, icon:"🦴" },
  { name:"Magnesio", unit:"mg", good:320, icon:"💚" },
  { name:"Vitamina B12", unit:"µg", good:2.4, icon:"🔵" },
  { name:"Zinc", unit:"mg", good:11, icon:"⚡" },
  { name:"Potasio", unit:"mg", good:2600, icon:"🫶" },
];

const SUPP_RECS = [
  { icon:"☀️", name:"Vitamina D3", why:"La mayoría de las personas en Argentina tiene déficit, especialmente en invierno." },
  { icon:"🐟", name:"Omega-3 (EPA/DHA)", why:"Protege el corazón, reduce inflamación y mejora la cognición." },
  { icon:"💚", name:"Magnesio Bisglicinato", why:"Mejora el sueño, reduce calambres y apoya la función muscular." },
  { icon:"🦠", name:"Probióticos", why:"Fortalece tu microbiota intestinal para mejor digestión e inmunidad." },
];

const MORFEO_RESPONSES = {
  defaults: [
    "¡Buena pregunta! Basándome en tu perfil, te recomiendo enfocarte en aumentar la ingesta de proteínas en cada comida. Esto te ayudará a mantener la masa muscular mientras alcanzas tu objetivo. 🎯",
    "Según tu historial del día, tu hidratación parece correcta. Sin embargo, noté que tus niveles de fibra son bajos. ¿Querés que te sugiera algunas fuentes fáciles de agregar? 🌾",
    "Para tu objetivo de {goal}, lo más importante ahora mismo es la consistencia. Pequeñas mejoras diarias generan resultados duraderos. ¡Seguís bien encaminado/a! 💪",
    "Interesante. Los papers más recientes de nutrición sugieren que combinar proteínas con carbohidratos de bajo índice glucémico post-entrenamiento mejora la recuperación muscular hasta un 30%. 📊",
    "Tu puntuación nutricional de hoy está por encima del promedio de tus últimos 7 días. Mantené el ritmo y vas a ver resultados muy pronto. ✨"
  ],
  analiza: [
    "Analicé tu última semana y encontré algunos patrones: 🔍\n\n✅ **Proteínas**: Bien cubiertas 4 de 7 días\n⚠️ **Fibra**: Baja la mayoría de los días (objetivo: 25g/día)\n⚠️ **Vitamina D**: Posible déficit — considerá suplemento\n✅ **Hidratación**: Dentro del rango recomendado\n\nTu puntaje promedio semanal fue **74/100**. ¡Muy bien!"
  ],
  falta: [
    "Hoy todavía te falta de tu objetivo:\n\n🔴 **Proteínas**: ~{prot_rem}g más\n🟡 **Hierro**: Ingesta baja\n🟡 **Vitamina C**: Podría aumentar\n\nSugerencia: en tu próxima comida sumá pollo o legumbres + alguna verdura de hoja verde."
  ],
  almuerzo: [
    "Para el almuerzo, según tu objetivo de {goal}, te sugiero:\n\n🥗 **Opción 1**: Bowl de pollo a la plancha + quinoa + verduras asadas\n🐟 **Opción 2**: Filete de salmón + puré de batata + ensalada verde\n🫘 **Opción 3**: Lentejas estofadas + arroz integral\n\nCualquiera de estas opciones estaría por encima del puntaje 80. 🎯"
  ],
  suplementos: [
    "Basándome en tu perfil y los déficits detectados, te recomendaría priorizar:\n\n1️⃣ **Vitamina D3** (2.000-4.000 UI/día) — déficit muy común en Argentina\n2️⃣ **Omega-3** (1-2g EPA+DHA/día) — impacto cardiovascular probado\n3️⃣ **Magnesio Bisglicinato** (300mg antes de dormir) — mejor sueño y recuperación\n\nRecordá que los suplementos complementan, no reemplazan, una buena alimentación. 🌿"
  ],
  metabolismo: [
    "Tu impacto metabólico hoy está en **80/100**. Esto significa:\n\n⚡ Tu elección de alimentos mantiene estable tu glucemia\n✅ Buena distribución de macros a lo largo del día\n💡 Para mejorar aún más: evitá harinas refinadas en la cena y priorizá proteínas en el desayuno\n\nEsta estrategia puede mejorar tu puntuación metabólica hasta un **+15 puntos**. 📈"
  ]
};

const SHOPPING_LIST = [
  "🥦 Brócoli", "🍗 Pollo (pechuga)", "🐟 Salmón (filetes)", "🥚 Huevos (docena)",
  "🫘 Lentejas", "🍚 Arroz integral", "🍠 Batata", "🥑 Palta",
  "🍌 Bananas", "🫙 Yogur griego natural", "🌰 Almendras (100g)", "🥣 Avena",
  "🍋 Limones", "🧄 Ajo", "🫒 Aceite de oliva extra virgen", "🥬 Espinaca"
];

// ===== ONBOARDING =====
function nextOnbStep(step) {
  document.querySelectorAll('.onb-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`onb-step-${step}`).classList.add('active');
}

function selectGoal(el) {
  const goal = el.dataset.goal;
  const idx = selectedGoals.indexOf(goal);
  if (idx > -1) {
    // Deseleccionar
    selectedGoals.splice(idx, 1);
    el.classList.remove('selected');
  } else {
    if (selectedGoals.length >= 3) {
      showMessage('Podés seleccionar hasta 3 objetivos ✋');
      return;
    }
    selectedGoals.push(goal);
    el.classList.add('selected');
  }
  const counter = document.getElementById('goal-counter');
  if (counter) counter.textContent = `${selectedGoals.length} de 3 objetivo${selectedGoals.length !== 1 ? 's' : ''} seleccionado${selectedGoals.length !== 1 ? 's' : ''}`;
}

function selectActivity(el) {
  document.querySelectorAll('.activity-item').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedActivity = el.dataset.activity;
}

function finishOnboarding() {
  const name = document.getElementById('user-name')?.value?.trim() || 'Usuario';
  const age = parseInt(document.getElementById('user-age')?.value) || 30;
  const sex = document.getElementById('user-sex')?.value || 'F';
  const weight = parseFloat(document.getElementById('user-weight')?.value) || 70;
  const height = parseInt(document.getElementById('user-height')?.value) || 165;
  const goals = selectedGoals.length > 0 ? selectedGoals : ['saludGeneral'];
  const goal = goals[0]; // objetivo principal para cálculos
  const activity = selectedActivity || 'moderado';

  // BMR (Mifflin-St Jeor) — NB y Otro usan promedio M/F
  let bmr;
  if (sex === 'M') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else if (sex === 'F') {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    // No binario / Otro: promedio de ambas fórmulas
    bmr = 10 * weight + 6.25 * height - 5 * age - 78;
  }

  const activityMult = { sedentario:1.2, ligero:1.375, moderado:1.55, activo:1.725, muyActivo:1.9 };
  let tdee = Math.round(bmr * (activityMult[activity] || 1.55));

  const goalAdj = { perderPeso:-500, ganarMusculo:+300, recuperacionMedica:0, recomposicion:0, saludGeneral:0, longevidad:-100, energia:+100, rendimientoDeportivo:+200, saludMental:0 };
  // Sumar ajuste de todos los objetivos seleccionados, promediando
  const totalAdj = goals.reduce((sum, g) => sum + (goalAdj[g] || 0), 0);
  const targetCals = tdee + Math.round(totalAdj / goals.length);

  // Macros
  const prot = Math.round(weight * 1.8);
  const fat = Math.round(targetCals * 0.28 / 9);
  const carb = Math.round((targetCals - prot * 4 - fat * 9) / 4);

  profile = { name, age, sex, weight, height, goal, goals, activity, tdee, targetCals, prot, carb, fat };
  localStorage.setItem('nutriProfile', JSON.stringify(profile));

  initApp();
}

// ===== INIT APP =====
function initApp() {
  const saved = localStorage.getItem('nutriProfile');
  if (saved) profile = JSON.parse(saved);
  const savedMeals = localStorage.getItem('nutriMeals');
  if (savedMeals) meals = JSON.parse(savedMeals);
  const savedSupps = localStorage.getItem('nutriSupps');
  if (savedSupps) supplements = JSON.parse(savedSupps);
  const savedMetrics = localStorage.getItem('nutriMetrics');
  if (savedMetrics) metrics = JSON.parse(savedMetrics);

  document.getElementById('onboarding').classList.remove('active');
  document.getElementById('app').classList.add('active');

  updateDashboard();
  updateNutricion();
  updatePlan();
  updateSupplements();
  updateProfile();
  showScreen('inicio');
}

// ===== NAVIGATION =====
function showScreen(name) {
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const section = document.getElementById(`tab-${name}`);
  if (section) section.classList.add('active');
  const navBtn = document.getElementById(`nav-${name}`);
  if (navBtn) navBtn.classList.add('active');

  if (name === 'inicio') updateDashboard();
  if (name === 'nutricion') updateNutricion();
  if (name === 'suplementos') updateSupplements();
  if (name === 'plan') updatePlan();
  if (name === 'perfil') updateProfile();
}

// ===== DASHBOARD =====
function updateDashboard() {
  const name = profile.name || 'Usuario';
  document.getElementById('dash-name').textContent = name;
  document.getElementById('user-avatar').textContent = name[0].toUpperCase();

  const now = new Date();
  const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  document.getElementById('dash-date').textContent = `${dias[now.getDay()]}, ${now.getDate()} de ${meses[now.getMonth()]} ${now.getFullYear()}`;

  const todayMeals = getTodayMeals();
  const totals = calcTotals(todayMeals);
  const score = calcDailyScore(totals);

  document.getElementById('score-value').textContent = score;
  document.getElementById('big-score-val').textContent = score;
  updateScoreRing(score);
  document.getElementById('score-status').textContent = scoreLabel(score);
  document.getElementById('cals-val').textContent = totals.kcal.toLocaleString('es-AR');
  document.getElementById('cals-remaining').textContent = Math.max(0, (profile.targetCals || 2000) - totals.kcal).toLocaleString('es-AR');
  document.getElementById('meals-count').textContent = todayMeals.length;

  // Macros bars
  const pg = profile.prot || 120, cg = profile.carb || 180, fg = profile.fat || 60;
  document.getElementById('prot-goal').textContent = pg;
  document.getElementById('carb-goal').textContent = cg;
  document.getElementById('fat-goal').textContent = fg;
  document.getElementById('prot-cur').textContent = Math.round(totals.prot);
  document.getElementById('carb-cur').textContent = Math.round(totals.carb);
  document.getElementById('fat-cur').textContent = Math.round(totals.fat);
  document.getElementById('prot-bar').style.width = Math.min(100, (totals.prot/pg)*100) + '%';
  document.getElementById('carb-bar').style.width = Math.min(100, (totals.carb/cg)*100) + '%';
  document.getElementById('fat-bar').style.width = Math.min(100, (totals.fat/fg)*100) + '%';

  // Meals list
  const dashList = document.getElementById('dashboard-meals-list');
  const empty = document.getElementById('dash-empty');
  if (todayMeals.length === 0) {
    empty.style.display = 'flex';
    dashList.innerHTML = '';
    dashList.appendChild(empty);
  } else {
    empty.style.display = 'none';
    dashList.innerHTML = '';
    todayMeals.slice(-3).forEach(m => dashList.appendChild(createMealItem(m, false)));
  }

  // Morfeo tip
  const tips = MORFEO_TIPS;
  document.getElementById('morfeo-tip-text').textContent = tips[Math.floor(Math.random() * tips.length)];
}

function updateScoreRing(score) {
  const circumference = 314;
  const offset = circumference - (score / 100) * circumference;
  const circle = document.getElementById('score-ring-circle');
  if (circle) circle.setAttribute('stroke-dashoffset', offset);
  const bigCircle = document.getElementById('big-score-circle');
  if (bigCircle) {
    const bigCircumference = 439.8;
    bigCircle.setAttribute('stroke-dashoffset', bigCircumference - (score/100)*bigCircumference);
  }
  const lbl = document.getElementById('big-score-label');
  if (lbl) lbl.textContent = scoreLabel(score);
}

function scoreLabel(score) {
  if (score >= 90) return 'Excelente 🌟';
  if (score >= 80) return 'Muy bueno 🎉';
  if (score >= 70) return 'Bueno 👍';
  if (score >= 55) return 'Regular 🙂';
  return 'Mejorable 💡';
}

// ===== MEALS =====
function selectMealType(btn, type) {
  document.querySelectorAll('.meal-type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentMealType = type;
}

const FOOD_SUGGESTIONS_DEFAULT = ['Pollo a la plancha', 'Arroz integral', 'Ensalada César', 'Avena con leche', 'Salmón al horno', 'Huevo revuelto', 'Lentejas', 'Yogur griego'];

document.addEventListener('DOMContentLoaded', () => {
  const foodSearch = document.getElementById('food-search');
  if (foodSearch) {
    foodSearch.addEventListener('input', () => {
      const val = foodSearch.value.trim().toLowerCase();
      const sugg = document.getElementById('food-suggestions');
      if (val.length < 2) { sugg.innerHTML = ''; return; }
      const matches = FOOD_DB.filter(f => f.name.toLowerCase().includes(val));
      if (matches.length === 0) { sugg.innerHTML = ''; return; }
      sugg.innerHTML = matches.slice(0,5).map(f =>
        `<div class="food-sugg-item" onclick="selectFoodSugg('${f.name}')">${f.emoji} ${f.name} — ${f.kcal} kcal/100g</div>`
      ).join('');
    });
  }
  loadApp();
});

function selectFoodSugg(name) {
  document.getElementById('food-search').value = name;
  document.getElementById('food-suggestions').innerHTML = '';
  analyzeFood();
}

function analyzeFood() {
  const foodName = document.getElementById('food-search').value.trim();
  if (!foodName) { showMessage('Ingresá un alimento para analizar.'); return; }
  const qty = parseFloat(document.getElementById('food-qty').value) || 100;

  const food = FOOD_DB.find(f => f.name.toLowerCase().includes(foodName.toLowerCase()))
    || generateFoodAnalysis(foodName);

  showAnalysisResult(food, qty, foodName);
}

function generateFoodAnalysis(name) {
  // Heuristic generator for unknown foods
  const seed = name.length;
  return {
    name, emoji:'🍽️',
    kcal: 100 + (seed * 7) % 200,
    prot: 5 + (seed * 3) % 25,
    carb: 10 + (seed * 5) % 40,
    fat: 2 + (seed * 2) % 20,
    score: 55 + (seed * 4) % 35,
    cardio: 50 + (seed * 3) % 40,
    meta: 55 + (seed * 4) % 35,
    micro: 45 + (seed * 6) % 45
  };
}

function showAnalysisResult(food, qty, rawName) {
  const factor = qty / 100;
  currentAnalysis = { ...food, qty, mealType: currentMealType, rawName };
  currentAnalysis.kcalTotal = Math.round(food.kcal * factor);
  currentAnalysis.protTotal = Math.round(food.prot * factor * 10) / 10;
  currentAnalysis.carbTotal = Math.round(food.carb * factor * 10) / 10;
  currentAnalysis.fatTotal = Math.round(food.fat * factor * 10) / 10;

  document.getElementById('analysis-result').classList.remove('hidden');
  document.getElementById('analysis-food-name').textContent = food.emoji + ' ' + (food.name || rawName);
  document.getElementById('food-score-badge').textContent = food.score;
  document.getElementById('food-score-badge').style.background = scoreGradient(food.score);

  document.getElementById('analysis-macros').innerHTML = `
    <div class="a-macro"><span class="a-macro-val" style="color:var(--green)">${currentAnalysis.protTotal}g</span><span class="a-macro-lbl">Proteínas</span></div>
    <div class="a-macro"><span class="a-macro-val" style="color:var(--cyan)">${currentAnalysis.carbTotal}g</span><span class="a-macro-lbl">Carbohidratos</span></div>
    <div class="a-macro"><span class="a-macro-val" style="color:var(--purple)">${currentAnalysis.fatTotal}g</span><span class="a-macro-lbl">Grasas</span></div>`;

  // Micros
  const microSample = MICROS_MAP.slice(0, 4).map(m => {
    const val = Math.round(m.good * (0.1 + Math.random() * 0.7));
    const pct = Math.round(val / m.good * 100);
    const ok = pct >= 30;
    return `<div class="micro-row"><span>${m.icon} ${m.name}</span><span class="micro-status ${ok?'micro-ok':'micro-low'}">${ok?'✓ OK':'↑ Bajo'}</span></div>`;
  }).join('');
  document.getElementById('analysis-micros').innerHTML = microSample;

  document.getElementById('analysis-impacts').innerHTML = `
    <div class="a-impact"><div class="a-impact-icon">❤️</div><span class="a-impact-val" style="color:var(--green)">${food.cardio}</span><span class="a-impact-lbl">Cardiovascular</span></div>
    <div class="a-impact"><div class="a-impact-icon">⚡</div><span class="a-impact-val" style="color:var(--cyan)">${food.meta}</span><span class="a-impact-lbl">Metabólico</span></div>
    <div class="a-impact"><div class="a-impact-icon">🦠</div><span class="a-impact-val" style="color:var(--purple)">${food.micro}</span><span class="a-impact-lbl">Microbiota</span></div>`;

  const tips = food.score >= 80
    ? `💡 Excelente elección. Este alimento contribuye positivamente a tu puntaje del día y cubre bien tus macros objetivo.`
    : food.score >= 60
    ? `💡 Buena opción. Para mejorar el score, podés combinarlo con una fuente de proteínas o vegetales de hoja verde.`
    : `💡 Consumo ocasional recomendado. Este alimento tiene alta densidad calórica y bajo aporte nutricional relativo.`;
  document.getElementById('analysis-tip').textContent = tips;

  document.getElementById('food-suggestions').innerHTML = '';
}

function analyzePhoto(input) {
  const file = input.files[0];
  if (!file) return;
  showMessage('Analizando tu foto con IA... 🔍');

  // Simulate AI photo analysis
  setTimeout(() => {
    const randomFood = FOOD_DB[Math.floor(Math.random() * FOOD_DB.length)];
    document.getElementById('food-search').value = randomFood.name;
    document.getElementById('food-qty').value = 200;
    showAnalysisResult(randomFood, 200, randomFood.name);

    const uploadArea = document.getElementById('photo-upload');
    const reader = new FileReader();
    reader.onload = e => {
      uploadArea.style.backgroundImage = `url(${e.target.result})`;
      uploadArea.style.backgroundSize = 'cover';
      uploadArea.style.backgroundPosition = 'center';
      uploadArea.querySelector('.upload-icon').textContent = '✅';
      uploadArea.querySelector('p').textContent = 'Foto analizada';
    };
    reader.readAsDataURL(file);
  }, 1200);
}

function addMeal() {
  if (!currentAnalysis) return;
  const meal = {
    id: Date.now(),
    name: currentAnalysis.name || currentAnalysis.rawName,
    emoji: currentAnalysis.emoji || '🍽️',
    type: currentAnalysis.mealType,
    kcal: currentAnalysis.kcalTotal,
    prot: currentAnalysis.protTotal,
    carb: currentAnalysis.carbTotal,
    fat: currentAnalysis.fatTotal,
    score: currentAnalysis.score,
    qty: currentAnalysis.qty,
    date: new Date().toDateString()
  };
  meals.push(meal);
  localStorage.setItem('nutriMeals', JSON.stringify(meals));
  currentAnalysis = null;
  document.getElementById('analysis-result').classList.add('hidden');
  document.getElementById('food-search').value = '';
  renderMealsLog();
  updateDashboard();
  updateNutricion();
  showMessage('✅ Comida registrada!');
}

function deleteMeal(id) {
  meals = meals.filter(m => m.id !== id);
  localStorage.setItem('nutriMeals', JSON.stringify(meals));
  renderMealsLog();
  updateDashboard();
  updateNutricion();
}

function renderMealsLog() {
  const log = document.getElementById('meals-log');
  const today = getTodayMeals();
  if (today.length === 0) {
    log.innerHTML = '<p class="empty-note">No hay comidas registradas hoy.</p>';
    return;
  }
  const groups = ['desayuno','almuerzo','merienda','cena','snack'];
  let html = '';
  groups.forEach(g => {
    const gMeals = today.filter(m => m.type === g);
    if (gMeals.length === 0) return;
    const labels = { desayuno:'🌅 Desayuno', almuerzo:'☀️ Almuerzo', merienda:'🍎 Merienda', cena:'🌙 Cena', snack:'🥜 Snack' };
    html += `<p style="font-size:0.78rem;color:var(--text-muted);margin:0.75rem 0 0.4rem">${labels[g]}</p>`;
    gMeals.forEach(m => {
      log.appendChild && false; // use innerHTML
      html += mealItemHTML(m);
    });
  });
  log.innerHTML = html;
}

function mealItemHTML(m) {
  const badgeClass = m.score >= 75 ? 'badge-green' : m.score >= 55 ? 'badge-orange' : 'badge-red';
  return `<div class="meal-item">
    <span class="meal-icon">${m.emoji}</span>
    <div class="meal-detail">
      <div class="meal-name">${m.name}</div>
      <div class="meal-meta">${m.qty}g · ${m.kcal} kcal · P:${m.prot}g C:${m.carb}g G:${m.fat}g</div>
    </div>
    <div class="meal-score-badge ${badgeClass}">${m.score}</div>
    <button class="meal-delete" onclick="deleteMeal(${m.id})" title="Eliminar">🗑</button>
  </div>`;
}

function createMealItem(m, showDelete = true) {
  const div = document.createElement('div');
  div.innerHTML = mealItemHTML(m);
  return div.firstChild;
}

function getTodayMeals() {
  const today = new Date().toDateString();
  return meals.filter(m => m.date === today);
}

function calcTotals(mealList) {
  return mealList.reduce((acc, m) => ({
    kcal: acc.kcal + (m.kcal||0),
    prot: acc.prot + (m.prot||0),
    carb: acc.carb + (m.carb||0),
    fat: acc.fat + (m.fat||0),
  }), { kcal:0, prot:0, carb:0, fat:0 });
}

function calcDailyScore(totals) {
  const p = profile;
  if (!p.targetCals) return 76;
  const calsScore = Math.max(0, 100 - Math.abs(totals.kcal - p.targetCals) / p.targetCals * 100);
  const protScore = Math.min(100, (totals.prot / (p.prot||120)) * 100);
  const meals = getTodayMeals();
  const avgFoodScore = meals.length > 0
    ? meals.reduce((s,m) => s + (m.score||70), 0) / meals.length
    : 76;
  return Math.min(99, Math.round((calsScore*0.3 + protScore*0.3 + avgFoodScore*0.4)));
}

function scoreGradient(score) {
  if (score >= 80) return 'linear-gradient(135deg, #4ade80, #22d3ee)';
  if (score >= 60) return 'linear-gradient(135deg, #fb923c, #fbbf24)';
  return 'linear-gradient(135deg, #f87171, #fb923c)';
}

// ===== NUTRICIÓN =====
function updateNutricion() {
  const todayMeals = getTodayMeals();
  const totals = calcTotals(todayMeals);
  const score = calcDailyScore(totals);

  updateScoreRing(score);

  const p = profile;
  const pg = p.prot||120, cg = p.carb||180, fg = p.fat||60;

  document.getElementById('macros-detail').innerHTML = `
    <div class="macro-detail-item glass-card">
      <div class="macro-d-header"><span class="macro-d-name" style="color:var(--green)">💚 Proteínas</span><span class="macro-d-nums">${Math.round(totals.prot)}g / ${pg}g</span></div>
      <div class="macro-d-bar-wrap"><div class="macro-d-bar prot-bar" style="width:${Math.min(100,(totals.prot/pg)*100)}%"></div></div>
    </div>
    <div class="macro-detail-item glass-card">
      <div class="macro-d-header"><span class="macro-d-name" style="color:var(--cyan)">🔵 Carbohidratos</span><span class="macro-d-nums">${Math.round(totals.carb)}g / ${cg}g</span></div>
      <div class="macro-d-bar-wrap"><div class="macro-d-bar carb-bar" style="width:${Math.min(100,(totals.carb/cg)*100)}%"></div></div>
    </div>
    <div class="macro-detail-item glass-card">
      <div class="macro-d-header"><span class="macro-d-name" style="color:var(--purple)">🟣 Grasas</span><span class="macro-d-nums">${Math.round(totals.fat)}g / ${fg}g</span></div>
      <div class="macro-d-bar-wrap"><div class="macro-d-bar fat-bar" style="width:${Math.min(100,(totals.fat/fg)*100)}%"></div></div>
    </div>`;

  // Micros
  document.getElementById('micros-grid').innerHTML = MICROS_MAP.map(m => {
    const val = Math.round(m.good * (0.2 + Math.random() * 0.9));
    const pct = Math.round(val / m.good * 100);
    return `<div class="micro-card">
      <div class="micro-card-name">${m.icon} ${m.name}</div>
      <div class="micro-card-val">${val}${m.unit}</div>
      <div class="micro-card-pct ${pct>=60?'pct-good':'pct-low'}">${pct}% del objetivo</div>
    </div>`;
  }).join('');

  // Impact scores
  const avgScore = todayMeals.length > 0 ? todayMeals.reduce((s,m)=>s+m.score,0)/todayMeals.length : 72;
  ['imp-cardio','imp-meta','imp-micro'].forEach((id,i) => {
    const el = document.getElementById(id);
    if(el) el.style.width = Math.round(avgScore + (i-1)*5) + '%';
  });
}

// ===== MORFEO CHAT =====
function sendChat() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  addChatBubble(text, 'user');
  input.value = '';
  showTyping();
  setTimeout(() => {
    removeTyping();
    addChatBubble(getMorfeoResponse(text), 'bot');
    scrollChat();
  }, 1200 + Math.random() * 600);
}

function sendChip(btn) {
  const text = btn.textContent;
  addChatBubble(text, 'user');
  showTyping();
  setTimeout(() => {
    removeTyping();
    addChatBubble(getMorfeoResponse(text), 'bot');
    scrollChat();
  }, 1400);
}

function getMorfeoResponse(text) {
  const t = text.toLowerCase();
  const goal = goalLabel(profile.goal || 'saludGeneral');

  if (t.includes('analiz') && t.includes('semana')) return MORFEO_RESPONSES.analiza[0];
  if (t.includes('falta') || t.includes('qué me falta')) {
    const remaining = Math.max(0, (profile.prot||120) - calcTotals(getTodayMeals()).prot);
    return MORFEO_RESPONSES.falta[0].replace('{prot_rem}', Math.round(remaining));
  }
  if (t.includes('almuerzo') || t.includes('receta') || t.includes('ideas')) {
    return MORFEO_RESPONSES.almuerzo[0].replace('{goal}', goal);
  }
  if (t.includes('suplemento') || t.includes('vitamina') || t.includes('omega')) {
    return MORFEO_RESPONSES.suplementos[0];
  }
  if (t.includes('metabolismo') || t.includes('impacto')) {
    return MORFEO_RESPONSES.metabolismo[0];
  }
  const defaults = MORFEO_RESPONSES.defaults;
  return defaults[Math.floor(Math.random() * defaults.length)].replace('{goal}', goal);
}

function goalLabel(g) {
  const labels = {
    perderPeso:'perder peso',
    ganarMusculo:'ganar m\u00fasculo',
    recuperacionMedica:'recuperaci\u00f3n de problema m\u00e9dico',
    recomposicion:'recomposici\u00f3n corporal',
    saludGeneral:'salud general',
    longevidad:'longevidad',
    energia:'aumentar energ\u00eda',
    rendimientoDeportivo:'rendimiento deportivo',
    saludMental:'salud mental'
  };
  return labels[g] || 'salud general';
}

function addChatBubble(text, who) {
  const win = document.getElementById('chat-window');
  const div = document.createElement('div');
  div.className = `chat-bubble ${who}`;
  div.innerHTML = text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
  win.appendChild(div);
  scrollChat();
}

function showTyping() {
  const win = document.getElementById('chat-window');
  const div = document.createElement('div');
  div.className = 'chat-bubble typing bot';
  div.id = 'typing-indicator';
  div.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  win.appendChild(div);
  scrollChat();
}

function removeTyping() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

function scrollChat() {
  const win = document.getElementById('chat-window');
  win.scrollTop = win.scrollHeight;
}

// ===== SUPPLEMENTS =====
function openSupplementModal() {
  document.getElementById('supp-modal').classList.remove('hidden');
}

function closeSupplementModal() {
  document.getElementById('supp-modal').classList.add('hidden');
}

function addSupplement() {
  const name = document.getElementById('supp-name').value.trim();
  if (!name) { showMessage('Completá el nombre del suplemento.'); return; }
  const dose = document.getElementById('supp-dose').value || '1 comprimido';
  const freq = document.getElementById('supp-freq').value;
  const time = document.getElementById('supp-time').value;
  const icons = ['💊','🧴','🫙','⚗️','💉','🌿'];
  supplements.push({ id: Date.now(), name, dose, freq, time, taken: false, icon: icons[supplements.length % icons.length] });
  localStorage.setItem('nutriSupps', JSON.stringify(supplements));
  closeSupplementModal();
  document.getElementById('supp-name').value = '';
  document.getElementById('supp-dose').value = '';
  updateSupplements();
}

function deleteSupp(id) {
  supplements = supplements.filter(s => s.id !== id);
  localStorage.setItem('nutriSupps', JSON.stringify(supplements));
  updateSupplements();
}

function toggleSuppTaken(id) {
  const s = supplements.find(s => s.id === id);
  if (s) s.taken = !s.taken;
  localStorage.setItem('nutriSupps', JSON.stringify(supplements));
  updateSupplements();
}

function updateSupplements() {
  const list = document.getElementById('supps-list');
  if (supplements.length === 0) {
    list.innerHTML = '<p class="empty-note">No tenés suplementos registrados. Agregá el primero.</p>';
  } else {
    list.innerHTML = supplements.map(s => `
      <div class="supp-item">
        <span class="supp-icon">${s.icon}</span>
        <div class="supp-detail">
          <div class="supp-name">${s.name} · ${s.dose}</div>
          <div class="supp-meta">${s.freq} · ${s.time}hs</div>
        </div>
        <button class="supp-taken ${s.taken?'done':''}" onclick="toggleSuppTaken(${s.id})">${s.taken?'✓ Tomado':'Tomar'}</button>
        <button class="supp-delete" onclick="deleteSupp(${s.id})">🗑</button>
      </div>
    `).join('');
  }

  // Recommendations
  document.getElementById('supp-recs').innerHTML = SUPP_RECS.map(r => `
    <div class="supp-rec-card">
      <span class="supp-rec-icon">${r.icon}</span>
      <div><div class="supp-rec-name">${r.name}</div><div class="supp-rec-why">${r.why}</div></div>
    </div>
  `).join('');
}

// ===== PLAN =====
function updatePlan() {
  const p = profile;
  const goal = goalLabel(p.goal || 'saludGeneral');
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 60);
  const targetStr = targetDate.toLocaleDateString('es-AR', { day:'numeric', month:'long' });

  document.getElementById('plan-hero').innerHTML = `
    <div class="plan-hero-title">Tu objetivo actual</div>
    <div class="plan-hero-goal">${goalLabel(p.goal||'saludGeneral').charAt(0).toUpperCase() + goalLabel(p.goal||'saludGeneral').slice(1)}</div>
    <div class="plan-duration">📅 Meta para el <strong>${targetStr}</strong></div>
    <p style="font-size:0.82rem;color:var(--text-dim)">Seguí el plan todos los días para llegar al objetivo. Nutrición IA ajusta tu plan automáticamente según tu progreso.</p>
  `;

  document.getElementById('plan-goals').innerHTML = `
    <div class="plan-goal-card"><span class="plan-goal-val">${p.targetCals||'2.000'}</span><span class="plan-goal-lbl">kcal / día</span></div>
    <div class="plan-goal-card"><span class="plan-goal-val" style="color:var(--green)">${p.prot||120}g</span><span class="plan-goal-lbl">Proteínas</span></div>
    <div class="plan-goal-card"><span class="plan-goal-val" style="color:var(--cyan)">${p.carb||180}g</span><span class="plan-goal-lbl">Carbohidratos</span></div>
    <div class="plan-goal-card"><span class="plan-goal-val" style="color:var(--purple)">${p.fat||60}g</span><span class="plan-goal-lbl">Grasas</span></div>
  `;

  document.getElementById('shopping-list').innerHTML = SHOPPING_LIST.map((item, i) =>
    `<div class="shop-item"><div class="shop-check ${i%3===0?'ok':''}"></div><span>${item}</span></div>`
  ).join('');
}

function selectPace(el) {
  document.querySelectorAll('.pace-option').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
}

// ===== PROFILE =====
function updateProfile() {
  const p = profile;
  const name = p.name || 'Usuario';
  document.getElementById('profile-name').textContent = name;
  document.getElementById('profile-avatar-big').textContent = name[0].toUpperCase();
  document.getElementById('user-avatar').textContent = name[0].toUpperCase();
  document.getElementById('profile-goal-label').textContent = 'Meta: ' + (goalLabel(p.goal||'saludGeneral').charAt(0).toUpperCase() + goalLabel(p.goal||'saludGeneral').slice(1));

  const bmi = p.weight && p.height ? (p.weight / ((p.height/100)**2)).toFixed(1) : '--';
  document.getElementById('profile-stats').innerHTML = `
    <div class="profile-stat"><span class="profile-stat-val">${p.weight||'--'} kg</span><span class="profile-stat-lbl">Peso</span></div>
    <div class="profile-stat"><span class="profile-stat-val">${bmi}</span><span class="profile-stat-lbl">IMC</span></div>
    <div class="profile-stat"><span class="profile-stat-val">${p.targetCals||'--'}</span><span class="profile-stat-lbl">kcal/día</span></div>
  `;
}

// ===== UTILS =====
function showMessage(msg) {
  const toast = document.createElement('div');
  toast.style.cssText = `position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:rgba(30,36,51,0.95);border:1px solid rgba(255,255,255,0.1);color:white;padding:0.7rem 1.2rem;border-radius:100px;font-size:0.88rem;font-family:Inter,sans-serif;z-index:9999;white-space:nowrap;backdrop-filter:blur(12px);animation:fadeUp 0.3s ease;`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function resetApp() {
  if (confirm('¿Reiniciar tu perfil? Se borrarán todos tus datos.')) {
    localStorage.clear();
    location.reload();
  }
}

// ===== LOAD =====
function loadApp() {
  const saved = localStorage.getItem('nutriProfile');
  if (saved) {
    profile = JSON.parse(saved);
    const savedMeals = localStorage.getItem('nutriMeals');
    if (savedMeals) meals = JSON.parse(savedMeals);
    const savedSupps = localStorage.getItem('nutriSupps');
    if (savedSupps) supplements = JSON.parse(savedSupps);
    const savedMetrics = localStorage.getItem('nutriMetrics');
    if (savedMetrics) metrics = JSON.parse(savedMetrics);

    document.getElementById('onboarding').classList.remove('active');
    document.getElementById('app').classList.add('active');
    updateDashboard();
    updateNutricion();
    updatePlan();
    updateSupplements();
    updateProfile();
    showScreen('inicio');
    renderMealsLog();
  } else {
    document.getElementById('onboarding').classList.add('active');
  }
}

// ===== INTEGRACIÓN DE APPS =====
function connectApp(appName, btn) {
  const appLabels = {
    garmin: 'Garmin Connect', apple: 'Apple Health', google: 'Google Fit',
    fitbit: 'Fitbit', strava: 'Strava', polar: 'Polar Flow',
    samsung: 'Samsung Health', suunto: 'Suunto'
  };
  btn.textContent = 'Conectando...';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '\u2713 Conectado';
    btn.classList.add('connected');
    btn.disabled = true;
    showMessage(`\u2705 ${appLabels[appName]} conectado correctamente`);
    // Simular carga de datos
    setTimeout(() => importSimulatedData(appName), 800);
  }, 1800);
}

function importSimulatedData(source) {
  const sourceLabels = {
    garmin: 'Garmin', apple: 'Apple Health', google: 'Google Fit',
    fitbit: 'Fitbit', strava: 'Strava', polar: 'Polar Flow',
    samsung: 'Samsung Health', suunto: 'Suunto'
  };
  const today = new Date();
  const entry = {
    id: Date.now(),
    date: today.toLocaleDateString('es-AR'),
    time: today.toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' }),
    steps: 7500 + Math.floor(Math.random() * 4000),
    kcal: 280 + Math.floor(Math.random() * 200),
    dist: (4 + Math.random() * 6).toFixed(1),
    duration: 35 + Math.floor(Math.random() * 40),
    hr: 118 + Math.floor(Math.random() * 30),
    elevation: Math.floor(Math.random() * 200),
    sleep: (6 + Math.random() * 2).toFixed(1),
    water: 1500 + Math.floor(Math.random() * 1000),
    source: sourceLabels[source] || source
  };
  metrics.unshift(entry);
  localStorage.setItem('nutriMetrics', JSON.stringify(metrics));
  renderMetricsHistory();
  showMessage(`\ud83d\udcca Datos de ${sourceLabels[source]} importados`);
}

function saveMetrics() {
  const dateEl = document.getElementById('metric-date');
  const timeEl = document.getElementById('metric-time');
  const steps = document.getElementById('metric-steps')?.value;
  const kcal = document.getElementById('metric-kcal')?.value;
  const dist = document.getElementById('metric-dist')?.value;
  const duration = document.getElementById('metric-duration')?.value;
  const hr = document.getElementById('metric-hr')?.value;
  const elevation = document.getElementById('metric-elevation')?.value;
  const sleep = document.getElementById('metric-sleep')?.value;
  const water = document.getElementById('metric-water')?.value;
  const source = document.getElementById('metric-source')?.value || 'manual';

  if (!steps && !kcal && !dist) {
    showMessage('Completá al menos un campo de métrica \uD83D\uDCC5');
    return;
  }

  const sourceLabels = { garmin:'Garmin', apple:'Apple Health', google:'Google Fit', fitbit:'Fitbit', strava:'Strava', polar:'Polar', samsung:'Samsung Health', suunto:'Suunto', manual:'Manual' };

  const entry = {
    id: Date.now(),
    date: dateEl?.value ? new Date(dateEl.value + 'T12:00:00').toLocaleDateString('es-AR') : new Date().toLocaleDateString('es-AR'),
    time: timeEl?.value || new Date().toLocaleTimeString('es-AR', {hour:'2-digit',minute:'2-digit'}),
    steps: steps ? parseInt(steps) : null,
    kcal: kcal ? parseInt(kcal) : null,
    dist: dist ? parseFloat(dist) : null,
    duration: duration ? parseInt(duration) : null,
    hr: hr ? parseInt(hr) : null,
    elevation: elevation ? parseInt(elevation) : null,
    sleep: sleep ? parseFloat(sleep) : null,
    water: water ? parseInt(water) : null,
    source: sourceLabels[source] || 'Manual'
  };

  metrics.unshift(entry);
  localStorage.setItem('nutriMetrics', JSON.stringify(metrics));

  // Reset form
  ['metric-steps','metric-kcal','metric-dist','metric-duration','metric-hr','metric-elevation','metric-sleep','metric-water'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  renderMetricsHistory();
  showMessage('\u2705 Métricas guardadas correctamente');
}

function renderMetricsHistory() {
  const container = document.getElementById('metrics-history');
  if (!container) return;
  if (metrics.length === 0) {
    container.innerHTML = '<p class="empty-note">No hay métricas cargadas aún. Conectá una app o cargá tus datos manualmente.</p>';
    return;
  }
  container.innerHTML = metrics.slice(0, 10).map(m => `
    <div class="metric-entry glass-card">
      <div class="metric-entry-header">
        <span class="metric-source-badge">${m.source}</span>
        <span class="metric-datetime">${m.date} ${m.time}</span>
        <button class="supp-delete" onclick="deleteMetric(${m.id})" title="Eliminar">🗑</button>
      </div>
      <div class="metric-chips">
        ${m.steps ? `<div class="metric-chip"><span class="mc-icon">🏃</span><span class="mc-val">${m.steps.toLocaleString('es-AR')}</span><span class="mc-lbl">pasos</span></div>` : ''}
        ${m.kcal ? `<div class="metric-chip"><span class="mc-icon">🔥</span><span class="mc-val">${m.kcal}</span><span class="mc-lbl">kcal</span></div>` : ''}
        ${m.dist ? `<div class="metric-chip"><span class="mc-icon">📍</span><span class="mc-val">${m.dist} km</span><span class="mc-lbl">distancia</span></div>` : ''}
        ${m.duration ? `<div class="metric-chip"><span class="mc-icon">⏱️</span><span class="mc-val">${m.duration} min</span><span class="mc-lbl">duración</span></div>` : ''}
        ${m.hr ? `<div class="metric-chip"><span class="mc-icon">❤️</span><span class="mc-val">${m.hr} lpm</span><span class="mc-lbl">FC prom</span></div>` : ''}
        ${m.sleep ? `<div class="metric-chip"><span class="mc-icon">😴</span><span class="mc-val">${m.sleep}h</span><span class="mc-lbl">sueño</span></div>` : ''}
        ${m.water ? `<div class="metric-chip"><span class="mc-icon">💧</span><span class="mc-val">${m.water} ml</span><span class="mc-lbl">hidrat.</span></div>` : ''}
        ${m.elevation ? `<div class="metric-chip"><span class="mc-icon">🏔️</span><span class="mc-val">${m.elevation} m</span><span class="mc-lbl">elevación</span></div>` : ''}
      </div>
    </div>
  `).join('');
}

function deleteMetric(id) {
  metrics = metrics.filter(m => m.id !== id);
  localStorage.setItem('nutriMetrics', JSON.stringify(metrics));
  renderMetricsHistory();
}
