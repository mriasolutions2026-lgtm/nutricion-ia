    const DEFAULT_CLIENT_GEMINI_KEY = 'AQ.Ab8RN6ItiqORVmWfguoQUvre7-9sEo7xTvB7pX1ubcpuPv0RQQ';
    window.DEFAULT_CLIENT_GEMINI_KEY = DEFAULT_CLIENT_GEMINI_KEY;

    // Helper global para resolver la URL del backend Express en entorno local o remoto
    function getBackendApiUrl(endpoint) {
      if (!endpoint) return '';
      if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;
      const customBase = localStorage.getItem('niaApiBaseUrl');
      if (customBase) {
        const cleanBase = customBase.replace(/\/+$/, '');
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
        return cleanBase + cleanEndpoint;
      }
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocal && window.location.port !== '8000') {
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
        return `http://${window.location.hostname}:8000${cleanEndpoint}`;
      }
      return endpoint;
    }
    window.getBackendApiUrl = getBackendApiUrl;

    // Verificar descargo de responsabilidad diario
    const todayStr = new Date().toDateString();
    const lastShown = localStorage.getItem('niaDisclaimerLastShown');
    if (lastShown !== todayStr) {
        const discModal = document.getElementById('nia-daily-disclaimer-modal');
        if (discModal) discModal.classList.remove('hidden');
    }// ===== STATE =====
var profile = window.profile || {};
var meals = window.meals || [];
var supplements = window.supplements || [];
var activities = window.activities || [];
var currentMealType = 'desayuno';
var currentAnalysis = null;
var selectedGoals = [];
var selectedActivity = '';
var selectedFeeling = '';
var metrics = window.metrics || [];

window.profile = profile;
window.meals = meals;
window.supplements = supplements;
window.activities = activities;
window.metrics = metrics;

const FOOD_DB = [
    { name: "Pollo a la plancha", emoji: "🍗", kcal: 165, prot: 31, carb: 0, fat: 3.6, score: 88, cardio: 85, meta: 82, micro: 70 },
    { name: "Arroz integral", emoji: "🍚", kcal: 112, prot: 2.6, carb: 23, fat: 0.9, score: 79, cardio: 72, meta: 78, micro: 65 },
    { name: "Huevo revuelto", emoji: "🥚", kcal: 149, prot: 10, carb: 1.6, fat: 11, score: 82, cardio: 74, meta: 81, micro: 88 },
    { name: "Avena con leche", emoji: "🥣", kcal: 158, prot: 6, carb: 27, fat: 3, score: 85, cardio: 80, meta: 76, micro: 72 },
    { name: "Ensalada César", emoji: "🥗", kcal: 120, prot: 8, carb: 6, fat: 9, score: 74, cardio: 78, meta: 70, micro: 82 },
    { name: "Salmón al horno", emoji: "🐟", kcal: 208, prot: 28, carb: 0, fat: 10, score: 92, cardio: 94, meta: 89, micro: 90 },
    { name: "Banana", emoji: "🍌", kcal: 89, prot: 1.1, carb: 23, fat: 0.3, score: 78, cardio: 76, meta: 80, micro: 65 },
    { name: "Yogur griego", emoji: "🫙", kcal: 59, prot: 10, carb: 3.6, fat: 0.4, score: 86, cardio: 81, meta: 83, micro: 75 },
    { name: "Tostada integral", emoji: "🍞", kcal: 80, prot: 3, carb: 14, fat: 1, score: 71, cardio: 68, meta: 72, micro: 60 },
    { name: "Lentejas", emoji: "🫘", kcal: 230, prot: 18, carb: 40, fat: 0.8, score: 90, cardio: 82, meta: 87, micro: 93 },
    { name: "Quinoa", emoji: "🌾", kcal: 120, prot: 4.4, carb: 21, fat: 1.9, score: 88, cardio: 79, meta: 82, micro: 80 },
    { name: "Batata asada", emoji: "🍠", kcal: 103, prot: 2.3, carb: 24, fat: 0.1, score: 83, cardio: 79, meta: 84, micro: 78 },
    { name: "Brócoli al vapor", emoji: "🥦", kcal: 31, prot: 2.5, carb: 6, fat: 0.4, score: 96, cardio: 91, meta: 90, micro: 97 },
    { name: "Pechuga de pavo", emoji: "🦃", kcal: 135, prot: 28, carb: 0, fat: 3, score: 89, cardio: 86, meta: 85, micro: 80 },
    { name: "Tofu salteado", emoji: "🥢", kcal: 144, prot: 15, carb: 3, fat: 9, score: 84, cardio: 80, meta: 79, micro: 74 },
    { name: "Garbanzos", emoji: "🫘", kcal: 164, prot: 9, carb: 27, fat: 2.6, score: 87, cardio: 83, meta: 85, micro: 82 },
    { name: "Palta", emoji: "🥑", kcal: 160, prot: 2, carb: 9, fat: 15, score: 91, cardio: 88, meta: 87, micro: 85 },
    { name: "Almendras", emoji: "🌰", kcal: 576, prot: 21, carb: 22, fat: 49, score: 88, cardio: 86, meta: 84, micro: 80 },
    { name: "Espinaca salteada", emoji: "🥬", kcal: 23, prot: 2.9, carb: 3.6, fat: 0.4, score: 95, cardio: 90, meta: 88, micro: 92 },
    { name: "Kefir", emoji: "🥛", kcal: 61, prot: 3.5, carb: 4.8, fat: 3.3, score: 88, cardio: 82, meta: 83, micro: 86 },
    { name: "Proteína whey", emoji: "💪", kcal: 120, prot: 25, carb: 3, fat: 2, score: 85, cardio: 78, meta: 83, micro: 60 },
    { name: "Pizza casera", emoji: "🍕", kcal: 266, prot: 11, carb: 33, fat: 10, score: 48, cardio: 42, meta: 50, micro: 44 },
    { name: "Medialunas", emoji: "🥐", kcal: 280, prot: 5, carb: 36, fat: 14, score: 38, cardio: 35, meta: 40, micro: 32 },
    { name: "Medialuna de manteca", emoji: "🥐", kcal: 180, prot: 3.5, carb: 22, fat: 9, score: 45, cardio: 40, meta: 42, micro: 35 },
    { name: "Empanada de carne", emoji: "🥟", kcal: 230, prot: 8.5, carb: 22, fat: 12, score: 70, cardio: 65, meta: 68, micro: 60 },
    { name: "Milanesa de carne", emoji: "🥩", kcal: 280, prot: 22, carb: 16, fat: 14, score: 75, cardio: 70, meta: 74, micro: 68 },
    { name: "Milanesa de pollo", emoji: "🍗", kcal: 240, prot: 25, carb: 14, fat: 9, score: 80, cardio: 75, meta: 78, micro: 70 },
    { name: "Mate cocido / Mate", emoji: "🧉", kcal: 5, prot: 0.2, carb: 1, fat: 0, score: 92, cardio: 95, meta: 90, micro: 85 },
    { name: "Cortado", emoji: "☕", kcal: 25, prot: 1.5, carb: 2, fat: 1, score: 82, cardio: 85, meta: 80, micro: 70 },
    { name: "Tarta de verdura", emoji: "🥧", kcal: 220, prot: 8, carb: 24, fat: 10, score: 82, cardio: 80, meta: 82, micro: 85 },
    { name: "Café negro / solo", emoji: "☕", kcal: 2, prot: 0.1, carb: 0, fat: 0, score: 85, cardio: 88, meta: 85, micro: 70 },
    { name: "Café con leche", emoji: "☕", kcal: 45, prot: 3, carb: 4, fat: 1.5, score: 80, cardio: 75, meta: 78, micro: 65 },
    { name: "Té / Infusión", emoji: "🫖", kcal: 1, prot: 0, carb: 0.2, fat: 0, score: 90, cardio: 92, meta: 88, micro: 80 },
    { name: "Agua", emoji: "💧", kcal: 0, prot: 0, carb: 0, fat: 0, score: 100, cardio: 100, meta: 100, micro: 100 }
];

const MICROS_MAP = [
    { name: "Vitamina C", unit: "mg", good: 90, icon: "🍊" },
    { name: "Hierro", unit: "mg", good: 18, icon: "🔴" }, { name: "Calcio", unit: "mg", good: 1000, icon: "🦴" },
    { name: "Magnesio", unit: "mg", good: 320, icon: "💚" },
    { name: "Zinc", unit: "mg", good: 11, icon: "⚡" }, { name: "Potasio", unit: "mg", good: 2600, icon: "🫶" }
];

// ===== ONBOARDING =====
// ===== EXTENDED CLINICAL STATE =====
let selectedAllergies = [];
let selectedConditions = [];

// Carousel & Slides Logic
let currentOnbSlide = 1;
function nextSlide(n) {
    goToSlide(n);
}
function goToSlide(n) {
    document.querySelectorAll('.carousel-slide').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.carousel-dots .dot').forEach(d => d.classList.remove('active'));
    
    const slide = document.getElementById(`slide-${n}`);
    if (slide) slide.classList.add('active');
    
    const dot = document.getElementById(`dot-${n}`);
    if (dot) dot.classList.add('active');
    
    currentOnbSlide = n;
}
function goToPersonalization() {
    nextOnbStep(2);
}

// Multiple Goal Selection logic for Step 2 (max 3 selections)
function toggleGoalMultiple(el) {
    const goal = el.dataset.goal;
    const index = selectedGoals.indexOf(goal);
    
    if (index > -1) {
        // Deselect
        el.classList.remove('selected');
        selectedGoals.splice(index, 1);
    } else {
        // Select if under limit
        if (selectedGoals.length >= 3) {
            showMsg('Puedes seleccionar hasta 3 prioridades como máximo');
            return;
        }
        el.classList.add('selected');
        selectedGoals.push(goal);
    }
    
    const gc = document.getElementById('goal-counter');
    if (gc) {
        gc.textContent = `${selectedGoals.length} de 3 prioridades seleccionadas`;
    }
}
window.toggleGoalMultiple = toggleGoalMultiple;

// Pre-permissions logic
async function requestCameraPermission() {
    try {
        if (window.Capacitor && window.Capacitor.isNativePlatform()) {
            await window.Capacitor.Plugins.Camera.requestPermissions();
        } else {
            // Web fallback
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
        }
        const btn = document.getElementById('btn-perm-camera');
        if (btn) {
            btn.textContent = '✓ Activo';
            btn.style.background = 'rgba(74,222,128,0.1)';
            btn.style.borderColor = 'rgba(74,222,128,0.2)';
            btn.style.color = 'var(--green)';
            btn.disabled = true;
        }
    } catch (err) {
        console.warn('Camera permission denied:', err);
        showMsg('Permiso de cámara no disponible.');
    }
}

async function requestNotificationPermission() {
    try {
        if (window.Capacitor && window.Capacitor.isNativePlatform()) {
            await window.Capacitor.Plugins.LocalNotifications.requestPermissions();
        } else {
            // Web fallback
            await Notification.requestPermission();
        }
        const btn = document.getElementById('btn-perm-notif');
        if (btn) {
            btn.textContent = '✓ Activo';
            btn.style.background = 'rgba(74,222,128,0.1)';
            btn.style.borderColor = 'rgba(74,222,128,0.2)';
            btn.style.color = 'var(--green)';
            btn.disabled = true;
        }
    } catch (err) {
        console.warn('Notification permission denied:', err);
        showMsg('Permiso de notificaciones no disponible.');
    }
}

function nextOnbStep(n) {
    document.querySelectorAll('.onb-step').forEach(s => s.classList.remove('active'));
    const stepEl = document.getElementById(`onb-step-${n}`);
    if (stepEl) stepEl.classList.add('active');

    // Handle progress bar visibility and progress calculation
    const progressContainer = document.getElementById('onb-progress-container');
    if (progressContainer) {
        if (n === 1 || n === 6) {
            progressContainer.classList.add('hidden');
        } else {
            progressContainer.classList.remove('hidden');
            const totalSteps = 4; // steps 2, 3, 4, 5 (registration flow)
            const currentProgressStep = n - 1;
            const percentage = Math.round((currentProgressStep / totalSteps) * 100);
            
            const progressFill = document.getElementById('onb-progress-bar-fill');
            if (progressFill) progressFill.style.width = `${percentage}%`;
            
            const progressText = document.getElementById('onb-progress-text');
            if (progressText) progressText.textContent = `Paso ${currentProgressStep} de ${totalSteps}`;
        }
    }
}

function validateStep2() {
    if (!Array.isArray(selectedGoals) || selectedGoals.length === 0) {
        showMsg('Debes elegir aunque sea una y hasta 3 prioridades para continuar');
        return;
    }
    nextOnbStep(3);
}

function validateStep3() {
    const name = document.getElementById('user-name')?.value?.trim();
    const email = document.getElementById('user-email')?.value?.trim();
    const age = +document.getElementById('user-age')?.value;
    const weight = +document.getElementById('user-weight')?.value;
    const height = +document.getElementById('user-height')?.value;

    if (!name) {
        showMsg('Por favor ingresá tu nombre');
        return;
    }
    if (!email || !email.includes('@')) {
        showMsg('Por favor ingresá un correo electrónico válido');
        return;
    }
    if (!age || age < 10 || age > 100) {
        showMsg('Por favor ingresá una edad válida');
        return;
    }
    if (!weight || weight < 30 || weight > 300) {
        showMsg('Por favor ingresá un peso válido');
        return;
    }
    if (!height || height < 100 || height > 250) {
        showMsg('Por favor ingresá una altura válida');
        return;
    }
    nextOnbStep(4);
}

function toggleClinicalItem(el, type) {
    const val = el.dataset.value;
    if (type === 'allergy') {
        if (val === 'ninguno') {
            selectedAllergies = ['ninguno'];
            document.querySelectorAll('#allergies-grid .clinical-card').forEach(card => {
                if (card.dataset.value === 'ninguno') {
                    card.classList.add('selected');
                } else {
                    card.classList.remove('selected');
                }
            });
            return;
        } else {
            selectedAllergies = selectedAllergies.filter(x => x !== 'ninguno');
            const noneCard = document.querySelector('#allergies-grid .clinical-card[data-value="ninguno"]');
            if (noneCard) noneCard.classList.remove('selected');
        }

        if (selectedAllergies.includes(val)) {
            selectedAllergies = selectedAllergies.filter(x => x !== val);
            el.classList.remove('selected');
        } else {
            selectedAllergies.push(val);
            el.classList.add('selected');
        }
    } else if (type === 'condition') {
        if (val === 'ninguno') {
            selectedConditions = ['ninguno'];
            document.querySelectorAll('#conditions-grid .clinical-card').forEach(card => {
                if (card.dataset.value === 'ninguno') {
                    card.classList.add('selected');
                } else {
                    card.classList.remove('selected');
                }
            });
            return;
        } else {
            selectedConditions = selectedConditions.filter(x => x !== 'ninguno');
            const noneCard = document.querySelector('#conditions-grid .clinical-card[data-value="ninguno"]');
            if (noneCard) noneCard.classList.remove('selected');
        }

        if (selectedConditions.includes(val)) {
            selectedConditions = selectedConditions.filter(x => x !== val);
            el.classList.remove('selected');
        } else {
            selectedConditions.push(val);
            el.classList.add('selected');
        }
    }
}

async function finishOnboarding() {
    const btn = document.querySelector('button[onclick="finishOnboarding()"]');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '⌛ Generando tu plan personalizado...';
    }

    const name = document.getElementById('user-name')?.value?.trim() || 'Usuario';
    const email = document.getElementById('user-email')?.value?.trim() || '';
    const age = +document.getElementById('user-age')?.value || 30;
    const sex = document.getElementById('user-sex')?.value || 'F';
    const weight = +document.getElementById('user-weight')?.value || 70;
    const height = +document.getElementById('user-height')?.value || 165;
    const targetWeight = +document.getElementById('user-target-weight')?.value || weight;
    const diet = document.getElementById('user-diet')?.value || 'omnivoro';
    const dislikes = document.getElementById('user-dislikes')?.value?.trim() || '';
    const activity = document.getElementById('user-activity')?.value || 'moderado';
    
    if (!email || !email.includes('@')) {
        showMsg('Por favor ingresá un correo electrónico válido');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Ver gráfico de mi plan nutricional';
        }
        return;
    }

    // Reset daily photo counter for fresh registration session
    localStorage.removeItem('niaDailyPhotosCount');

    const goalsArray = (Array.isArray(selectedGoals) && selectedGoals.length > 0) ? selectedGoals : ['saludGeneral'];
    const goal = goalsArray.join(',');
    
    const mult = { sedentario: 1.2, ligero: 1.375, moderado: 1.55, activo: 1.725, muyActivo: 1.9 };
    const bmr = sex === 'M' ? 10 * weight + 6.25 * height - 5 * age + 5 : 10 * weight + 6.25 * height - 5 * age - 161;
    const tdee = Math.round(bmr * (mult[activity] || 1.55));
    
    // Calorie adjustments based on goals and target weight differences
    const adj = { perderPeso: -500, ganarMusculo: 300, recomposicion: 0, saludGeneral: 0, longevidad: -100, energia: 100, rendimientoDeportivo: 200, saludMental: 0 };
    let calorieAdj = 0;
    goalsArray.forEach(g => {
        calorieAdj += adj[g] || 0;
    });

    // If targetWeight is less than current weight, apply a caloric deficit if not already factored in
    const weightDiff = targetWeight - weight;
    if (weightDiff < -2 && !goalsArray.includes('perderPeso')) {
        calorieAdj += -350; // Moderated caloric deficit for fat loss to reach target weight
    } else if (weightDiff > 2 && !goalsArray.includes('ganarMusculo')) {
        calorieAdj += 250; // Moderated caloric surplus for muscle/weight gain
    }

    calorieAdj = Math.max(-600, Math.min(500, calorieAdj));
    const targetCals = tdee + calorieAdj;
    
    // Protein intake adapted to goals
    let protMultiplier = 1.9;
    if (goalsArray.includes('ganarMusculo') || goalsArray.includes('rendimientoDeportivo')) {
        protMultiplier = 2.2;
    } else if (goalsArray.includes('perderPeso')) {
        protMultiplier = 2.0; // Higher protein retention during deficit
    }
    const prot = Math.round(weight * protMultiplier);
    
    const fat = Math.round(targetCals * 0.28 / 9);
    const carb = Math.round((targetCals - prot * 4 - fat * 9) / 4);

    profile = { 
        name, email, age, sex, weight, height, targetWeight, diet, goal, activity, 
        tdee, targetCals, prot, carb, fat,
        allergies: selectedAllergies, 
        conditions: selectedConditions, 
        dislikes 
    };

    // INTENTAR CREAR/GUARDAR PERFIL EN SUPABASE AUTOMÁTICAMENTE
    try {
        const response = await fetch('/api/auth/identify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, profileData: profile })
        });
        if (response.ok) {
            const data = await response.json();
            if (data.token) {
                localStorage.setItem('niaSaasToken', data.token);
            }
        }
        localStorage.setItem('niaDisclaimerLastShown', new Date().toDateString());
    } catch (e) {
        console.warn('⚠️ No se pudo registrar el perfil en la nube durante el onboarding. Operando en modo local.', e.message);
        localStorage.setItem('niaDisclaimerLastShown', new Date().toDateString());
    }

    // Show AI simulation loader with responsive timing
    const loadingScreen = document.getElementById('onboarding-loading');
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
        
        // Sequence steps animation
        const steps = ['l-step-1', 'l-step-2', 'l-step-3', 'l-step-4', 'l-step-5'];
        const stepDelay = 350;
        steps.forEach((sId, index) => {
            setTimeout(() => {
                const stepEl = document.getElementById(sId);
                if (stepEl) {
                    stepEl.classList.add('active');
                    if (index > 0) {
                        const prevEl = document.getElementById(steps[index - 1]);
                        if (prevEl) {
                            prevEl.classList.remove('active');
                            prevEl.classList.add('completed');
                        }
                    }
                }
            }, index * stepDelay);
        });

        // Finally launch application after simulation completes
        setTimeout(() => {
            const lastEl = document.getElementById(steps[steps.length - 1]);
            if (lastEl) {
                lastEl.classList.remove('active');
                lastEl.classList.add('completed');
            }
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = 'Ver gráfico de mi plan nutricional';
                }
                showOnboardingSummary();
            }, 150);
        }, steps.length * stepDelay);
    } else {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Ver gráfico de mi plan nutricional';
        }
        showOnboardingSummary();
    }
}

function niaPopulateOnboardingInputs() {
    const p = profile || {};
    const nameEl = document.getElementById('user-name');
    if (nameEl) nameEl.value = p.name || '';
    const ageEl = document.getElementById('user-age');
    if (ageEl) ageEl.value = p.age || '';
    const sexEl = document.getElementById('user-sex');
    if (sexEl) sexEl.value = p.sex || 'F';
    const weightEl = document.getElementById('user-weight');
    if (weightEl) weightEl.value = p.weight || '';
    const heightEl = document.getElementById('user-height');
    if (heightEl) heightEl.value = p.height || '';
    const targetWeightEl = document.getElementById('user-target-weight');
    if (targetWeightEl) targetWeightEl.value = p.targetWeight || p.weight || '';
    const dietEl = document.getElementById('user-diet');
    if (dietEl) dietEl.value = p.diet || 'omnivoro';
    const dislikesEl = document.getElementById('user-dislikes');
    if (dislikesEl) dislikesEl.value = p.dislikes || '';

    // Set selectedGoals and select cards
    const goalString = p.goal || 'saludGeneral';
    selectedGoals = goalString.split(',').filter(g => g.trim() !== '');
    document.querySelectorAll('.goal-card').forEach(c => {
        if (selectedGoals.includes(c.dataset.goal)) c.classList.add('selected');
        else c.classList.remove('selected');
    });
    const gc = document.getElementById('goal-counter');
    if (gc) gc.textContent = `${selectedGoals.length} de 3 prioridades seleccionadas`;

    const btn = document.getElementById('btn-validate-step-2');
    if (btn) btn.disabled = selectedGoals.length === 0;

    // Set selectedActivity and select item
    selectedActivity = p.activity || 'moderado';
    document.querySelectorAll('.activity-item').forEach(c => {
        if (c.dataset.activity === selectedActivity) c.classList.add('selected');
        else c.classList.remove('selected');
    });

    // Populate allergies selection cards
    selectedAllergies = Array.isArray(p.allergies) ? p.allergies : [];
    document.querySelectorAll('#allergies-grid .clinical-card').forEach(c => {
        if (selectedAllergies.includes(c.dataset.value)) c.classList.add('selected');
        else c.classList.remove('selected');
    });

    // Populate conditions selection cards
    selectedConditions = Array.isArray(p.conditions) ? p.conditions : [];
    document.querySelectorAll('#conditions-grid .clinical-card').forEach(c => {
        if (selectedConditions.includes(c.dataset.value)) c.classList.add('selected');
        else c.classList.remove('selected');
    });
}

function niaEditProfileFromOnboarding(startStep = 2) {
    niaPopulateOnboardingInputs();
    const appEl = document.getElementById('app');
    if (appEl) appEl.classList.remove('active');
    const onbEl = document.getElementById('onboarding');
    if (onbEl) onbEl.classList.add('active');
    nextOnbStep(startStep);
}

function niaCheckMidnightRollover() {
  const todayStr = new Date().toISOString().split('T')[0];
  const lastActiveDate = localStorage.getItem('niaLastActiveMealDate');

  if (lastActiveDate && lastActiveDate !== todayStr) {
    // Se superaron las 00:01 hs del día siguiente: guardar resumen del día anterior
    const previousMeals = Array.isArray(window.meals) ? window.meals.filter(m => {
      const d = m.date ? new Date(m.date).toISOString().split('T')[0] : '';
      return d === lastActiveDate;
    }) : [];

    if (previousMeals.length > 0) {
      let summaries = {};
      try { summaries = JSON.parse(localStorage.getItem('nutriMealSummaries') || '{}'); } catch(e) {}
      const totalCals = previousMeals.reduce((s, m) => s + (m.kcal || m.calories || 0), 0);
      summaries[lastActiveDate] = {
        date: lastActiveDate,
        mealsCount: previousMeals.length,
        totalCals: totalCals,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('nutriMealSummaries', JSON.stringify(summaries));
    }

    // Resetear hidratación activa diaria a 0 a las 00:01 hs
    if (typeof hydrationLog !== 'undefined' && Array.isArray(hydrationLog)) {
      hydrationLog = hydrationLog.filter(item => {
        const itemDate = item.date || (item.timestamp ? new Date(item.timestamp).toISOString().split('T')[0] : '');
        return itemDate === todayStr;
      });
      localStorage.setItem('nutriHydrationLog', JSON.stringify(hydrationLog));
    }

    // Actualizar marcadores diarios a 0 para el nuevo día
    if (typeof updateDashboard === 'function') updateDashboard();
    if (typeof updateHydrationUI === 'function') updateHydrationUI();
    if (typeof renderMealsLog === 'function') renderMealsLog();
    if (typeof updateDailyProgressBar === 'function') updateDailyProgressBar();
  }
  localStorage.setItem('niaLastActiveMealDate', todayStr);
}
window.niaCheckMidnightRollover = niaCheckMidnightRollover;

// ===== INIT =====
function initApp() {
    const sp = localStorage.getItem('nutriProfile');
    if (sp) profile = JSON.parse(sp);
    const sm = localStorage.getItem('nutriMeals');
    if (sm) meals = JSON.parse(sm);
    const ss = localStorage.getItem('nutriSupps');
    if (ss) supplements = JSON.parse(ss);
    const sa = localStorage.getItem('nutriActivities');
    if (sa) activities = JSON.parse(sa);
    const savedMetrics = localStorage.getItem('nutriMetrics');
    if (savedMetrics) metrics = JSON.parse(savedMetrics);
    
    niaCheckMidnightRollover();

    // Update daily progress bar
    updateDailyProgressBar();
    
    document.getElementById('onboarding').classList.remove('active');
    document.getElementById('app').classList.add('active');
    updateDashboard(); updateNutricion(); updateProfile();
    if (typeof niaRenderWeeklyTicketsUI === 'function') niaRenderWeeklyTicketsUI();
    if (typeof niaScheduleDailyReminders === 'function') niaScheduleDailyReminders();

    
    // Check if we need to redirect to a specific tab from onboarding or start first-time tour
    const redirectTab = localStorage.getItem('niaFinishRedirect');
    if (redirectTab) {
        localStorage.removeItem('niaFinishRedirect');
        showScreen(redirectTab);
        if (redirectTab === 'comidas') {
            niaSelectMealDay('today');
        }
        renderMealsLog();
    } else if (localStorage.getItem('niaFirstTimeTour') === 'true') {
        localStorage.removeItem('niaFirstTimeTour'); // Consume
        
        // Directly redirect to comidas (meals upload) on first time login
        showScreen('comidas');
        niaSelectMealDay('today');
        renderMealsLog();
    } else {
        showScreen('home');
        renderMealsLog();
    }
}

function startNewUserExperience(registerNow) {
    const modal = document.getElementById('new-user-welcome-modal');
    if (modal) modal.classList.add('hidden');
    
    // Ensure all tooltips and tour overlay are hidden
    const overlay = document.getElementById('onb-tour-overlay');
    if (overlay) overlay.classList.add('hidden');
    document.querySelectorAll('.onb-tooltip').forEach(t => t.classList.add('hidden'));
    window.currentTourStep = 0;
    
    showScreen('comidas');
    niaSelectMealDay('today');
}
window.startNewUserExperience = startNewUserExperience;

// ===== NAV =====
function showScreen(name) {
    if (name !== 'comidas' && typeof niaTargetMealDate !== 'undefined' && niaTargetMealDate !== null) {
        niaCancelMealsFlow();
    }
    // Map legacy screen names to consolidated screen names
    if (name === 'inicio') name = 'home';
    if (name === 'suplementos') name = 'nutricion';
    if (name === 'apps') name = 'actividad';
    if (name === 'hidratacion') {
        localStorage.setItem('niaScrollToHydration', 'true');
        name = 'comidas';
    }
    if (name === 'logros') name = 'home';
    if (name === 'progreso') name = 'home';
    if (name === 'cuerpo') name = 'nutricion';

    document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
    const sec = document.getElementById(`tab-${name}`);
    if (sec) sec.classList.add('active');
    const btn = document.getElementById(`nav-${name}`);
    if (btn) btn.classList.add('active');
    
    if (name === 'home') {
        updateDashboard();
        if (typeof niaRenderWeeklyTicketsUI === 'function') niaRenderWeeklyTicketsUI();
        if (typeof checkAchievements === 'function') checkAchievements();
        if (typeof updateHomeStatsSummary === 'function') updateHomeStatsSummary();
        if (typeof renderProgressCharts === 'function') {
            setTimeout(() => renderProgressCharts(currentPeriodDays), 100);
        }
    }
    if (name === 'nutricion') {
        updateNutricion();
        if (typeof updateSupplements === 'function') updateSupplements();
        if (typeof updateBodyUI === 'function') updateBodyUI();
    }
    if (name === 'actividad') {
        updateActivityPage();
        if (typeof renderMetricsHistory === 'function') renderMetricsHistory();
    }
    if (name === 'comidas') {
        niaCheckMidnightRollover();
        if (typeof niaSelectMealDay === 'function') niaSelectMealDay('today');
        if (typeof renderMealsLog === 'function') renderMealsLog();
        if (typeof updateHydrationUI === 'function') updateHydrationUI();
        if (localStorage.getItem('niaScrollToHydration') === 'true') {
            localStorage.removeItem('niaScrollToHydration');
            setTimeout(() => {
                const el = document.getElementById('comidas-hydration-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 350);
        }
    }
    if (name === 'perfil') updateProfile();
    if (name === 'recetas') initRecipes();
}

// ===== DASHBOARD =====
function updateDashboard() {
    const rawName = profile.name ? profile.name.trim() : '';
    const firstName = rawName.split(' ')[0];
    const dashNameEl = document.getElementById('dash-name');
    if (dashNameEl) {
        dashNameEl.textContent = firstName ? `, ${firstName}` : '';
    }
    const av = document.getElementById('user-avatar');
    if (av) av.textContent = firstName ? firstName[0].toUpperCase() : 'N';
    const now = new Date();
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const dd = document.getElementById('dash-date');
    if (dd) dd.textContent = `${dias[now.getDay()]}, ${now.getDate()} de ${meses[now.getMonth()]} ${now.getFullYear()}`;
    const today = getTodayMeals();
    const tot = calcTotals(today);
    const score = calcDailyScore(tot, today);
    const sv = document.getElementById('score-value'); if (sv) sv.textContent = score;
    updateScoreRing(score);
    const cals = document.getElementById('cals-val'); if (cals) cals.textContent = tot.kcal.toLocaleString('es-AR');
    const rem = document.getElementById('cals-remaining');
    const todayActKcal = getTodayActivities().reduce((s, a) => s + (a.kcal || 0), 0);
    if (!profile.targetCals) {
        showMsg("⚠️ Falta configurar tu objetivo calórico. Por favor completá tu Perfil.");
    }
    const netTarget = (profile.targetCals || 2000) + todayActKcal;
    if (rem) rem.textContent = Math.max(0, netTarget - tot.kcal).toLocaleString('es-AR');
    const mc = document.getElementById('meals-count'); if (mc) mc.textContent = today.length;
    const ak = document.getElementById('activity-kcal-dash'); if (ak) ak.textContent = todayActKcal;
    const pg = profile.prot || 120, cg = profile.carb || 180, fg = profile.fat || 60;
    ['prot', 'carb', 'fat'].forEach(m => {
        const goal = { prot: pg, carb: cg, fat: fg }[m];
        const cur = { prot: tot.prot, carb: tot.carb, fat: tot.fat }[m];
        const gc = document.getElementById(`${m}-goal`); if (gc) gc.textContent = goal;
        const cc = document.getElementById(`${m}-cur`); if (cc) cc.textContent = Math.round(cur);
        const bar = document.getElementById(`${m}-bar`); if (bar) bar.style.width = Math.min(100, (cur / goal) * 100) + '%';
    });
    const dl = document.getElementById('dashboard-meals-list');
    const de = document.getElementById('dash-empty');
    if (dl) {
        dl.innerHTML = '';
        if (today.length === 0) {
            if (de) {
                de.style.display = 'flex';
                dl.appendChild(de);
            }
        } else {
            if (de) de.style.display = 'none';

            // Calculate calories by type
            const calsByType = { desayuno: 0, brunch: 0, almuerzo: 0, merienda: 0, cena: 0, snack: 0 };
            today.forEach(m => {
                const t = m.type || 'almuerzo';
                const calories = m.kcal || 0;
                if (calsByType[t] !== undefined) {
                    calsByType[t] += calories;
                } else if (t === 'colacion' || t === 'snack') {
                    calsByType.snack += calories;
                } else {
                    calsByType.almuerzo += calories;
                }
            });

            const totalCalsIngested = Object.values(calsByType).reduce((a, b) => a + b, 0);
            const pctByType = {};
            for (const key in calsByType) {
                pctByType[key] = totalCalsIngested > 0 ? (calsByType[key] / totalCalsIngested) * 100 : 0;
            }

            let lastAngle = 0;
            const slices = [];
            const activeTypes = [
                { key: 'desayuno', label: 'Desayuno', color: '#f59e0b' },
                { key: 'brunch', label: 'Brunch', color: '#10b981' },
                { key: 'almuerzo', label: 'Almuerzo', color: '#3b82f6' },
                { key: 'snack', label: 'Colación', color: '#f97316' },
                { key: 'merienda', label: 'Merienda', color: '#8b5cf6' },
                { key: 'cena', label: 'Cena', color: '#6366f1' }
            ];

            activeTypes.forEach(t => {
                const pct = pctByType[t.key] || 0;
                if (pct > 0) {
                    const startAngle = lastAngle;
                    const endAngle = lastAngle + (pct * 3.6);
                    slices.push(`${t.color} ${startAngle}deg ${endAngle}deg`);
                    lastAngle = endAngle;
                }
            });

            const gradientStr = slices.length > 0 ? `conic-gradient(${slices.join(', ')})` : 'rgba(255,255,255,0.05)';

            const chartHTML = `
              <div class="meal-distribution-container" style="display: flex; align-items: center; justify-content: space-around; gap: 1.5rem; padding: 1.25rem; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); width: 100%;">
                <div class="meal-pie-chart-wrap" style="position: relative; width: 120px; height: 120px; flex-shrink: 0;">
                  <div class="meal-pie-chart" style="width: 100%; height: 100%; border-radius: 50%; background: ${gradientStr};"></div>
                  <div class="meal-pie-center" style="position: absolute; top: 12px; left: 12px; width: 96px; height: 96px; border-radius: 50%; background: var(--bg); display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: inset 0 2px 8px rgba(0,0,0,0.1);">
                    <span style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Ingerido</span>
                    <span style="font-size: 1.1rem; font-weight: 800; color: var(--text);">${totalCalsIngested}</span>
                    <span style="font-size: 0.6rem; color: var(--text-dim);">kcal</span>
                  </div>
                </div>
                <div class="meal-pie-legend" style="flex-grow: 1; display: flex; flex-direction: column; gap: 0.5rem;">
                  ${activeTypes.map(t => {
                      const pct = pctByType[t.key] || 0;
                      const cals = calsByType[t.key] || 0;
                      if ((t.key === 'brunch' || t.key === 'snack') && cals === 0) return '';
                      return `
                        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem;">
                          <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${t.color};"></span>
                            <span style="color: var(--text-dim);">${t.label}</span>
                          </div>
                          <div style="font-weight: 700; color: var(--text);">
                            <span>${Math.round(pct)}%</span>
                            <span style="font-size: 0.7rem; font-weight: 400; color: var(--text-dim); margin-left: 4px;">(${cals} kcal)</span>
                          </div>
                        </div>
                      `;
                  }).join('')}
                </div>
              </div>
            `;
            dl.innerHTML = chartHTML;
        }
    }
    // activity summary
    const todayActs = getTodayActivities();
    const ase = document.getElementById('act-sum-empty');
    const asl = document.getElementById('act-sum-list');
    if (todayActs.length === 0) { if (ase) ase.style.display = 'flex'; if (asl) asl.style.display = 'none'; }
    else {
        if (ase) ase.style.display = 'none';
        if (asl) { asl.style.display = 'block'; asl.innerHTML = todayActs.map(a => `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:.85rem"><span>${ACTIVITY_EMOJIS[a.type] || '🏃'}</span><span style="flex:1">${ACTIVITY_NAMES[a.type] || a.type} · ${a.duration}min</span><span style="color:var(--orange);font-weight:700">${a.kcal} kcal</span></div>`).join(''); }
    }
    // Nutri tip
    const tips = getTips();
    const nt = document.getElementById('nutri-tip-text');
    if (nt) nt.textContent = tips[Math.floor(Math.random() * tips.length)];
}

function isFoodCompliantWithDiet(foodName, diet) {
  if (!diet || diet === 'omnivoro' || diet === 'flexitariano') return true;
  
  const lower = foodName.toLowerCase();
  const animalKeywords = ['pollo', 'carne', 'vacuno', 'pescado', 'atún', 'salmon', 'salmón', 'jamón', 'jamon', 'pavo', 'cerdo', 'lomo', 'bife', 'asado', 'mariscos', 'langostinos', 'camarones', 'merluza'];
  const dairyKeywords = ['leche', 'queso', 'yogur', 'huevo', 'manteca', 'crema', 'mozzarella', 'whey'];
  
  if (diet === 'vegano' || diet === 'crudivoro') {
    const hasAnimal = animalKeywords.some(kw => lower.includes(kw));
    const hasDairy = dairyKeywords.some(kw => lower.includes(kw));
    return !hasAnimal && !hasDairy;
  }
  
  if (diet === 'vegetariano') {
    const hasAnimal = animalKeywords.some(kw => lower.includes(kw));
    return !hasAnimal;
  }
  
  if (diet === 'pescetariano') {
    const terrestrialKeywords = ['pollo', 'carne', 'vacuno', 'jamón', 'jamon', 'pavo', 'cerdo', 'lomo', 'bife', 'asado'];
    const hasTerrestrial = terrestrialKeywords.some(kw => lower.includes(kw));
    return !hasTerrestrial;
  }

  if (diet === 'sinGluten') {
    const glutenKeywords = ['trigo', 'pan', 'tostada integral', 'pizza', 'medialunas', 'avena', 'cebada', 'centeno', 'harina'];
    const hasGluten = glutenKeywords.some(kw => lower.includes(kw));
    return !hasGluten;
  }

  if (diet === 'sinLactosa') {
    const hasDairy = dairyKeywords.some(kw => lower.includes(kw));
    return !hasDairy;
  }
  
  if (diet === 'cetogenico') {
    const highCarbKeywords = ['arroz', 'avena', 'lentejas', 'garbanzos', 'batata', 'tostada', 'pizza', 'medialunas', 'banana'];
    const hasHighCarb = highCarbKeywords.some(kw => lower.includes(kw));
    return !hasHighCarb;
  }

  if (diet === 'paleo') {
    const forbiddenKeywords = ['leche', 'yogur', 'queso', 'mozzarella', 'kefir', 'whey', 'arroz', 'avena', 'tostada', 'harina', 'pizza', 'medialunas', 'lentejas', 'garbanzos', 'soja', 'tofu'];
    const hasForbidden = forbiddenKeywords.some(kw => lower.includes(kw));
    return !hasForbidden;
  }
  
  return true;
}

function getTips() {
    const diet = profile.diet || 'omnivoro';
    const isVegan = diet === 'vegano';
    const base = [
        "La vitamina C potencia hasta 6 veces la absorción de hierro no-hemo de legumbres y verduras. Sumá cítricos a tus comidas.",
        "El magnesio participa en más de 300 reacciones enzimáticas. Déficit muy frecuente: semillas de calabaza, cacao y almendras lo aportan.",
        "El timing proteico importa: distribuí proteína en 4-5 tomas diarias para maximizar la síntesis muscular (MPS).",
        "Hidratarse bien: la deshidratación del 2% ya reduce rendimiento físico y cognitivo. Orina amarillo pálido = buena hidratación.",
        isVegan 
          ? "Los probióticos de kéfir de agua, kombucha y chucrut mejoran la microbiota intestinal, base de la salud inmune y mental."
          : "Los probióticos de kéfir, yogur natural y chucrut mejoran la microbiota intestinal, base de la salud inmune y mental."
    ];
    const dietTips = {
        vegano: ["Suplementá B12 siempre (250-1000 µg/día): ningún alimento vegetal la aporta de forma confiable.", "Combiná arroz + legumbres para obtener proteína completa con todos los aminoácidos esenciales.", "El aceite de microalgas es la única fuente vegana directa de DHA y EPA (omega-3 activos)."],
        vegetariano: ["El huevo es la proteína de mayor valor biológico (VB=100) y aporta vitamina D, B12 y colina cerebral.", "El yogur griego duplica la proteína del yogur normal y aporta probióticos beneficiosos para la microbiota."],
        cetogenico: ["En cetosis, el magnesio y el sodio se excretan más. Asegurate de consumir aguacate, nueces y sal en moderación.", "El déficit de fibra es el mayor riesgo del keto: sumá verduras de hoja verde, brócoli y semillas de chía."],
        mediterraneo: ["El AOVE contiene oleocantal con efecto antiinflamatorio similar al ibuprofeno. Usalo en crudo para preservar sus polifenoles."]
    };
    return [...base, ...(dietTips[diet] || [])];
}

// ===== SCORE =====
function calcDailyScore(tot, mealList) {
    if (!profile.targetCals || mealList.length === 0) return 0;
    const cS = Math.max(0, 100 - Math.abs(tot.kcal - profile.targetCals) / profile.targetCals * 100);
    const pS = Math.min(100, (tot.prot / (profile.prot || 120)) * 100);
    const avg = mealList.length > 0 ? mealList.reduce((s, m) => s + (m.score || 70), 0) / mealList.length : 0;
    return Math.min(99, Math.round(cS * 0.3 + pS * 0.3 + avg * 0.4));
}
function updateScoreRing(score) {
    const today = getTodayMeals();
    const hasMeals = today.length > 0;
    
    const c = document.getElementById('score-ring-circle');
    if (c) c.setAttribute('stroke-dashoffset', hasMeals ? (314 - (score / 100) * 314) : 314);
    
    const bc = document.getElementById('big-score-circle');
    if (bc) bc.setAttribute('stroke-dashoffset', hasMeals ? (439.8 - (score / 100) * 439.8) : 439.8);
    
    const bl = document.getElementById('big-score-label');
    if (bl) bl.textContent = hasMeals ? scoreLabel(score) : 'Sin registros hoy';
    
    const bv = document.getElementById('big-score-val');
    if (bv) bv.textContent = hasMeals ? score : '--';
    
    const ss = document.getElementById('score-status');
    if (ss) ss.textContent = hasMeals ? scoreLabel(score) : 'Sin registros hoy';
}
function scoreLabel(s) {
    if (!s || s === 0) return 'Sin registros hoy';
    if (s >= 90) return 'Excelente 🌟'; if (s >= 80) return 'Muy bueno 🎉';
    if (s >= 70) return 'Bueno 👍'; if (s >= 55) return 'Regular 🙂'; return 'Mejorable 💡';
}
function scoreGradient(s) {
    if (s >= 80) return 'linear-gradient(135deg,#4ade80,#22d3ee)';
    if (s >= 60) return 'linear-gradient(135deg,#fb923c,#fbbf24)';
    return 'linear-gradient(135deg,#f87171,#fb923c)';
}

function niaGetEmptyStateHTML(iconType, title, desc, actionBtnHTML = '') {
    let svgIcon = '';
    if (iconType === 'utensils') {
        svgIcon = `<svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v4M21 15V2v0a5 5 0 0 0-5 5v3c0 1.1.9 2 2 2h3Zm0 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3M12 15v7M12 15h1.5a2.5 2.5 0 0 0 0-5H12M12 10V7a3 3 0 0 0-3-3H6.5a2.5 2.5 0 0 0 0 5H9"></path></svg>`;
    } else if (iconType === 'calendar') {
        svgIcon = `<svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
    } else if (iconType === 'activity') {
        svgIcon = `<svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`;
    } else if (iconType === 'pill') {
        svgIcon = `<svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path><path d="m8.5 8.5 7 7"></path></svg>`;
    } else if (iconType === 'scale') {
        svgIcon = `<svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line></svg>`;
    } else if (iconType === 'droplet') {
        svgIcon = `<svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z"></path></svg>`;
    } else if (iconType === 'award') {
        svgIcon = `<svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>`;
    } else {
        svgIcon = `<svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    }
    return `
      <div class="empty-state-container">
        ${svgIcon}
        <h3 class="empty-state-title">${title}</h3>
        <p class="empty-state-desc">${desc}</p>
        ${actionBtnHTML ? `<div style="margin-top: 8px;">${actionBtnHTML}</div>` : ''}
      </div>
    `;
}

// ===== MEALS =====
function selectMealType(btn, type) {
    document.querySelectorAll('.meal-type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); currentMealType = type;
}
function analyzeFood() {
    const fn = document.getElementById('food-search')?.value?.trim();
    if (!fn) { showMsg('Ingresá un alimento para analizar.'); return; }
    const qty = +document.getElementById('food-qty').value || 100;
    const food = FOOD_DB.find(f => f.name.toLowerCase().includes(fn.toLowerCase())) || generateFood(fn);
    showAnalysis(food, qty, fn);
}

// ===== 4-PART MEAL ANALYZER =====
function analyzeMealComponents() {
    const components = [
        { key: 'proteinas', label: 'Proteínas', emoji: '💪' },
        { key: 'vegetales', label: 'Vegetales', emoji: '🥦' },
        { key: 'hidratos',  label: 'Hidratos',  emoji: '🍚' },
        { key: 'postre',    label: 'Postre',     emoji: '🍮' }
    ];

    let totalKcal = 0, totalProt = 0, totalCarb = 0, totalFat = 0;
    let totalCardio = 0, totalMeta = 0, totalMicro = 0, totalScore = 0;
    let validCount = 0;
    let namesList = [];

    components.forEach(comp => {
        const nameEl = document.getElementById(`comp-${comp.key}-name`);
        const qtyEl  = document.getElementById(`comp-${comp.key}-qty`);
        const name = nameEl ? nameEl.value.trim() : '';
        const qty  = qtyEl  ? (+qtyEl.value || 0) : 0;
        if (!name || qty <= 0) return;

        const food = FOOD_DB.find(f => f.name.toLowerCase().includes(name.toLowerCase())) || generateFood(name);
        const factor = qty / 100;
        totalKcal  += Math.round(food.kcal  * factor);
        totalProt  += +(food.prot  * factor).toFixed(1);
        totalCarb  += +(food.carb  * factor).toFixed(1);
        totalFat   += +(food.fat   * factor).toFixed(1);
        totalCardio += food.cardio;
        totalMeta   += food.meta;
        totalMicro  += food.micro;
        totalScore  += food.score;
        validCount++;
        namesList.push(`${comp.emoji} ${name} (${qty}g)`);
    });

    if (validCount === 0) { showMsg('Ingresá al menos un componente con nombre y gramos.'); return; }

    const avgCardio = Math.round(totalCardio / validCount);
    const avgMeta   = Math.round(totalMeta   / validCount);
    const avgMicro  = Math.round(totalMicro  / validCount);
    const avgScore  = Math.round(totalScore  / validCount);

    // Build a combined food object for the analysis panel
    const combinedFood = {
        name: namesList.join(' · '),
        emoji: '🍽️',
        kcal: totalKcal, prot: totalProt, carb: totalCarb, fat: totalFat,
        score: avgScore, cardio: avgCardio, meta: avgMeta, micro: avgMicro,
        qty: 1 // weight already factored in
    };

    // Populate currentAnalysis manually (totals already calculated)
    currentAnalysis = {
        ...combinedFood, mealType: currentMealType, rawName: combinedFood.name,
        kcalTotal: totalKcal, protTotal: +totalProt.toFixed(1),
        carbTotal: +totalCarb.toFixed(1), fatTotal: +totalFat.toFixed(1)
    };

    const r = document.getElementById('analysis-result');
    r.classList.remove('hidden');
    document.getElementById('analysis-food-name').textContent = '🍽️ ' + (namesList.length > 1 ? 'Análisis combinado del plato' : namesList[0]);
    const sb = document.getElementById('food-score-badge');
    sb.textContent = avgScore; sb.style.background = scoreGradient(avgScore);

    document.getElementById('analysis-macros').innerHTML =
        `<div class="a-macro"><span class="a-macro-val" style="color:var(--green)">${currentAnalysis.protTotal}g</span><span class="a-macro-lbl">Proteínas</span></div>
         <div class="a-macro"><span class="a-macro-val" style="color:var(--cyan)">${currentAnalysis.carbTotal}g</span><span class="a-macro-lbl">Carbohidratos</span></div>
         <div class="a-macro"><span class="a-macro-val" style="color:var(--purple)">${currentAnalysis.fatTotal}g</span><span class="a-macro-lbl">Grasas</span></div>
         <div class="a-macro"><span class="a-macro-val" style="color:var(--orange)">${totalKcal}</span><span class="a-macro-lbl">kcal totales</span></div>`;

    document.getElementById('analysis-micros').innerHTML = MICROS_MAP.slice(0, 4).map(m => {
        const v = Math.round(m.good * (0.1 + Math.random() * 0.7)), p = Math.round(v / m.good * 100), ok = p >= 30;
        return `<div class="micro-row"><span>${m.icon} ${m.name}</span><span class="micro-status ${ok ? 'micro-ok' : 'micro-low'}">${ok ? '✓ OK' : '↑ Bajo'}</span></div>`;
    }).join('');

    document.getElementById('analysis-impacts').innerHTML =
        `<div class="a-impact"><div class="a-impact-icon">❤️</div><span class="a-impact-val" style="color:var(--green)">${avgCardio}</span><span class="a-impact-lbl">Cardiovascular</span></div>
         <div class="a-impact"><div class="a-impact-icon">⚡</div><span class="a-impact-val" style="color:var(--cyan)">${avgMeta}</span><span class="a-impact-lbl">Metabólico</span></div>
         <div class="a-impact"><div class="a-impact-icon">🦠</div><span class="a-impact-val" style="color:var(--purple)">${avgMicro}</span><span class="a-impact-lbl">Microbiota</span></div>`;

    document.getElementById('analysis-tip').textContent =
        avgScore >= 80 ? `💡 Plato muy equilibrado (Score ${avgScore}/100). Excelente combinación de macronutrientes. ¡Seguí así!` :
        avgScore >= 60 ? `💡 Buen plato (Score ${avgScore}/100). Podés mejorarlo aumentando la porción de vegetales o eligiendo proteínas magras.` :
        `💡 Plato con alto aporte calórico y bajo perfil de micronutrientes (Score ${avgScore}/100). Considerá sustituir algún componente por opciones más nutritivas.`;

    r.scrollIntoView({ behavior: 'smooth' });
}
function generateFood(name) {
    const norm = String(name).toLowerCase().trim();
    const found = FOOD_DB.find(f => norm.includes(f.name.toLowerCase()) || f.name.toLowerCase().includes(norm));
    if (found) {
        return {
            name: found.name,
            emoji: found.emoji || '🍽️',
            kcal: found.kcal,
            prot: found.prot,
            carb: found.carb,
            fat: found.fat,
            score: found.score || 80,
            cardio: found.cardio || 80,
            meta: found.meta || 80,
            micro: found.micro || 75
        };
    }

    // Heurística basada en Tabla ANMAT / ArgenFoods
    let kcal = 85, prot = 3, carb = 12, fat = 2.5;
    if (norm.match(/\b(café|cafe|te|té|agua|infusion|infusión|mate|soda|hielo|stevia|edulcorante|sal)\b/)) {
        kcal = 0; prot = 0; carb = 0; fat = 0;
    } else if (norm.match(/\b(lechuga|tomate|ensalada|verdura|zucchini|zapallito|pepino|rabanito|espárrago|rucula|rúcula)\b/)) {
        kcal = 30; prot = 1.5; carb = 5; fat = 0.2;
    } else if (norm.match(/\b(fruta|frutilla|ciruela|kiwi|durazno|melon|melón|sandia|sandía|naranja|manzana)\b/)) {
        kcal = 50; prot = 0.8; carb = 12; fat = 0.2;
    } else if (norm.match(/\b(carne|bife|milanesa|pollo|pescado|cerdo|atún|atun|asado)\b/)) {
        kcal = 220; prot = 25; carb = 0; fat = 12;
    } else if (norm.match(/\b(pan|galletita|arroz|fideos|pasta|papa|batata|tostada)\b/)) {
        kcal = 160; prot = 4; carb = 32; fat = 2;
    }

    return {
        name,
        emoji: '🍽️',
        kcal, prot, carb, fat,
        score: 75, cardio: 75, meta: 75, micro: 70
    };
}
function showAnalysis(food, qty, raw) {
    const f = qty / 100;
    currentAnalysis = {
        ...food, qty, mealType: currentMealType, rawName: raw,
        kcalTotal: Math.round(food.kcal * f), protTotal: +(food.prot * f).toFixed(1),
        carbTotal: +(food.carb * f).toFixed(1), fatTotal: +(food.fat * f).toFixed(1)
    };
    const r = document.getElementById('analysis-result');
    r.classList.remove('hidden');
    document.getElementById('analysis-food-name').textContent = food.emoji + ' ' + (food.name || raw);
    const sb = document.getElementById('food-score-badge');
    sb.textContent = food.score; sb.style.background = scoreGradient(food.score);
    document.getElementById('analysis-macros').innerHTML =
        `<div class="a-macro"><span class="a-macro-val" style="color:var(--green)">${currentAnalysis.protTotal}g</span><span class="a-macro-lbl">Proteínas</span></div>
     <div class="a-macro"><span class="a-macro-val" style="color:var(--cyan)">${currentAnalysis.carbTotal}g</span><span class="a-macro-lbl">Carbohidratos</span></div>
     <div class="a-macro"><span class="a-macro-val" style="color:var(--purple)">${currentAnalysis.fatTotal}g</span><span class="a-macro-lbl">Grasas</span></div>`;
    document.getElementById('analysis-micros').innerHTML = MICROS_MAP.slice(0, 4).map(m => {
        const v = Math.round(m.good * (0.1 + Math.random() * 0.7)), p = Math.round(v / m.good * 100), ok = p >= 30;
        return `<div class="micro-row"><span>${m.icon} ${m.name}</span><span class="micro-status ${ok ? 'micro-ok' : 'micro-low'}">${ok ? '✓ OK' : '↑ Bajo'}</span></div>`;
    }).join('');
    document.getElementById('analysis-impacts').innerHTML =
        `<div class="a-impact"><div class="a-impact-icon">❤️</div><span class="a-impact-val" style="color:var(--green)">${food.cardio}</span><span class="a-impact-lbl">Cardiovascular</span></div>
     <div class="a-impact"><div class="a-impact-icon">⚡</div><span class="a-impact-val" style="color:var(--cyan)">${food.meta}</span><span class="a-impact-lbl">Metabólico</span></div>
     <div class="a-impact"><div class="a-impact-icon">🦠</div><span class="a-impact-val" style="color:var(--purple)">${food.micro}</span><span class="a-impact-lbl">Microbiota</span></div>`;
    document.getElementById('analysis-tip').textContent =
        food.score >= 80 ? '💡 Excelente elección nutricional. Aporta positivamente a tu puntaje del día y cubre tus objetivos de macros.' :
            food.score >= 60 ? '💡 Buena opción. Para mejorar el puntaje, combinalo con una fuente de proteínas o vegetales de hoja verde.' :
                '💡 Consumo ocasional recomendado. Alta densidad calórica y bajo aporte de micronutrientes relativos.';
    document.getElementById('food-suggestions').innerHTML = '';
}
// ===== PHOTO ANALYSIS ENGINE =====
let niaData = {}; // stores all photo analysis state

const PA_FOODS = [
  { name:'Pollo a la plancha', emoji:'🍗', weight:180, kcal:165, prot:31, carb:0, fat:3.6 },
  { name:'Arroz blanco cocido', emoji:'🍚', weight:150, kcal:130, prot:2.7, carb:28, fat:0.3 },
  { name:'Arroz integral cocido', emoji:'🍚', weight:150, kcal:112, prot:2.6, carb:23, fat:0.9 },
  { name:'Huevo frito', emoji:'🍳', weight:60, kcal:90, prot:6, carb:0.4, fat:7 },
  { name:'Salmón al horno', emoji:'🐟', weight:150, kcal:208, prot:28, carb:0, fat:10 },
  { name:'Brócoli al vapor', emoji:'🥦', weight:120, kcal:31, prot:2.5, carb:6, fat:0.4 },
  { name:'Ensalada mixta', emoji:'🥗', weight:100, kcal:25, prot:1.5, carb:4, fat:0.3 },
  { name:'Papa cocida', emoji:'🥔', weight:150, kcal:103, prot:2.3, carb:24, fat:0.1 },
  { name:'Carne vacuna magra', emoji:'🥩', weight:150, kcal:215, prot:26, carb:0, fat:12 },
  { name:'Pasta cocida', emoji:'🍝', weight:180, kcal:220, prot:7, carb:43, fat:1.3 },
  { name:'Lentejas cocidas', emoji:'🫘', weight:150, kcal:230, prot:18, carb:40, fat:0.8 },
  { name:'Batata asada', emoji:'🍠', weight:150, kcal:103, prot:2.3, carb:24, fat:0.1 },
  { name:'Palta', emoji:'🥑', weight:80, kcal:128, prot:1.6, carb:7, fat:12 },
  { name:'Tomate', emoji:'🍅', weight:100, kcal:18, prot:0.9, carb:3.9, fat:0.2 },
  { name:'Espinaca salteada', emoji:'🥬', weight:100, kcal:23, prot:2.9, carb:3.6, fat:0.4 },
  { name:'Milanesa de pollo', emoji:'🍗', weight:150, kcal:280, prot:22, carb:15, fat:14 },
  { name:'Milanesa de carne', emoji:'🥩', weight:150, kcal:310, prot:24, carb:16, fat:16 },
  { name:'Pan integral', emoji:'🍞', weight:60, kcal:140, prot:5, carb:26, fat:2 },
  { name:'Queso fresco', emoji:'🧀', weight:50, kcal:140, prot:10, carb:0.5, fat:11 },
  { name:'Yogur griego', emoji:'🫙', weight:150, kcal:89, prot:15, carb:5.4, fat:0.6 },
  { name:'Poroto negro', emoji:'🫘', weight:150, kcal:190, prot:12, carb:36, fat:1 },
  { name:'Zanahoria cocida', emoji:'🥕', weight:100, kcal:35, prot:0.8, carb:8, fat:0.2 },
  { name:'Pechuga de pavo', emoji:'🦃', weight:150, kcal:135, prot:28, carb:0, fat:3 },
];

const PA_CONDIMENTS = {
  'sal': {kcal:0,prot:0,carb:0,fat:0},
  'aceite de oliva': {kcal:88,prot:0,carb:0,fat:10},
  'manteca': {kcal:72,prot:0.1,carb:0,fat:8},
  'azúcar': {kcal:19,prot:0,carb:5,fat:0},
  'ketchup': {kcal:18,prot:0.4,carb:4,fat:0.1},
  'mayonesa': {kcal:100,prot:0.3,carb:0.3,fat:11},
  'limón': {kcal:3,prot:0.1,carb:0.9,fat:0},
  'vinagre': {kcal:1,prot:0,carb:0.1,fat:0},
};

const PA_DRINKS = {
  'ninguna':         {label:'Ninguna',               kcalPer100:0,   prot:0, carb:0,   fat:0, alcohol:false},
  'agua':            {label:'Agua',                  kcalPer100:0,   prot:0, carb:0,   fat:0, alcohol:false},
  'agua-saborizada-regular': {label:'Agua saborizada (Regular)', kcalPer100:20, prot:0, carb:5,   fat:0, alcohol:false},
  'agua-saborizada-light':   {label:'Agua saborizada (Light)',   kcalPer100:0,  prot:0, carb:0,   fat:0, alcohol:false},
  'gaseosa-regular': {label:'Gaseosa regular',       kcalPer100:42,  prot:0, carb:10.6,fat:0, alcohol:false},
  'gaseosa-light':   {label:'Gaseosa light/zero',    kcalPer100:1,   prot:0, carb:0,   fat:0, alcohol:false},
  'jugo-natural':    {label:'Jugo de fruta natural', kcalPer100:45,  prot:0.5,carb:10, fat:0.1,alcohol:false},
  'jugo-caja':       {label:'Jugo de caja/polvo',    kcalPer100:50,  prot:0, carb:12,  fat:0, alcohol:false},
  'te-cafe-sin-azucar': {label:'Café, Mate o Té (Sin azúcar)', kcalPer100:2,  prot:0, carb:0.3, fat:0, alcohol:false},
  'te-cafe-con-azucar': {label:'Café, Mate o Té (Con azúcar)', kcalPer100:25, prot:0, carb:6,   fat:0, alcohol:false},
  'bebida-vegetal':  {label:'Bebida vegetal',        kcalPer100:30,  prot:0.5,carb:3,  fat:1.2,alcohol:false},
  'leche-vaca':      {label:'Leche (Vaca)',          kcalPer100:61,  prot:3.2,carb:4.8,fat:3.3,alcohol:false},
  'leche-vegetal':   {label:'Leche vegetal (Almendra/Soja, etc.)', kcalPer100:35, prot:1.0,carb:3.5,fat:1.5,alcohol:false},
  'cerveza':         {label:'Cerveza',               kcalPer100:43,  prot:0.3,carb:3.6,fat:0, alcohol:true},
  'vino':            {label:'Vino',                  kcalPer100:85,  prot:0.1,carb:2.6,fat:0, alcohol:true},
  'fernet':          {label:'Fernet/Aperitivo',      kcalPer100:188, prot:0, carb:16,  fat:0, alcohol:true},
  'whisky':          {label:'Whisky/Vodka/Gin',      kcalPer100:250, prot:0, carb:0,   fat:0, alcohol:true},
  'champagne':       {label:'Champagne/Espumante',   kcalPer100:76,  prot:0.1,carb:1.4,fat:0, alcohol:true},
  'otra-alcoholica': {label:'Bebida alcohólica',     kcalPer100:150, prot:0, carb:5,   fat:0, alcohol:true},
  'otra':            {label:'Otra bebida',            kcalPer100:30,  prot:0, carb:7,   fat:0, alcohol:false},
};

// ===== GEMINI VISION API =====
const GEMINI_VISION_PROMPT = `Sos un nutricionista clínico experto analizando una fotografía de un plato de comida.
Analizá SOLO lo que ves claramente en la imagen. NO inventes alimentos que no estén visibles.
Respondé ÚNICAMENTE con un objeto JSON válido, sin markdown, sin texto adicional.

Si la foto es de mala calidad, está borrosa, o no podés identificar bien los alimentos:
{"quality":"low","ingredients":[]}

Si podés identificar los alimentos, respondé con este formato:
{
  "quality": "good",
  "ingredients": [
    {
      "name": "nombre exacto del alimento en español",
      "weight_g": 150,
      "kcal_per100g": 165,
      "prot_per100g": 31.0,
      "carb_per100g": 0.0,
      "fat_per100g": 3.6,
      "emoji": "🍗",
      "confidence": "high",
      "unclear_reason": ""
    }
  ]
}

Reglas IMPORTANTES:
- Solo incluí alimentos que ves con claridad
- Estimá el peso en gramos según proporciones estándar de un plato hogareño argentino típico
- Usá valores nutricionales por 100g de tablas estándar USDA/FAO
- Nombrá cada alimento por separado (no agrupes)
- Si ves una preparación, describí sus componentes visibles
- Usá emojis representativos del alimento
- Para el campo "confidence" usá:
  * "high" si estás muy seguro del alimento (ej: brócoli, pechuga de pollo clara)
  * "medium" si probablemente es ese alimento pero hay dudas (ej: salsa oscura, carne no definida)
  * "low" si no podés identificarlo con certeza (ej: algo cubierto, color/forma ambigua)
- Para "confidence" low o medium, completá "unclear_reason" con una pregunta breve al usuario (ej: "¿Es arroz blanco o coliflor?", "¿Qué tipo de carne es?")`;

function niaParseSafeJSON(jsonText) {
  if (!jsonText) return null;
  if (typeof jsonText === 'object') return jsonText;
  
  let text = String(jsonText).trim();
  
  // 1. Intentar parse directo
  try {
    return JSON.parse(text);
  } catch (e1) {}

  // 2. Remover bloques de código markdown ```json ... ```
  text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
  
  // Extraer contenido JSON principal entre primer { o [ y último } o ]
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    text = text.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(text);
  } catch (e2) {}

  // 3. Limpieza profunda de comentarios, comillas y comas sobrantes
  try {
    let cleaned = text
      .replace(/\/\/.*$/gm, '')              // Remover comentarios de línea //
      .replace(/\/\*[\s\S]*?\*\//g, '')      // Remover comentarios de bloque /* */
      .replace(/[\u201C\u201D]/g, '"')       // Normalizar comillas dobles inteligentes
      .replace(/[\u2018\u2019]/g, "'")       // Normalizar comillas simples inteligentes
      .replace(/,\s*([\}\]])/g, '$1');       // Remover comas colgantes antes de } o ]

    // Escapar saltos de línea y tabulaciones dentro de cadenas JSON
    cleaned = cleaned.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match) => {
      return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
    });

    return JSON.parse(cleaned);
  } catch (e3) {
    console.error('niaParseSafeJSON fallback:', e3, 'Input snippet:', text.substring(0, 200));
    // Estructura segura por defecto para evitar bloqueos
    return {
      mealType: 'almuerzo',
      detected: [],
      condiments: [],
      drink: []
    };
  }
}

function niaIsCustomGeminiKeyConfigured() {
  const key = localStorage.getItem('niaGeminiKey');
  return key && typeof key === 'string' && key.trim().startsWith('AIza');
}

const NIA_GEMINI_DEFAULT_KEY = 'AQ.Ab8RN6ItiqORVmWfguoQUvre7-9sEo7xTvB7pX1ubcpuPv0RQQ';

async function callGeminiVision(base64Data, mimeType) {
  const token = localStorage.getItem('niaSaasToken');
  const prompt = GEMINI_VISION_PROMPT;
  const dateStr = niaTargetMealDate ? niaTargetMealDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(getBackendApiUrl('/api/analyze-plate'), {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        base64Image: base64Data,
        mimeType: mimeType,
        prompt: prompt,
        date: dateStr
      })
    });

    if (response.ok) {
      if (typeof incrementDailyPhotosCount === 'function') {
        incrementDailyPhotosCount();
      }
      const data = await response.json();
      let analysisText = '';
      let parsedPayload = null;

      if (data.queued) {
        // BullMQ encolado: hacer polling de estado
        const jobId = data.jobId;
        let attempts = 0;
        const maxAttempts = 30; // 30 segundos máximo de espera
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
          
          const jobResponse = await fetch(getBackendApiUrl(`/api/jobs/${jobId}`), {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          
          if (jobResponse.ok) {
            const jobData = await jobResponse.json();
            if (jobData.state === 'completed') {
              const jobResult = jobData.result;
              if (jobResult) {
                if (jobResult.isMedicalDisclaimer) {
                  throw new Error(jobResult.analysisText); // Disclaimer médico detectado
                }
                analysisText = jobResult.analysisText;
                parsedPayload = jobResult.payload;
                break;
              }
            } else if (jobData.state === 'failed') {
              throw new Error('El análisis en segundo plano falló.');
            }
          }
        }
        
        if (!analysisText) {
          throw new Error('El análisis de plato tardó demasiado en responder.');
        }
      } else {
        // Fallback síncrono si Redis está caído
        if (data.result && data.result.isMedicalDisclaimer) {
          throw new Error(data.result.analysisText);
        }
        analysisText = data.result.analysisText;
        parsedPayload = data.result.payload;
      }

      return parsedPayload || {};
    } else {
      const errData = await response.json().catch(() => ({}));
      if (response.status === 429 || errData.limitExceeded) {
        throw new Error('No puedes acceder a más de 4 análisis de fotos por día. Podés ingresar tus comidas de hoy manualmente o por voz.');
      }
      throw new Error(errData.error || `SaaS error (${response.status})`);
    }
  } catch (err) {
    if (err.message.includes('límite') || err.message.includes('Plan') || err.message.includes('superado')) {
      throw err;
    }
    console.warn('Fallback a Gemini cliente ejecutándose directamente:', err.message);
  }

  // Fallback directo a Gemini 2.0 Flash en cliente
  const apiKey = localStorage.getItem('niaGeminiKey') || (window.DEFAULT_CLIENT_GEMINI_KEY || 'AQ.Ab8RN6ItiqORVmWfguoQUvre7-9sEo7xTvB7pX1ubcpuPv0RQQ');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const body = {
    contents: [{
      parts: [
        { text: GEMINI_VISION_PROMPT },
        { inline_data: { mime_type: mimeType, data: base64Data } }
      ]
    }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
  };

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (resp.ok) {
      const resJson = await resp.json();
      const text = resJson?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return niaParseSafeJSON(jsonMatch[0]);
      }
    }
  } catch (eFallback) {
    console.warn('Fallback Gemini cliente no disponible:', eFallback.message);
  }

  // Fallback heurístico local garantizado (a prueba de fallos)
  const textDesc = document.getElementById('food-text-description')?.value || '';
  return niaGenerateLocalHeuristicMealPayload(textDesc);
}

function niaGenerateLocalHeuristicMealPayload(textDesc = '') {
  const clean = String(textDesc || '').toLowerCase().trim();
  let detected = [];

  if (clean.includes('pollo')) {
    detected.push({ name: 'Pechuga de pollo a la plancha', weight_g: 200, kcal_per100g: 165, prot_per100g: 31, carb_per100g: 0, fat_per100g: 3.6, confidence: 'high', emoji: '🍗' });
  }
  if (clean.includes('arroz')) {
    detected.push({ name: 'Arroz cocido', weight_g: 150, kcal_per100g: 130, prot_per100g: 2.7, carb_per100g: 28, fat_per100g: 0.3, confidence: 'high', emoji: '🍚' });
  }
  if (clean.includes('carne') || clean.includes('bife') || clean.includes('asado')) {
    detected.push({ name: 'Bife de carne vacuna', weight_g: 200, kcal_per100g: 250, prot_per100g: 26, carb_per100g: 0, fat_per100g: 15, confidence: 'high', emoji: '🥩' });
  }
  if (clean.includes('ensalada') || clean.includes('lechuga') || clean.includes('tomate')) {
    detected.push({ name: 'Ensalada mixta (lechuga y tomate)', weight_g: 150, kcal_per100g: 20, prot_per100g: 1, carb_per100g: 3.5, fat_per100g: 0.2, confidence: 'high', emoji: '🥗' });
  }
  if (clean.includes('huevo')) {
    detected.push({ name: 'Huevo hervido/revuelto', weight_g: 100, kcal_per100g: 155, prot_per100g: 13, carb_per100g: 1.1, fat_per100g: 11, confidence: 'high', emoji: '🥚' });
  }
  if (clean.includes('fideos') || clean.includes('pasta')) {
    detected.push({ name: 'Pasta/Fideos cocidos', weight_g: 200, kcal_per100g: 131, prot_per100g: 5, carb_per100g: 25, fat_per100g: 1.1, confidence: 'high', emoji: '🍝' });
  }

  if (detected.length === 0) {
    detected.push({
      name: textDesc || 'Plato equilibrado de comida',
      weight_g: 350,
      kcal_per100g: 135,
      prot_per100g: 8.5,
      carb_per100g: 16,
      fat_per100g: 4.2,
      confidence: 'medium',
      emoji: '🍽️'
    });
  }

  return {
    mealType: (typeof niaSelectedMealType !== 'undefined' ? niaSelectedMealType : 'almuerzo'),
    detected: detected,
    condiments: [],
    drink: []
  };
}

// Global State for new Flow
let niaTargetMealDate = null;
let niaPhotoData = null;
let niaPhotoMime = null;

function niaSelectMealDay(dayType, dateString) {
  const choiceContainer = document.getElementById('nia-meals-choice-container');
  const flowContainer = document.getElementById('nia-meals-flow-container');
  const dateLabel = document.getElementById('nia-active-date-label');
  
  const cameraBtn = document.getElementById('nia-btn-camera');
  if (dayType === 'today') {
    niaTargetMealDate = null;
    if (dateLabel) dateLabel.textContent = '📅 Registrando para hoy';
    if (cameraBtn) cameraBtn.style.display = 'flex';
  } else {
    niaTargetMealDate = new Date(dateString);
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const formatted = niaTargetMealDate.toLocaleDateString('es-AR', options);
    if (dateLabel) dateLabel.textContent = `📅 Registrando para: ${formatted.charAt(0).toUpperCase() + formatted.slice(1)}`;
    if (cameraBtn) cameraBtn.style.display = 'none';
  }
  
  if (choiceContainer) choiceContainer.classList.add('hidden');
  if (flowContainer) flowContainer.classList.remove('hidden');
  
  // Clear any existing input states
  const contextEl = document.getElementById('photo-context');
  if (contextEl) contextEl.value = '';
  const textDesc = document.getElementById('food-text-description');
  if (textDesc) textDesc.value = '';
  niaRemovePhoto();
  
  const panel = document.getElementById('photo-analysis-panel');
  if (panel) panel.classList.add('hidden');
  const spinnerBlock = document.getElementById('nia-loading-spinner-block');
  if (spinnerBlock) spinnerBlock.classList.add('hidden');
  const reportBlock = document.getElementById('nia-final-report-block');
  if (reportBlock) reportBlock.classList.add('hidden');
  const editBlock = document.getElementById('nia-edit-ingredients-block');
  if (editBlock) editBlock.classList.add('hidden');
  const finalRep = document.getElementById('nia-final-report');
  if (finalRep) finalRep.innerHTML = '';

  renderMealsLog();
  updateNutricion();
}

function niaShowCalendarSelector() {
  const container = document.getElementById('nia-meals-calendar-buttons');
  const calContainer = document.getElementById('nia-meals-calendar-container');
  if (!container || !calContainer) return;
  
  container.innerHTML = '';
  
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  
  // Generate last 3 days
  for (let i = 1; i <= 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const formatted = d.toLocaleDateString('es-AR', options);
    const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-secondary btn-full';
    btn.style.cssText = 'padding: 12px; font-size: 0.85rem; font-weight: 600; border-radius: 12px; text-align: left; display: flex; align-items: center; justify-content: space-between; border: 1px solid rgba(255, 255, 255, 0.15); margin: 0;';
    btn.innerHTML = `<span>📅 ${capitalized}</span><span style="font-size:0.75rem; color:var(--text-muted)">Seleccionar</span>`;
    
    // Pass the exact date ISO string so we can parse it reliably
    btn.onclick = () => niaSelectMealDay('past', d.toISOString());
    container.appendChild(btn);
  }
  
  calContainer.classList.remove('hidden');
}

function niaHideCalendarSelector() {
  const calContainer = document.getElementById('nia-meals-calendar-container');
  if (calContainer) calContainer.classList.add('hidden');
}

function niaCancelMealsFlow() {
  niaTargetMealDate = null;
  const choiceContainer = document.getElementById('nia-meals-choice-container');
  const flowContainer = document.getElementById('nia-meals-flow-container');
  if (choiceContainer) choiceContainer.classList.remove('hidden');
  if (flowContainer) flowContainer.classList.add('hidden');
  niaHideCalendarSelector();
  niaReset();
  
  renderMealsLog();
  updateDashboard();
  updateNutricion();
}
let niaUploadedPhotos = [];
let niaSelectedMealType = 'almuerzo';
let niaSelectedInvisibleIngredients = [];
let niaCustomInvisibleIngredients = '';
let niaSelectedDrink = 'ninguna';
let niaDrinkMl = 250;
let niaCustomDrink = '';
let niaAlcoholPct = 0;

function niaDragOver(e) {
  e.preventDefault();
  const zone = document.getElementById('photo-upload');
  if (zone) zone.classList.add('dragover');
}

function niaLeave(e) {
  e.preventDefault();
  const zone = document.getElementById('photo-upload');
  if (zone) zone.classList.remove('dragover');
}

function niaDrop(e) {
  e.preventDefault();
  const zone = document.getElementById('photo-upload');
  if (zone) zone.classList.remove('dragover');
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
    niaProcessFile(e.dataTransfer.files[0]);
  }
}

function niaHandleFileSelect(input) {
  if (input && input.files && input.files[0]) {
    niaProcessFile(input.files[0]);
  }
}

function niaHandleTextDescriptionInput() {
  niaUpdateAnalyzeButtonState();
}

function niaUpdateAnalyzeButtonState() {
  const btn = document.getElementById('photo-analyze-btn');
  const textDesc = document.getElementById('food-text-description');
  const hasPhoto = !!niaPhotoData;
  const hasText = textDesc && textDesc.value.trim().length > 0;

  if (btn) {
    if (hasPhoto || hasText) {
      btn.removeAttribute('disabled');
    } else {
      btn.setAttribute('disabled', 'true');
    }
  }
}

function niaProcessFile(file) {
  // Límite de 4 análisis de fotos por día
  if (typeof getDailyPhotosCount === 'function' && getDailyPhotosCount() >= 4) {
    showMsg('No puedes acceder a más de 4 análisis de fotos por día. Podés ingresar tus comidas de hoy manualmente o por voz.');
    return;
  }

  if (!file.type.startsWith('image/')) {
    showMsg('Por favor, selecciona un archivo de imagen válido (JPG, PNG, WEBP).');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showMsg('El tamaño de la imagen supera el límite de 10MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    niaPhotoData = dataUrl.split(',')[1];
    niaPhotoMime = file.type || 'image/jpeg';
    
    niaUploadedPhotos = [{ dataUrl, mimeType: niaPhotoMime }];

    const previewContainer = document.getElementById('photo-preview-container');
    const inner = document.getElementById('photo-upload-inner');

    if (previewContainer) previewContainer.classList.remove('hidden');
    if (inner) inner.style.display = 'none';

    niaRenderPhotosPreview();
    niaUpdateAnalyzeButtonState();
  };
  reader.readAsDataURL(file);
}

function niaRemovePhoto(e) {
  if (e) e.stopPropagation();

  niaPhotoData = null;
  niaPhotoMime = null;
  niaUploadedPhotos = [];

  const inputCam = document.getElementById('photo-input-camera');
  if (inputCam) inputCam.value = '';
  const inputBrowse = document.getElementById('photo-input-browse');
  if (inputBrowse) inputBrowse.value = '';

  const previewContainer = document.getElementById('photo-preview-container');
  const inner = document.getElementById('photo-upload-inner');

  if (previewContainer) {
    previewContainer.classList.add('hidden');
    previewContainer.innerHTML = `
      <img id="photo-preview-img" src="" alt="Vista previa de comida" />
      <button type="button" id="remove-photo-btn" class="remove-photo-btn" onclick="niaRemovePhoto(event)">×</button>
    `;
  }
  if (inner) inner.style.display = 'flex';

  niaUpdateAnalyzeButtonState();
}

function niaStartFlow() {
  const textDesc = document.getElementById('food-text-description');
  const hasText = textDesc && textDesc.value.trim().length > 0;
  if (!niaPhotoData && !hasText) {
    showMsg('Por favor, carga una foto o descríbela en el cuadro de texto primero.');
    return;
  }
  niaSelectedMealType = 'almuerzo';
  niaSelectedInvisibleIngredients = [];
  niaCustomInvisibleIngredients = '';
  niaSelectedDrink = 'ninguna';
  niaDrinkMl = 250;
  niaCustomDrink = '';
  niaAlcoholPct = 0;

  niaOpenMealTypeModal();
}

function niaOpenMealTypeModal() {
  const overlay = document.getElementById('nia-unclear-overlay');
  if (!overlay) return;

  overlay.innerHTML = `
    <div class="nia-unclear-modal scrollable-modal">
      <div class="nia-unclear-modal-header">
        <h3>🍽️ Paso 1: Tipo de Comida</h3>
        <p class="nia-sub">Selecciona el momento del día para esta comida</p>
      </div>
      
      <div class="nia-modal-content">
        <div class="nia-modal-type-grid">
          <div class="nia-modal-type-card ${niaSelectedMealType === 'desayuno' ? 'selected' : ''}" data-type="desayuno" onclick="niaSelectMealTypeCard(this)">
            <span class="nia-modal-type-emoji">🌅</span>
            <span class="nia-modal-type-name">Desayuno</span>
          </div>
          <div class="nia-modal-type-card ${niaSelectedMealType === 'brunch' ? 'selected' : ''}" data-type="brunch" onclick="niaSelectMealTypeCard(this)">
            <span class="nia-modal-type-emoji">🥑</span>
            <span class="nia-modal-type-name">Brunch</span>
          </div>
          <div class="nia-modal-type-card ${niaSelectedMealType === 'almuerzo' ? 'selected' : ''}" data-type="almuerzo" onclick="niaSelectMealTypeCard(this)">
            <span class="nia-modal-type-emoji">☀️</span>
            <span class="nia-modal-type-name">Almuerzo</span>
          </div>
          <div class="nia-modal-type-card ${niaSelectedMealType === 'merienda' ? 'selected' : ''}" data-type="merienda" onclick="niaSelectMealTypeCard(this)">
            <span class="nia-modal-type-emoji">🍎</span>
            <span class="nia-modal-type-name">Merienda</span>
          </div>
          <div class="nia-modal-type-card ${niaSelectedMealType === 'cena' ? 'selected' : ''}" data-type="cena" onclick="niaSelectMealTypeCard(this)">
            <span class="nia-modal-type-emoji">🌙</span>
            <span class="nia-modal-type-name">Cena</span>
          </div>
          <div class="nia-modal-type-card ${niaSelectedMealType === 'snack' ? 'selected' : ''}" data-type="snack" onclick="niaSelectMealTypeCard(this)">
            <span class="nia-modal-type-emoji">🥜</span>
            <span class="nia-modal-type-name">Colación</span>
          </div>
        </div>
      </div>

      <div class="nia-unclear-actions">
        <button class="btn-secondary" onclick="niaCloseModalFlow()">Cancelar</button>
        <button class="btn-primary" onclick="niaSubmitMealType()">Continuar →</button>
      </div>
    </div>`;

  overlay.classList.remove('hidden');
  setTimeout(() => overlay.classList.add('nia-overlay-visible'), 10);
}

function niaSelectMealTypeCard(el) {
  document.querySelectorAll('.nia-modal-type-card').forEach(card => card.classList.remove('selected'));
  el.classList.add('selected');
  niaSelectedMealType = el.getAttribute('data-type');
}

function niaSubmitMealType() {
  niaOpenInvisibleIngredientsModal();
}

function niaOpenInvisibleIngredientsModal() {
  const overlay = document.getElementById('nia-unclear-overlay');
  if (!overlay) return;

  const condimentsList = [
    { name: 'Aceite de oliva', label: '🫒 Aceite de Oliva' },
    { name: 'Aceite de girasol', label: '🌻 Aceite Común' },
    { name: 'Manteca', label: '🧈 Manteca' },
    { name: 'Sal', label: '🧂 Sal' },
    { name: 'Azúcar', label: '🍬 Azúcar' },
    { name: 'Mayonesa', label: '🧴 Mayonesa' },
    { name: 'Mostaza', label: '🌭 Mostaza' },
    { name: 'Ketchup', label: '🍅 Ketchup' },
    { name: 'Crema de leche', label: '🥛 Crema de Leche' },
    { name: 'Vinagre', label: '🍾 Vinagre' },
    { name: 'Queso rallado', label: '🧀 Queso Rallado' },
    { name: 'Salsa de soja', label: '🍶 Salsa de Soja' }
  ];

  const gridHTML = condimentsList.map(cond => {
    const isChecked = niaSelectedInvisibleIngredients.includes(cond.name);
    return `
      <label class="nia-condiment-checkbox-card ${isChecked ? 'selected' : ''}">
        <input type="checkbox" value="${cond.name}" ${isChecked ? 'checked' : ''} onclick="niaToggleCondimentCard(this)">
        <span class="condiment-name">${cond.label}</span>
      </label>`;
  }).join('');

  overlay.innerHTML = `
    <div class="nia-unclear-modal scrollable-modal">
      <div class="nia-unclear-modal-header">
        <h3>🧂 Paso 2: Ingredientes Invisibles</h3>
        <p class="nia-sub">Añade aceites, condimentos o agregados ocultos</p>
      </div>
      
      <div class="nia-modal-content">
        <p class="nia-modal-lbl">Selecciona los que usaste en la preparación:</p>
        <div class="nia-modal-condiments-grid">
          ${gridHTML}
        </div>
        
        <div class="form-group" style="margin-top:1.25rem">
          <label for="nia-custom-condiments" style="font-weight:700;font-size:0.85rem;margin-bottom:0.4rem;display:block">Otros condimentos o agregados (separados por comas):</label>
          <input type="text" id="nia-custom-condiments" class="input-field" value="${niaCustomInvisibleIngredients}" placeholder="Ej: limón, chimichurri, miel..." />
        </div>
      </div>

      <div class="nia-unclear-actions">
        <button class="btn-secondary" onclick="niaOpenMealTypeModal()">← Atrás</button>
        <button class="btn-primary" onclick="niaSubmitInvisibleIngredients()">Continuar →</button>
      </div>
    </div>`;
}

function niaToggleCondimentCard(checkbox) {
  const card = checkbox.closest('.nia-condiment-checkbox-card');
  if (card) {
    if (checkbox.checked) card.classList.add('selected');
    else card.classList.remove('selected');
  }
}

function niaSubmitInvisibleIngredients() {
  const checkboxes = document.querySelectorAll('.nia-modal-condiments-grid input[type="checkbox"]');
  niaSelectedInvisibleIngredients = [];
  checkboxes.forEach(cb => {
    if (cb.checked) niaSelectedInvisibleIngredients.push(cb.value);
  });

  const customInput = document.getElementById('nia-custom-condiments');
  niaCustomInvisibleIngredients = customInput ? customInput.value.trim() : '';

  niaOpenDrinkModal();
}

function niaOpenDrinkModal() {
  const overlay = document.getElementById('nia-unclear-overlay');
  if (!overlay) return;

  // Interactive tour step 2 trigger
  if (window.currentTourStep === 2) {
    const tourOverlay = document.getElementById('onb-tour-overlay');
    if (tourOverlay) tourOverlay.classList.remove('hidden');
    setTimeout(() => {
      if (typeof positionTooltip === 'function') {
        positionTooltip('onb-tooltip-2', '#nia-drink-select', 'bottom');
      }
    }, 150);
  }

  // Interactive tour step 2 trigger
  if (window.currentTourStep === 2) {
    const tourOverlay = document.getElementById('onb-tour-overlay');
    if (tourOverlay) tourOverlay.classList.remove('hidden');
    setTimeout(() => {
      if (typeof positionTooltip === 'function') {
        positionTooltip('onb-tooltip-2', '#nia-drink-select', 'bottom');
      }
    }, 150);
  }

  // Interactive tour step 2 trigger
  if (window.currentTourStep === 2) {
    const tourOverlay = document.getElementById('onb-tour-overlay');
    if (tourOverlay) tourOverlay.classList.remove('hidden');
    setTimeout(() => {
      if (typeof positionTooltip === 'function') {
        positionTooltip('onb-tooltip-2', '#nia-drink-select', 'bottom');
      }
    }, 150);
  }

  overlay.innerHTML = `
    <div class="nia-unclear-modal scrollable-modal">
      <div class="nia-unclear-modal-header">
        <h3>🥤 Paso 3: Bebida</h3>
        <p class="nia-sub">Añade la bebida consumida en esta comida</p>
      </div>
      
      <div class="nia-modal-content">
        <div class="nia-modal-drink-group">
          <div class="form-group">
            <label for="nia-drink-select" style="font-weight:700;font-size:0.85rem;margin-bottom:0.4rem;display:block">Selecciona el tipo de bebida:</label>
            <select id="nia-drink-select" class="input-field" onchange="niaUpdateDrinkModalDetails()">
              <option value="ninguna" ${niaSelectedDrink === 'ninguna' ? 'selected' : ''}>❌ Ninguna</option>
              <option value="agua" ${niaSelectedDrink === 'agua' ? 'selected' : ''}>💧 Agua</option>
              <option value="agua-saborizada-regular" ${niaSelectedDrink === 'agua-saborizada-regular' ? 'selected' : ''}>🫧 Agua saborizada (Regular)</option>
              <option value="agua-saborizada-light" ${niaSelectedDrink === 'agua-saborizada-light' ? 'selected' : ''}>🫧 Agua saborizada (Light)</option>
              <option value="gaseosa-regular" ${niaSelectedDrink === 'gaseosa-regular' ? 'selected' : ''}>🥤 Gaseosa regular (con azúcar)</option>
              <option value="gaseosa-light" ${niaSelectedDrink === 'gaseosa-light' ? 'selected' : ''}>🥤 Gaseosa light / zero</option>
              <option value="jugo-natural" ${niaSelectedDrink === 'jugo-natural' ? 'selected' : ''}>🍊 Jugo de fruta natural</option>
              <option value="jugo-caja" ${niaSelectedDrink === 'jugo-caja' ? 'selected' : ''}>🧪 Jugo de caja o polvo</option>
              <option value="te-cafe-sin-azucar" ${niaSelectedDrink === 'te-cafe-sin-azucar' ? 'selected' : ''}>☕ Café, Mate o Té (Sin azúcar)</option>
              <option value="te-cafe-con-azucar" ${niaSelectedDrink === 'te-cafe-con-azucar' ? 'selected' : ''}>☕ Café, Mate o Té (Con azúcar)</option>
              <option value="bebida-vegetal" ${niaSelectedDrink === 'bebida-vegetal' ? 'selected' : ''}>🌱 Bebida vegetal</option>
              <option value="leche-vaca" ${niaSelectedDrink === 'leche-vaca' ? 'selected' : ''}>🥛 Leche (Vaca)</option>
              <option value="leche-vegetal" ${niaSelectedDrink === 'leche-vegetal' ? 'selected' : ''}>🥛 Leche vegetal (Almendra/Soja, etc.)</option>
              <option value="cerveza" ${niaSelectedDrink === 'cerveza' ? 'selected' : ''}>🍺 Cerveza</option>
              <option value="vino" ${niaSelectedDrink === 'vino' ? 'selected' : ''}>🍷 Vino</option>
              <option value="fernet" ${niaSelectedDrink === 'fernet' ? 'selected' : ''}>🥃 Fernet</option>
              <option value="bebida-blanca" ${niaSelectedDrink === 'bebida-blanca' ? 'selected' : ''}>🍸 Whisky / Vodka / Gin</option>
              <option value="otro" ${niaSelectedDrink === 'otro' ? 'selected' : ''}>✏️ Otra bebida (describir abajo)</option>
            </select>
          </div>

          <div class="form-group ${niaSelectedDrink === 'otro' ? '' : 'hidden'}" id="nia-custom-drink-wrapper">
            <label for="nia-custom-drink-input" style="font-weight:700;font-size:0.85rem;margin-bottom:0.4rem;display:block">Nombre de la bebida:</label>
            <input type="text" id="nia-custom-drink-input" class="input-field" value="${niaCustomDrink}" placeholder="Ej: Licuado de frutilla, Fernet Cola..." />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="nia-drink-ml-input" style="font-weight:700;font-size:0.85rem;margin-bottom:0.4rem;display:block">Cantidad (cm³ / ml):</label>
              <input type="number" id="nia-drink-ml-input" class="input-field" value="${niaDrinkMl}" placeholder="250" min="0" max="3000" />
            </div>
            
            <div class="form-group ${['cerveza','vino','fernet','bebida-blanca','otro'].includes(niaSelectedDrink) ? '' : 'hidden'}" id="nia-drink-alcohol-wrapper">
              <label for="nia-drink-alcohol-input" style="font-weight:700;font-size:0.85rem;margin-bottom:0.4rem;display:block">Graduación (% vol):</label>
              <input type="number" id="nia-drink-alcohol-input" class="input-field" value="${niaAlcoholPct}" placeholder="5" min="0" max="100" step="0.1" />
            </div>
          </div>
        </div>
      </div>

      <div class="nia-unclear-actions">
        <button class="btn-secondary" onclick="niaOpenInvisibleIngredientsModal()">← Atrás</button>
        <button class="btn-primary" onclick="niaSubmitDrinkAndRun()">Analizar plato con IA →</button>
      </div>
    </div>`;
}

function niaUpdateDrinkModalDetails() {
  const select = document.getElementById('nia-drink-select');
  if (!select) return;
  const val = select.value;
  niaSelectedDrink = val;

  const customWrapper = document.getElementById('nia-custom-drink-wrapper');
  const alcoholWrapper = document.getElementById('nia-drink-alcohol-wrapper');
  const alcoholInput = document.getElementById('nia-drink-alcohol-input');

  if (customWrapper) {
    if (val === 'otro') customWrapper.classList.remove('hidden');
    else customWrapper.classList.add('hidden');
  }

  if (alcoholWrapper) {
    if (['cerveza', 'vino', 'fernet', 'bebida-blanca', 'otro'].includes(val)) {
      alcoholWrapper.classList.remove('hidden');
      if (alcoholInput) {
        if (val === 'cerveza') alcoholInput.value = 5;
        else if (val === 'vino') alcoholInput.value = 13;
        else if (val === 'fernet') alcoholInput.value = 39;
        else if (val === 'bebida-blanca') alcoholInput.value = 40;
        else if (val === 'otro') alcoholInput.value = 0;
      }
    } else {
      alcoholWrapper.classList.add('hidden');
    }
  }
}

function niaSubmitDrinkAndRun() {
  const select = document.getElementById('nia-drink-select');
  niaSelectedDrink = select ? select.value : 'ninguna';

  const customInput = document.getElementById('nia-custom-drink-input');
  niaCustomDrink = customInput ? customInput.value.trim() : '';

  const mlInput = document.getElementById('nia-drink-ml-input');
  niaDrinkMl = mlInput ? (+mlInput.value || 0) : 0;

  const alcoholInput = document.getElementById('nia-drink-alcohol-input');
  niaAlcoholPct = alcoholInput ? (+alcoholInput.value || 0) : 0;

  niaCloseModalFlow();
  niaRunVisionDetection();
}

function niaCloseModalFlow() {
  const overlay = document.getElementById('nia-unclear-overlay');
  if (overlay) {
    overlay.classList.remove('nia-overlay-visible');
    setTimeout(() => overlay.classList.add('hidden'), 300);
  }
}

async function niaRunVisionDetection() {
  const panel = document.getElementById('photo-analysis-panel');
  const spinnerBlock = document.getElementById('nia-loading-spinner-block');
  const loadingText = document.getElementById('nia-loading-text');
  const editBlock = document.getElementById('nia-edit-ingredients-block');
  const reportBlock = document.getElementById('nia-final-report-block');
  const mainBtn = document.getElementById('photo-analyze-btn');

  if (panel) panel.classList.remove('hidden');
  if (spinnerBlock) spinnerBlock.classList.remove('hidden');

  const hasPhoto = !!niaPhotoData;
  const textDescValue = document.getElementById('food-text-description')?.value.trim() || '';

  if (loadingText) {
    loadingText.textContent = hasPhoto 
      ? 'La IA está detectando los ingredientes de tu foto...' 
      : 'La IA está analizando la descripción de tu plato...';
  }

  if (editBlock) editBlock.classList.add('hidden');
  if (reportBlock) reportBlock.classList.add('hidden');
  if (mainBtn) mainBtn.setAttribute('disabled', 'true');

  setTimeout(() => panel.scrollIntoView({ behavior: 'smooth' }), 200);

  let prompt = '';
  let parts = [];

  if (hasPhoto) {
    prompt = `Sos un nutricionista clínico experto analizando una fotografía de un plato de comida.
Identificá los alimentos y componentes visibles en la imagen.
Estimá el peso en gramos (weight_g) de cada ingrediente del plato principal según proporciones de un plato argentino hogareño típico.

Respondé ÚNICAMENTE con un objeto JSON válido con el siguiente formato, sin bloques de código markdown, sin texto adicional:
{
  "quality": "good", // o "low" si la imagen no tiene relación con comida o está muy borrosa
  "ingredients": [
    {
      "name": "nombre del ingrediente en español",
      "weight_g": 150,
      "emoji": "🥩"
    }
  ]
}`;
    parts.push({ text: prompt });
    parts.push({ inline_data: { mime_type: niaPhotoMime, data: niaPhotoData } });
  } else {
    prompt = `Sos un nutricionista clínico experto. El usuario no ha subido una fotografía de su comida, sino que ha proporcionado la siguiente descripción de su plato:
"${textDescValue}"

Identificá los alimentos y componentes descritos en el texto anterior.
Estimá el peso en gramos (weight_g) de cada ingrediente del plato principal basándote en la descripción y en las proporciones de un plato argentino hogareño típico. Si el usuario especificó una cantidad en gramos para el plato o ingredientes, usala como base.

Respondé ÚNICAMENTE con un objeto JSON válido con el siguiente formato, sin bloques de código markdown, sin texto adicional:
{
  "quality": "good", // o "low" si la descripción no tiene sentido o no describe comida
  "ingredients": [
    {
      "name": "nombre del ingrediente en español",
      "weight_g": 150,
      "emoji": "🍽️" // usa un emoji representativo del alimento
    }
  ]
}`;
    parts.push({ text: prompt });
  }

  try {
    let text = '';
    let apiData = null;
    try {
      // 1. Intentar llamar al backend local con el fallback a OpenAI activo
      const resp = await fetch(getBackendApiUrl('/api/ai-completion'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          base64Image: hasPhoto ? niaPhotoData : null,
          mimeType: hasPhoto ? niaPhotoMime : null
        })
      });

      if (resp.ok) {
        apiData = await resp.json();
        text = apiData.text || '';
      } else {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || `Backend status: ${resp.status}`);
      }
    } catch (backendErr) {
      console.warn('Backend no disponible, ejecutando fallback directo con Gemini 2.0 Flash...', backendErr.message);
      
      const apiKey = localStorage.getItem('niaGeminiKey') || (window.DEFAULT_CLIENT_GEMINI_KEY || 'AQ.Ab8RN6ItiqORVmWfguoQUvre7-9sEo7xTvB7pX1ubcpuPv0RQQ');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      const body = {
        contents: [{ parts: parts }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
      };

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!resp.ok) {
        if (resp.status === 400 || resp.status === 401 || resp.status === 403) {
          localStorage.removeItem('niaGeminiKey');
        }
        throw new Error(`API error ${resp.status}`);
      }

      apiData = await resp.json();
      text = apiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      const finishReason = apiData?.candidates?.[0]?.finishReason;
      if (finishReason === 'SAFETY') {
        throw new Error('El análisis de la comida fue bloqueado por los filtros de seguridad de la IA.');
      } else if (finishReason === 'MAX_TOKENS') {
        throw new Error('La respuesta de la IA fue truncada (límite de tokens alcanzado).');
      } else if (apiData?.error) {
        throw new Error(`Error de la API: ${apiData.error.message || JSON.stringify(apiData.error)}`);
      } else {
        throw new Error(`Respuesta de la IA no contiene JSON. Texto recibido: ${text.substring(0, 150)}...`);
      }
    }
    const result = niaParseSafeJSON(jsonMatch[0]);

    if (result.quality === 'low' || !result.ingredients || result.ingredients.length === 0) {
      showMsg('⚠️ La IA no pudo identificar alimentos. Mostrando entrada manual.');
      renderPaManualEntry(true);
      if (spinnerBlock) spinnerBlock.classList.add('hidden');
      return;
    }

    if (hasPhoto && typeof incrementDailyPhotosCount === 'function') {
      incrementDailyPhotosCount();
    }

    renderPaIngredientsEditor(result.ingredients);

  } catch (err) {
    console.error('Vision detection error:', err);
    showMsg('Error en la detección: ' + err.message);
    renderPaManualEntry(false, err.message || err);
    if (spinnerBlock) spinnerBlock.classList.add('hidden');
  } finally {
    if (mainBtn) niaUpdateAnalyzeButtonState();
  }
}

function renderPaIngredientsEditor(ingredients) {
  const spinnerBlock = document.getElementById('nia-loading-spinner-block');
  const editBlock = document.getElementById('nia-edit-ingredients-block');
  const container = document.getElementById('nia-edit-list-container');
  
  if (spinnerBlock) spinnerBlock.classList.add('hidden');
  if (editBlock) editBlock.classList.remove('hidden');
  if (!container) return;

  // Check diet compatibility
  const userDiet = profile.diet || 'omnivoro';
  const nonCompliant = ingredients.filter(item => !isFoodCompliantWithDiet(item.name, userDiet));
  
  // Remove existing warning if any
  const existingWarning = document.getElementById('nia-diet-warning-editor');
  if (existingWarning) existingWarning.remove();

  if (nonCompliant.length > 0) {
    const warningDiv = document.createElement('div');
    warningDiv.id = 'nia-diet-warning-editor';
    warningDiv.style.cssText = 'padding: 12px; border-radius: 10px; background: rgba(239, 83, 80, 0.12); border: 1px solid rgba(239, 83, 80, 0.25); color: #ef5350; font-size: 0.8rem; font-weight: 600; margin-bottom: 1rem; line-height: 1.45;';
    const names = nonCompliant.map(item => `"${item.name}"`).join(', ');
    warningDiv.innerHTML = `⚠️ **Alerta de Dieta (${userDiet.charAt(0).toUpperCase() + userDiet.slice(1)}):** Detectamos alimentos no recomendados para tu perfil: ${names}. Podés editarlos o eliminarlos antes de continuar.`;
    container.parentNode.insertBefore(warningDiv, container);
  }

  container.innerHTML = '';
  ingredients.forEach(item => {
    container.appendChild(niaCreateEditIngredientRowHTML(item.name, item.weight_g, item.emoji));
  });

  // Scroll smoothly to immediately below the photo upload card (top of edit block)
  setTimeout(() => {
    if (editBlock) {
      editBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 150);
}

function niaCreateEditIngredientRowHTML(name, weight, emoji) {
  const row = document.createElement('div');
  row.className = 'nia-edit-row';
  row.style.cssText = 'display:flex; align-items:center; gap:8px';
  row.innerHTML = `
    <span class="nia-edit-emoji" style="font-size:1.1rem; flex-shrink:0">${emoji || '🍽️'}</span>
    <input type="text" class="input-field nia-edit-name" value="${name}" placeholder="Nombre del ingrediente" style="flex-grow:2; font-size:0.85rem; padding:8px 10px; margin:0" />
    <input type="number" class="input-field nia-edit-weight" value="${weight}" placeholder="Gramos" style="width:75px; font-size:0.85rem; padding:8px 10px; margin:0" />
    <span style="font-size:0.8rem; color:var(--text-dim)">g</span>
    <button type="button" class="btn-icon" onclick="this.closest('.nia-edit-row').remove()" style="color:#ef5350; font-size:1.1rem; padding:4px 8px; border:none; background:none; cursor:pointer">🗑</button>
  `;
  return row;
}

function niaAddEditIngredientRow() {
  const container = document.getElementById('nia-edit-list-container');
  if (container) {
    container.appendChild(niaCreateEditIngredientRowHTML('', 150, '🍽️'));
  }
}

async function niaSubmitConfirmedIngredients() {
  const rows = document.querySelectorAll('.nia-edit-row');
  const confirmedIngredients = [];

  rows.forEach(row => {
    const name = row.querySelector('.nia-edit-name')?.value.trim();
    const weight = +row.querySelector('.nia-edit-weight')?.value || 0;
    const emoji = row.querySelector('.nia-edit-emoji')?.textContent || '🍽️';
    if (name && weight > 0) {
      confirmedIngredients.push({ name, weight_g: weight, emoji });
    }
  });

  if (confirmedIngredients.length === 0) {
    showMsg('Por favor, ingresa al menos un ingrediente válido con sus gramos.');
    return;
  }

  const editBlock = document.getElementById('nia-edit-ingredients-block');
  const spinnerBlock = document.getElementById('nia-loading-spinner-block');
  const loadingText = document.getElementById('nia-loading-text');

  if (editBlock) editBlock.classList.add('hidden');
  if (spinnerBlock) spinnerBlock.classList.remove('hidden');
  if (loadingText) loadingText.textContent = 'La IA está calculando la composición nutricional completa y valoración...';

  await niaRunFinalNutritionAnalysis(confirmedIngredients);
}
async function niaRunFinalNutritionAnalysis(confirmedIngredients) {
  const spinnerBlock = document.getElementById('nia-loading-spinner-block');
  const reportBlock = document.getElementById('nia-final-report-block');
  const mainBtn = document.getElementById('photo-analyze-btn');

  let drinkInfoStr = 'Ninguna';
  const invisibleIngredientsStr = niaSelectedInvisibleIngredients.join(', ') + 
    (niaCustomInvisibleIngredients ? `, ${niaCustomInvisibleIngredients}` : '');
  
  if (niaSelectedDrink !== 'ninguna') {
    const drinkLabel = niaSelectedDrink === 'otro' ? niaCustomDrink : (PA_DRINKS[niaSelectedDrink]?.label || niaSelectedDrink);
    drinkInfoStr = `${drinkLabel} (${niaDrinkMl} ml${niaAlcoholPct > 0 ? `, alcohol ${niaAlcoholPct}% vol` : ''})`;
  }

  const userGoal = profile.goal || 'saludGeneral';
  const userDiet = profile.diet || 'omnivoro';
  
  // Format clinical profile variables for injection in system instructions
  const userAllergies = Array.isArray(profile.allergies) && profile.allergies.length > 0
    ? profile.allergies.map(a => {
        const labels = { gluten: 'Gluten / Celíaquía', lactosa: 'Lactosa / Lácteos', frutosSecos: 'Frutos secos / Maní', huevo: 'Huevo', pescadoMarisco: 'Pescado / Mariscos', soja: 'Soja' };
        return labels[a] || a;
      }).join(', ')
    : 'Ninguna';

  const userConditions = Array.isArray(profile.conditions) && profile.conditions.length > 0
    ? profile.conditions.map(c => {
        const labels = { diabetes: 'Diabetes', hipertension: 'Hipertensión', colesterol: 'Colesterol alto', hipotiroidismo: 'Hipotiroidismo', colonIrritable: 'SIBO', gastritis: 'Gastritis / Reflujo' };
        return labels[c] || c;
      }).join(', ')
    : 'Ninguna';

  const userDislikes = profile.dislikes || 'Ninguno';
  const hasPhoto = !!niaPhotoData;
  const textDescValue = document.getElementById('food-text-description')?.value.trim() || '';

  const prompt = `Sos un nutricionista clínico argentino experto.
Debés realizar una valoración clínica y desglose nutricional completo de una comida.
${hasPhoto 
  ? 'Recibís una fotografía del plato para contexto visual del método de preparación, junto con la lista final confirmada de componentes de la comida.' 
  : `El usuario no ha subido una fotografía, sino que describió su comida de la siguiente manera:
"${textDescValue}"
Debes usar esa descripción y la lista final confirmada de componentes de la comida para el análisis.`
}

PERFIL CLÍNICO DEL USUARIO A QUIEN VA DIRIGIDO EL PLAN:
- Tipo de alimentación: ${userDiet}
- Objetivos: ${userGoal}
- Alergias o Intolerancias alimentarias: ${userAllergies}
- Condiciones médicas / Patologías: ${userConditions}
- Alimentos excluidos por el usuario: ${userDislikes}

COMPONENTES CONFIRMADOS POR EL USUARIO:
- Plato principal (ingredientes y gramos):
${confirmedIngredients.map(i => `  * ${i.name}: ${i.weight_g}g`).join('\n')}
- Condimentos/ingredientes invisibles: "${invisibleIngredientsStr || 'Ninguno'}"
- Bebida y cantidad: "${drinkInfoStr}"
- Tipo de comida: "${niaSelectedMealType}"

INSTRUCCIONES DE ANÁLISIS:
1. Incorporá cada uno de los ingredientes del plato principal con sus gramos exactos confirmados por el usuario.
2. Incorporá los condimentos e ingredientes invisibles reportados. Estimá cantidades razonables para ellos si no se especifican (ej: 10g para aceite, 2g para sal, etc.).
3. Incorporá la bebida reportada por el usuario con su cantidad exacta.
4. Calculá las calorías (kcal_per100g) y macronutrientes (prot_per100g, carb_per100g, fat_per100g) por cada 100g de cada elemento basándote en bases de datos científicas de nutrición (USDA, FAO). Para bebidas alcohólicas, sumá el aporte de alcohol (~7 kcal por gramo puro).
5. Escribí una valoración clínica personalizada en español (clinical_assessment) enfocada en el tipo de alimentación, las condiciones de salud y los objetivos del usuario. REGLAS DE VALORACIÓN CRÍTICAS:
   - NO menciones uno por uno los objetivos específicos del perfil del usuario (tales como ganar músculo, etc.) ni nombres explícitamente sus enfermedades a menos que sea para una advertencia de riesgo. En general, debés referirte a los objetivos de forma general como "según tus objetivos".
   - La valoración clínica debe estar muy resumida, directa al grano y no debe superar las 100 palabras de longitud en total.
   - Comentá la calidad del plato completo, el impacto de los condimentos y la bebida de forma constructiva.
6. REGLA ESTRICTA DE SEGURIDAD CLÍNICA (ALERGIAS, CONDICIONES Y EXCLUSIONES):
   - Si detectás algún ingrediente que no sea apto para la dieta "${userDiet}", o que contenga alérgenos declarados por el usuario (${userAllergies}), o que represente un riesgo clínico directo para sus patologías (${userConditions}, por ejemplo sodio elevado en hipertensión, azúcares rápidos altos en diabetes, grasas saturadas excesivas en colesterol alto, irritantes en colon irritable o gastritis), o si contiene algún ingrediente de la lista de exclusiones (${userDislikes}):
     Debés incluir una advertencia médica muy visible y corta al principio de la valoración clínica (ej: "⚠️ ADVERTENCIA: [Riesgo detectado y recomendación]"), explicando de forma precisa y firme por qué infringe su salud y sugiriendo un reemplazo seguro. Esta advertencia cuenta para el límite de las 100 palabras.
   - Si no detectás ninguna contraindicación, realiza la valoración habitual alineada a su perfil.

REGLA DE REDACCIÓN CRÍTICA:
NO te presentes (no digas "¡Hola! Como nutricionista...", ni saludos similares). Comenzá directamente con el análisis y valoración clínica del plato en su conjunto de forma objetiva y constructiva.

Respondé ÚNICAMENTE con un objeto JSON válido, sin bloques de código markdown, sin texto adicional:
{
  "quality": "good",
  "clinical_assessment": "...",
  "ingredients": [
    {
      "name": "nombre del alimento o ingrediente en español",
      "weight_g": 150,
      "kcal_per100g": 165,
      "prot_per100g": 31.0,
      "carb_per100g": 0.0,
      "fat_per100g": 3.6,
      "emoji": "🍗",
      "category": "plate" // "plate", "condiment", o "drink"
    }
  ]
}`;

  try {
    let text = '';
    let apiData = null;
    try {
      // 1. Intentar llamar al backend local con el fallback a OpenAI activo
      const resp = await fetch('/api/ai-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          base64Image: hasPhoto ? niaPhotoData : null,
          mimeType: hasPhoto ? niaPhotoMime : null
        })
      });

      if (resp.ok) {
        apiData = await resp.json();
        text = apiData.text || '';
      } else {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || `Backend status: ${resp.status}`);
      }
    } catch (backendErr) {
      if (!niaIsCustomGeminiKeyConfigured()) {
        throw backendErr;
      }
      console.warn('Usando API key de cliente Gemini configurada por el usuario...', backendErr.message);

      const apiKey = localStorage.getItem('niaGeminiKey');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      
      const body = {
        contents: [{
          parts: hasPhoto 
            ? [
                { text: prompt },
                { inline_data: { mime_type: niaPhotoMime, data: niaPhotoData } }
              ]
            : [
                { text: prompt }
              ]
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
      };

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!resp.ok) {
        if (resp.status === 400 || resp.status === 401 || resp.status === 403) {
          localStorage.removeItem('niaGeminiKey');
        }
        throw new Error(`API error ${resp.status}`);
      }

      apiData = await resp.json();
      text = apiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      const finishReason = apiData?.candidates?.[0]?.finishReason;
      if (finishReason === 'SAFETY') {
        throw new Error('El análisis de la comida fue bloqueado por los filtros de seguridad de la IA.');
      } else if (finishReason === 'MAX_TOKENS') {
        throw new Error('La respuesta de la IA fue truncada (límite de tokens alcanzado).');
      } else if (apiData?.error) {
        throw new Error(`Error de la API: ${apiData.error.message || JSON.stringify(apiData.error)}`);
      } else {
        throw new Error(`Respuesta de la IA no contiene JSON. Texto recibido: ${text.substring(0, 150)}...`);
      }
    }
    const result = niaParseSafeJSON(jsonMatch[0]);

    if (result.quality === 'low' || !result.ingredients || result.ingredients.length === 0) {
      showMsg('⚠️ La IA no pudo identificar alimentos en esta foto. Mostrando entrada manual.');
      renderPaManualEntry(true);
      if (spinnerBlock) spinnerBlock.classList.add('hidden');
      return;
    }

    niaData = {
      detected: result.ingredients.filter(i => i.category === 'plate' || !i.category),
      condiments: result.ingredients.filter(i => i.category === 'condiment'),
      drink: result.ingredients.filter(i => i.category === 'drink'),
      clinicalAssessment: result.clinical_assessment || '',
      mealType: niaSelectedMealType
    };

    let plateKcal = 0, plateProt = 0, plateCarb = 0, plateFat = 0;
    let condKcal = 0, condProt = 0, condCarb = 0, condFat = 0;
    let drinkKcal = 0, drinkProt = 0, drinkCarb = 0, drinkFat = 0;

    niaData.detected.forEach(item => {
      const fac = item.weight_g / 100;
      plateKcal += Math.round((item.kcal_per100g || 0) * fac);
      plateProt += (item.prot_per100g || 0) * fac;
      plateCarb += (item.carb_per100g || 0) * fac;
      plateFat  += (item.fat_per100g || 0) * fac;
    });

    niaData.condiments.forEach(item => {
      const fac = item.weight_g / 100;
      condKcal += Math.round((item.kcal_per100g || 0) * fac);
      condProt += (item.prot_per100g || 0) * fac;
      condCarb += (item.carb_per100g || 0) * fac;
      condFat  += (item.fat_per100g || 0) * fac;
    });

    niaData.drink.forEach(item => {
      const fac = item.weight_g / 100;
      drinkKcal += Math.round((item.kcal_per100g || 0) * fac);
      drinkProt += (item.prot_per100g || 0) * fac;
      drinkCarb += (item.carb_per100g || 0) * fac;
      drinkFat  += (item.fat_per100g || 0) * fac;
    });

    niaData.baseTotals = { kcal: plateKcal, prot: plateProt, carb: plateCarb, fat: plateFat };
    niaData.condTotals = { kcal: condKcal, prot: condProt, carb: condCarb, fat: condFat };
    niaData.drinkTotals = { kcal: drinkKcal, prot: drinkProt, carb: drinkCarb, fat: drinkFat };

    niaData.finalKcal = Math.round(plateKcal + condKcal + drinkKcal);
    niaData.finalProt = +(plateProt + condProt + drinkProt).toFixed(1);
    niaData.finalCarb = +(plateCarb + condCarb + drinkCarb).toFixed(1);
    niaData.finalFat  = +(plateFat + condFat + drinkFat).toFixed(1);

    const targetCals = profile.targetCals || 2000;
    const mealPct = Math.round(niaData.finalKcal / targetCals * 100);
    const macroTotal = niaData.finalProt + niaData.finalCarb + niaData.finalFat;
    const protRatio  = macroTotal > 0 ? (niaData.finalProt / macroTotal * 100) : 20;
    const carbRatio  = macroTotal > 0 ? (niaData.finalCarb / macroTotal * 100) : 50;
    const fatRatio   = macroTotal > 0 ? (niaData.finalFat  / macroTotal * 100) : 30;

    const score = Math.min(98, Math.max(20,
      75
      - Math.abs(mealPct - 30) * 0.7
      + Math.min(15, protRatio * 0.35)
      - Math.max(0, carbRatio - 60) * 0.3
      - Math.max(0, fatRatio - 40) * 0.3
    ));
    niaData.score = Math.round(score);

    renderPaFinalReportNew();
    niaAddToLog();

    if (spinnerBlock) spinnerBlock.classList.add('hidden');
    if (reportBlock) reportBlock.classList.remove('hidden');

    // Scroll smoothly to align the Clinical Assessment (Valoración Nutricional) card at the top
    setTimeout(() => {
      document.querySelector('.nia-assessment')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);

    if (window.currentTourStep === 3) {
        setTimeout(() => {
            showScreen('home');
            setTimeout(() => {
                const overlay = document.getElementById('onb-tour-overlay');
                if (overlay) overlay.classList.remove('hidden');
                if (typeof positionTooltip === 'function') {
                    positionTooltip('onb-tooltip-3', '.score-card', 'bottom');
                }
            }, 400);
        }, 1500);
    }

  } catch (err) {
    console.error('Final assessment error:', err);
    showMsg('Error en el análisis final: ' + err.message);
    renderPaManualEntry(false, err.message || err);
    if (spinnerBlock) spinnerBlock.classList.add('hidden');
  } finally {
    if (mainBtn) mainBtn.removeAttribute('disabled');
  }
}

function renderPaFinalReportNew() {
  const scoreInt = niaData.score;
  const totalKcal = niaData.finalKcal;
  const totalProt = niaData.finalProt;
  const totalCarb = niaData.finalCarb;
  const totalFat  = niaData.finalFat;

  const targetCals = profile.targetCals || 2000;
  const mealPct = Math.round(totalKcal / targetCals * 100);
  const macroTotal = totalProt + totalCarb + totalFat;
  const protRatio  = macroTotal > 0 ? (totalProt / macroTotal * 100) : 20;
  const carbRatio  = macroTotal > 0 ? (totalCarb / macroTotal * 100) : 50;
  const fatRatio   = macroTotal > 0 ? (totalFat  / macroTotal * 100) : 30;

  const trafficLight = scoreInt >= 75 ? '🟢' : scoreInt >= 55 ? '🟡' : '🔴';
  const trafficLabel = scoreInt >= 75 ? 'Excelente elección nutricional' : scoreInt >= 55 ? 'Aceptable — con margen de mejora' : 'Atención nutricional requerida';

  const macroBarProt = Math.min(100, Math.round(protRatio));
  const macroBarCarb = Math.min(100, Math.round(carbRatio));
  const macroBarFat  = Math.min(100, Math.round(fatRatio));

  const userDiet = profile.diet || 'omnivoro';
  const suggestions = [];
  if (totalProt < 15) {
    let protRecs = 'pollo, huevo, legumbres o pescado';
    if (userDiet === 'vegano') protRecs = 'tofu, tempeh, seitán o legumbres';
    else if (userDiet === 'vegetariano') protRecs = 'legumbres, huevos, queso magro, tofu o seitán';
    else if (userDiet === 'pescetariano') protRecs = 'pescado, mariscos, legumbres o huevos';
    suggestions.push(`📌 <strong>Proteína baja:</strong> Incorporá ${protRecs} en el plato.`);
  }
  if (totalCarb > 90) suggestions.push('📌 <strong>Carbohidratos elevados:</strong> Priorizá fuentes integrales y controlá las porciones.');
  if (totalFat > 40) suggestions.push('📌 <strong>Grasas elevadas:</strong> Revisá el método de cocción y los aderezos.');
  if (mealPct > 55) suggestions.push(`📌 <strong>Comida calórica:</strong> Representa el ${mealPct}% de tu meta diaria — ajustá el resto del día.`);
  
  let alcoholNote = '';
  niaData.drink.forEach(item => {
    if (item.name.toLowerCase().includes('cerveza') || item.name.toLowerCase().includes('vino') || item.name.toLowerCase().includes('fernet') || item.name.toLowerCase().includes('whisky') || item.name.toLowerCase().includes('vodka') || item.name.toLowerCase().includes('gin') || item.name.toLowerCase().includes('alcohol')) {
      const kcalVal = Math.round((item.kcal_per100g || 0) * (item.weight_g / 100));
      if (kcalVal > 0) {
        alcoholNote = `<div class="nia-alert nia-alert-warn" style="margin-top:0.75rem">🍷 <strong>Bebida alcohólica detectada:</strong> ${item.name} (${item.weight_g}ml) aporta calorías vacías que interfieren con la absorción de nutrientes (vitaminas B y zinc) y elevan el cortisol.</div>`;
      }
    }
  });

  let dietViolationNote = '';
  const nonCompliant = [...niaData.detected, ...niaData.condiments, ...niaData.drink].filter(item => !isFoodCompliantWithDiet(item.name, userDiet));
  if (nonCompliant.length > 0) {
    const names = nonCompliant.map(item => `<strong>${item.name}</strong>`).join(', ');
    dietViolationNote = `<div class="nia-alert nia-alert-warn" style="margin-top:0.75rem; background:rgba(239,83,80,0.12); border:1px solid rgba(239,83,80,0.25); color:#ef5350;">⚠️ <strong>Alerta de Dieta (${userDiet.charAt(0).toUpperCase() + userDiet.slice(1)}):</strong> Este plato contiene ingredientes no compatibles: ${names}. Recordá que tu perfil tiene seleccionada la alimentación base como ${userDiet}.</div>`;
  }

  const baseHTML = `
    <!-- SCORE HERO -->
    <div class="nia-final-hero" style="margin-top:1.25rem">
      <div class="nia-final-score-wrap">
        <div class="nia-final-score-ring">
          <svg viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="8"/>
            <circle cx="40" cy="40" r="32" fill="none" stroke="url(#pfsgNew)" stroke-width="8"
              stroke-linecap="round" stroke-dasharray="201" stroke-dashoffset="${Math.round(201-(scoreInt/100)*201)}"
              transform="rotate(-90 40 40)"/>
            <defs>
              <linearGradient id="pfsgNew" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="${scoreInt>=75?'#4ade80':scoreInt>=55?'#fb923c':'#f87171'}"/>
                <stop offset="100%" stop-color="${scoreInt>=75?'#22d3ee':scoreInt>=55?'#fbbf24':'#fb923c'}"/>
              </linearGradient>
            </defs>
          </svg>
          <div class="nia-final-score-num">${scoreInt}</div>
        </div>
        <div class="nia-final-score-info">
          <div class="nia-final-traffic">${trafficLight} ${trafficLabel}</div>
          <div class="nia-final-kcal"><strong>${totalKcal}</strong> kcal totales</div>
          <div class="nia-final-pct">= ${mealPct}% de tu meta diaria</div>
        </div>
      </div>
    </div>

    <!-- INGREDIENTES IDENTIFICADOS -->
    <div class="nia-card nia-analyst-card">
      <div class="nia-analyst-header">
        <span class="nia-analyst-icon">🩺</span>
        <div>
          <h4>Alimentos y Componentes Detectados</h4>
          <p class="nia-sub">Análisis unificado por la Inteligencia Artificial</p>
        </div>
      </div>
      <div class="nia-ing-list">
        ${niaData.detected.map(f => `
          <div class="nia-ing-item">
            <span class="nia-ing-emoji">${f.emoji || '🍽️'}</span>
            <div class="nia-ing-info">
              <span class="nia-ing-name">${f.name}</span>
              <span class="nia-ing-weight">~${f.weight_g}g estimados</span>
            </div>
            <span class="nia-conf-badge conf-high">🟢 Detectado</span>
          </div>`).join('')}
        ${niaData.condiments.map(f => `
          <div class="nia-ing-item">
            <span class="nia-ing-emoji">${f.emoji || '🧂'}</span>
            <div class="nia-ing-info">
              <span class="nia-ing-name">${f.name} (Condimento)</span>
              <span class="nia-ing-weight">~${f.weight_g}g estimado</span>
            </div>
            <span class="nia-conf-badge conf-high" style="background:rgba(251,146,60,0.12);color:var(--orange);border:1px solid rgba(251,146,60,0.3)">🧂 Aderezo</span>
          </div>`).join('')}
        ${niaData.drink.map(f => `
          <div class="nia-ing-item">
            <span class="nia-ing-emoji">${f.emoji || '🥤'}</span>
            <div class="nia-ing-info">
              <span class="nia-ing-name">${f.name} (Bebida)</span>
              <span class="nia-ing-weight">${f.weight_g} cm³ (ml)</span>
            </div>
            <span class="nia-conf-badge conf-high" style="background:rgba(34,211,238,0.12);color:var(--cyan);border:1px solid rgba(34,211,238,0.3)">🥤 Bebida</span>
          </div>`).join('')}
      </div>
    </div>

    <!-- DETALLE NUTRICIONAL TABLA -->
    <div class="nia-card">
      <h4>📊 Detalle nutricional por componente</h4>
      <div class="nia-table-wrap">
        <table class="nia-table">
          <thead><tr><th>Componente</th><th>Peso/Vol</th><th>kcal</th><th>Prot</th><th>Carb</th><th>Grasa</th></tr></thead>
          <tbody>
            ${[...niaData.detected, ...niaData.condiments, ...niaData.drink].map(f => {
              const fac = f.weight_g/100;
              return `<tr>
                <td>${f.emoji || '🍽️'} ${f.name}</td>
                <td>${f.weight_g}${f.category === 'drink' ? 'ml' : 'g'}</td>
                <td>${Math.round((f.kcal_per100g || 0)*fac)}</td>
                <td>${((f.prot_per100g || 0)*fac).toFixed(1)}g</td>
                <td>${((f.carb_per100g || 0)*fac).toFixed(1)}g</td>
                <td>${((f.fat_per100g || 0)*fac).toFixed(1)}g</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- MACROS DETALLADOS -->
    <div class="nia-card">
      <h4>🧬 Composición nutricional total</h4>
      <div class="nia-macro-bars">
        <div class="nia-macro-bar-row">
          <div class="nia-macro-bar-label">
            <span class="nia-macro-dot" style="background:var(--green)"></span>
            <span>Proteínas</span>
            <span class="nia-macro-bar-val green">${totalProt}g</span>
          </div>
          <div class="nia-macro-bar-track"><div class="nia-macro-bar-fill" style="width:${macroBarProt}%;background:var(--green)"></div></div>
          <span class="nia-macro-bar-pct">${macroBarProt}%</span>
        </div>
        <div class="nia-macro-bar-row">
          <div class="nia-macro-bar-label">
            <span class="nia-macro-dot" style="background:var(--cyan)"></span>
            <span>Carbohidratos</span>
            <span class="nia-macro-bar-val cyan">${totalCarb}g</span>
          </div>
          <div class="nia-macro-bar-track"><div class="nia-macro-bar-fill" style="width:${macroBarCarb}%;background:var(--cyan)"></div></div>
          <span class="nia-macro-bar-pct">${macroBarCarb}%</span>
        </div>
        <div class="nia-macro-bar-row">
          <div class="nia-macro-bar-label">
            <span class="nia-macro-dot" style="background:var(--purple)"></span>
            <span>Grasas</span>
            <span class="nia-macro-bar-val purple">${totalFat}g</span>
          </div>
          <div class="nia-macro-bar-track"><div class="nia-macro-bar-fill" style="width:${macroBarFat}%;background:var(--purple)"></div></div>
          <span class="nia-macro-bar-pct">${macroBarFat}%</span>
        </div>
      </div>
    </div>

    <!-- DESGLOSE CALÓRICO -->
    <div class="nia-card">
      <h4>📦 Desglose calórico</h4>
      <div class="nia-breakdown-list">
        <div class="nia-breakdown-row"><span>🍽️ Plato principal</span><span><strong>${Math.round(niaData.baseTotals.kcal)} kcal</strong></span></div>
        ${niaData.condiments.length ? `<div class="nia-breakdown-row"><span>🧂 Condimentos</span><span>+${Math.round(niaData.condTotals.kcal)} kcal</span></div>` : ''}
        ${niaData.drink.length ? `<div class="nia-breakdown-row"><span>🥤 Bebida</span><span>+${Math.round(niaData.drinkTotals.kcal)} kcal</span></div>` : ''}
        <div class="nia-breakdown-row nia-breakdown-total"><span>TOTAL</span><span><strong>${totalKcal} kcal</strong></span></div>
      </div>
      <div class="nia-pct-bar-wrap">
        <p style="font-size:.78rem;color:var(--text-muted);margin-bottom:.4rem">Representa el <strong>${mealPct}%</strong> de tu objetivo diario (${targetCals} kcal)</p>
        <div class="nia-pct-bar"><div class="nia-pct-fill" style="width:${Math.min(100,mealPct)}%;background:${mealPct>50?'var(--orange)':'var(--green)'}"></div></div>
      </div>
    </div>

    ${alcoholNote}
    ${dietViolationNote}

    <!-- VALORACIÓN CLÍNICA -->
    <div class="nia-card nia-assessment">
      <h4>🩺 Valoración Nutricional Personalizada</h4>
      <div class="nia-clinical-note">${niaData.clinicalAssessment}</div>
      <div style="font-size: 0.65rem; color: var(--text-dim); margin-top: 10px; padding-top: 6px; border-top: 1px dashed rgba(255,255,255,0.08); font-style: italic; line-height: 1.3;">*Aviso: Esta valoración es de carácter informativo y general basada en IA. No reemplaza ni sustituye las indicaciones personalizadas de tu médico, nutricionista o deportólogo profesional.*</div>
      ${suggestions.length ? `
        <div class="nia-suggestions">
          <p style="font-weight:600;font-size:.82rem;margin-bottom:.4rem;color:var(--text-muted)">Recomendaciones:</p>
          ${suggestions.map(s=>`<div class="nia-sugg-item-card">${s}</div>`).join('')}
        </div>` :
        '<div class="nia-no-sugg">✅ Sin recomendaciones adicionales — ¡excelente elección para tu objetivo!</div>'}
    </div>`;

  document.getElementById('nia-final-report').innerHTML = baseHTML;
}

function niaAddToLog() {
  const plate = niaData.detected || [];
  const drink = niaData.drink || [];
  
  let nameParts = plate.map(f => f.name);
  if (drink.length > 0) {
    nameParts.push(drink.map(d => d.name).join(' · '));
  }
  
  const name = nameParts.length > 0 ? nameParts.join(' + ') : 'Análisis de foto';
  const meal = {
    id: Date.now(),
    name,
    emoji: '📸',
    type: niaData.mealType || 'almuerzo',
    kcal: niaData.finalKcal || 0,
    prot: niaData.finalProt || 0,
    carb: niaData.finalCarb || 0,
    fat: niaData.finalFat || 0,
    score: niaData.score || 70,
    qty: 0,
    date: niaTargetMealDate ? niaTargetMealDate.toDateString() : new Date().toDateString()
  };
  meals.push(meal);
  localStorage.setItem('nutriMeals', JSON.stringify(meals));
  if (typeof niaCheckAndConsumeTicket === 'function') {
    niaCheckAndConsumeTicket(meal);
  }
  extractAndSyncHydrationFromFoods(niaData.detected || [], name);
  if (typeof niaPostLog === 'function') {
    const dateStr = meal.date ? niaStandardizeDate(meal.date) : new Date().toISOString().split('T')[0];
    niaPostLog('meal', meal, dateStr).then(id => {
      if (id) {
        meal.saasId = id;
        localStorage.setItem('nutriMeals', JSON.stringify(meals));
      }
    });
  }
  niaSendToGoogleSheets(meal);
  
  if (niaSelectedDrink !== 'ninguna' && niaDrinkMl > 0) {
    const drinkDate = niaTargetMealDate 
      ? niaTargetMealDate.toISOString().split('T')[0] 
      : (typeof getTodayStr === 'function' ? getTodayStr() : new Date().toISOString().split('T')[0]);
    const drinkName = niaSelectedDrink === 'otro' ? (niaCustomDrink || 'Otra bebida') : (PA_DRINKS[niaSelectedDrink]?.label || 'Bebida');
    
    if (typeof hydrationLog !== 'undefined') {
      hydrationLog.push({
        ml: niaDrinkMl,
        time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        date: drinkDate,
        timestamp: Date.now(),
        source: drinkName
      });
      if (typeof saveNewFeatureData === 'function') {
        saveNewFeatureData();
      } else {
        localStorage.setItem('nutriHydrationLog', JSON.stringify(hydrationLog));
      }
      if (typeof updateHydrationUI === 'function') {
        updateHydrationUI();
      }
    }
  }
  
  renderMealsLog();
  updateDashboard();
  updateNutricion();

  if (typeof updateHydrationUI === 'function') {
    updateHydrationUI();
  }
  if (typeof renderProgressCharts === 'function') {
    renderProgressCharts(currentPeriodDays);
  }
  if (typeof checkAchievements === 'function') {
    checkAchievements();
  }
  
  updateDailyProgressBar();
  showMsg("¡Excelente elección! Plato registrado con éxito. ¡Seguí así para alcanzar tu meta de hoy! 🥗🔥");
  niaReset();
}

function niaReset() {
  niaPhotoData = null;
  niaPhotoMime = null;
  niaSelectedMealType = 'almuerzo';
  niaSelectedInvisibleIngredients = [];
  niaCustomInvisibleIngredients = '';
  niaSelectedDrink = 'ninguna';
  niaDrinkMl = 250;
  niaCustomDrink = '';
  niaAlcoholPct = 0;

  const choiceContainer = document.getElementById('nia-meals-choice-container');
  const flowContainer = document.getElementById('nia-meals-flow-container');
  if (choiceContainer) choiceContainer.classList.add('hidden');
  if (flowContainer) flowContainer.classList.remove('hidden');

  const cameraBtn = document.getElementById('nia-btn-camera');
  if (cameraBtn) cameraBtn.style.display = 'flex';

  const contextEl = document.getElementById('photo-context');
  if (contextEl) contextEl.value = '';

  const textDesc = document.getElementById('food-text-description');
  if (textDesc) textDesc.value = '';

  niaRemovePhoto();

  const panel = document.getElementById('photo-analysis-panel');
  if (panel) panel.classList.add('hidden');
  const spinnerBlock = document.getElementById('nia-loading-spinner-block');
  if (spinnerBlock) spinnerBlock.classList.add('hidden');
  const reportBlock = document.getElementById('nia-final-report-block');
  if (reportBlock) reportBlock.classList.add('hidden');
  const editBlock = document.getElementById('nia-edit-ingredients-block');
  if (editBlock) editBlock.classList.add('hidden');

  const finalRep = document.getElementById('nia-final-report');
  if (finalRep) finalRep.innerHTML = '';

  renderMealsLog();
  updateDashboard();
  updateNutricion();

  const activeDateLabel = document.getElementById('nia-active-date-label');
  if (activeDateLabel && !niaTargetMealDate) {
    activeDateLabel.textContent = '📅 Registrando para hoy';
  }

  // Volver suavemente al inicio del identificador de comidas
  const tabComidas = document.getElementById('tab-comidas');
  if (tabComidas) {
    const titleEl = tabComidas.querySelector('.section-title');
    if (titleEl) {
      titleEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

function renderPaManualEntry(lowQuality, errDetail) {
  const finalRep = document.getElementById('nia-final-report');
  if (!finalRep) return;

  let msg = lowQuality 
    ? '⚠️ No pudimos identificar los ingredientes de la foto. Por favor, intenta de nuevo con una toma más clara y con buena iluminación, o intenta más tarde.' 
    : '❌ Error al conectar con la IA de análisis. Por favor, intenta de nuevo o verifica tu conexión a internet.';

  if (errDetail) {
    msg += `<br><br><span style="font-size:0.75rem;color:#f87171;font-family:monospace;background:rgba(0,0,0,0.05);padding:4px 8px;border-radius:4px;display:inline-block">Detalle del error: ${errDetail}</span>`;
  }

  finalRep.innerHTML = `
    <div class="nia-card" style="text-align:center;padding:2rem 1.5rem;border-color:rgba(200,29,58,0.2)">
      <div style="font-size:2.5rem;margin-bottom:1rem">📝</div>
      <p style="font-weight:700;margin-bottom:0.5rem;font-size:1rem;color:var(--text)">Entrada manual / Fallo de IA</p>
      <p style="font-size:0.85rem;color:var(--text-dim);line-height:1.5;margin-bottom:1.25rem">${msg}</p>
      <button class="btn-primary btn-full" onclick="niaReset()">Intentar de nuevo</button>
    </div>
  `;

  const panel = document.getElementById('photo-analysis-panel');
  if (panel) panel.classList.remove('hidden');
  const spinnerBlock = document.getElementById('nia-loading-spinner-block');
  if (spinnerBlock) spinnerBlock.classList.add('hidden');
  const reportBlock = document.getElementById('nia-final-report-block');
  if (reportBlock) reportBlock.classList.remove('hidden');
  const editBlock = document.getElementById('nia-edit-ingredients-block');
  if (editBlock) editBlock.classList.add('hidden');
}


function addMeal() {
    if (!currentAnalysis) return;
    const m = {
        id: Date.now(), name: currentAnalysis.name || currentAnalysis.rawName, emoji: currentAnalysis.emoji || '🍽️',
        type: currentAnalysis.mealType, kcal: currentAnalysis.kcalTotal, prot: currentAnalysis.protTotal,
        carb: currentAnalysis.carbTotal, fat: currentAnalysis.fatTotal, score: currentAnalysis.score,
        qty: currentAnalysis.qty, date: new Date().toDateString()
    };
    meals.push(m); localStorage.setItem('nutriMeals', JSON.stringify(meals));
    if (typeof niaCheckAndConsumeTicket === 'function') {
        niaCheckAndConsumeTicket(m);
    }
    extractAndSyncHydrationFromFoods([{ name: m.name, quantity: m.qty }], m.name);
    if (typeof niaPostLog === 'function') {
        const dateStr = m.date ? niaStandardizeDate(m.date) : new Date().toISOString().split('T')[0];
        niaPostLog('meal', m, dateStr).then(id => {
            if (id) {
                m.saasId = id;
                localStorage.setItem('nutriMeals', JSON.stringify(meals));
            }
        });
    }
    niaSendToGoogleSheets(m);
    currentAnalysis = null;
    document.getElementById('analysis-result').classList.add('hidden');
    document.getElementById('food-search').value = '';
    updateDailyProgressBar();
    renderMealsLog(); updateDashboard(); updateNutricion(); showMsg("¡Buenísimo! Comida agregada al registro de hoy. ¡Tu progreso diario avanza! 🥗🚀");
}
function deleteMeal(id) {
    const mealToDelete = meals.find(m => m.id === id);
    if (mealToDelete && mealToDelete.saasId && typeof niaDeleteLog === 'function') {
        niaDeleteLog(mealToDelete.saasId);
    }
    meals = meals.filter(m => m.id !== id); localStorage.setItem('nutriMeals', JSON.stringify(meals));
    updateDailyProgressBar();
    renderMealsLog(); updateDashboard(); updateNutricion();
}
function formatMealUnit(qty, unit) {
    const q = qty || 1;
    const u = String(unit || '').toLowerCase().trim();
    if (u === 'g' || u === 'gr' || u === 'gramos') return `${q}g`;
    if (u === 'ml' || u === 'mililitros') return `${q}ml`;
    if (u === 'porción' || u === 'porcion') return `${q} porción`;
    return `${q}u`;
}

function renderMealsLog() {
    const log = document.getElementById('meals-log'); if (!log) return;
    const today = getTodayMeals();
    
    const titleEl = document.getElementById('nia-log-title');
    if (titleEl) {
        if (niaTargetMealDate) {
            const options = { weekday: 'long', day: 'numeric', month: 'long' };
            const formatted = niaTargetMealDate.toLocaleDateString('es-AR', options);
            titleEl.textContent = `Registro del ${formatted.charAt(0).toUpperCase() + formatted.slice(1)}`;
        } else {
            titleEl.textContent = 'Registro de hoy';
        }
    }
    
    if (today.length === 0) {
        log.innerHTML = `<p class="empty-note">No hay comidas registradas ${niaTargetMealDate ? 'para este día' : 'hoy'}.</p>`;
        return;
    }

    const groups = ['desayuno', 'almuerzo', 'merienda', 'cena', 'snack'];
    const labels = { desayuno: 'Desayuno', almuerzo: 'Almuerzo', merienda: 'Merienda', cena: 'Cena', snack: 'Colación' };
    const emojis = { desayuno: '🌅', almuerzo: '☀️', merienda: '🍎', cena: '🌙', snack: '🥜' };

    let html = '';
    groups.forEach(g => {
        const gm = today.filter(m => m.type === g);
        if (!gm.length) return;

        // Calcular totales de este grupo / comida
        const totalKcal = Math.round(gm.reduce((s, m) => s + (m.kcal || 0), 0));
        const totalProt = gm.reduce((s, m) => s + (m.prot || 0), 0).toFixed(1);
        const totalCarb = gm.reduce((s, m) => s + (m.carb || 0), 0).toFixed(1);
        const totalFat  = gm.reduce((s, m) => s + (m.fat || 0), 0).toFixed(1);

        // Extraer texto plano o transcripción si existe
        const transcripts = gm.map(m => m.transcript).filter(Boolean);
        const uniqueTranscripts = [...new Set(transcripts)];
        const transcriptStr = uniqueTranscripts.length > 0 ? uniqueTranscripts.join(' · ') : '';

        let itemsHTML = '';
        gm.forEach(m => {
            const unitDisplay = formatMealUnit(m.qty, m.unit);
            itemsHTML += `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 8px; background:rgba(255,255,255,0.025); border-radius:8px; margin-bottom:2px; font-size:0.8rem;">
                <div style="display:flex; align-items:center; gap:6px; flex:1; min-width:0;">
                  <span style="font-size:0.88rem; flex-shrink:0;">${m.emoji || '🍽️'}</span>
                  <span style="font-weight:700; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${m.name}</span>
                </div>
                <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                  <span style="color:var(--text-dim); font-size:0.74rem; font-weight:600;">${unitDisplay} · ${m.kcal} kcal · P:${m.prot}g C:${m.carb}g G:${m.fat}g</span>
                  <button onclick="deleteMeal(${m.id})" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:0.8rem; padding:1px 3px; margin:0;" title="Eliminar">🗑️</button>
                </div>
              </div>
            `;
        });

        html += `
          <div class="meal-group-card glass-card" style="background:rgba(255,255,255,0.015); border:1px solid rgba(255,255,255,0.07); border-radius:12px; padding:8px 12px; margin-bottom:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:4px; border-bottom:1px solid rgba(255,255,255,0.05); margin-bottom:6px;">
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:1rem;">${emojis[g]}</span>
                <span style="font-weight:800; font-size:0.88rem; color:var(--text);">${labels[g]}</span>
              </div>
              <div style="font-size:0.73rem; font-weight:800; color:var(--orange); background:rgba(245,158,11,0.12); padding:2px 8px; border-radius:8px; border:1px solid rgba(245,158,11,0.2);">
                ${totalKcal} kcal · P:${totalProt}g C:${totalCarb}g G:${totalFat}g
              </div>
            </div>

            ${transcriptStr ? `
              <div style="font-size:0.72rem; color:var(--cyan); background:rgba(6,182,212,0.06); border-left:2px solid var(--cyan); padding:4px 8px; border-radius:3px 6px 6px 3px; margin-bottom:6px; line-height:1.35;">
                💬 <strong>Texto:</strong> "${transcriptStr}"
              </div>
            ` : ''}

            <div class="meal-detected-items" style="display:flex; flex-direction:column; gap:2px;">
              ${itemsHTML}
            </div>
          </div>
        `;
    });

    log.innerHTML = html;
}

// ===== NUTRICIÓN PAGE =====
function updateNutricion() {
    const today = getTodayMeals(), tot = calcTotals(today);
    const hasMeals = today.length > 0;
    const score = hasMeals ? calcDailyScore(tot, today) : 0;
    updateScoreRing(score);

    const bigInfo = document.querySelector('.big-score-info p');
    if (bigInfo) {
        if (!hasMeals) {
            bigInfo.textContent = 'Aún no tenés comidas registradas para este día. Registrá tu primera comida para ver tu balance nutricional.';
        } else {
            bigInfo.textContent = 'Tu alimentación de hoy tiene un buen balance de nutrientes según una mirada integral de lo que de verdad funciona.';
        }
    }

    const pg = profile.prot || 120, cg = profile.carb || 180, fg = profile.fat || 60;
    const macrosEl = document.getElementById('macros-detail');
    if (macrosEl) {
        macrosEl.innerHTML =
            [{ n: 'Proteínas', c: 'green', v: Math.round(tot.prot), g: pg, cls: 'prot-bar' },
            { n: 'Carbohidratos', c: 'cyan', v: Math.round(tot.carb), g: cg, cls: 'carb-bar' },
            { n: 'Grasas', c: 'purple', v: Math.round(tot.fat), g: fg, cls: 'fat-bar' }].map(({ n, c, v, g, cls }) =>
                `<div class="macro-detail-item glass-card">
          <div class="macro-d-header"><span class="macro-d-name" style="color:var(--${c})">${n}</span><span class="macro-d-nums">${v}g / ${g}g</span></div>
          <div class="macro-d-bar-wrap"><div class="macro-d-bar ${cls}" style="width:${g > 0 ? Math.min(100, (v / g) * 100) : 0}%"></div></div>
        </div>`).join('');
    }

    const microsGrid = document.getElementById('micros-grid');
    if (microsGrid) {
        if (!hasMeals) {
            microsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 1.5rem; background: var(--bg1); border-radius: 14px; border: 1px dashed rgba(255,255,255,0.12);">
                <p style="font-size: 0.88rem; color: var(--text-dim); margin-bottom: 0.75rem; line-height: 1.4;">No tenemos registros aún. ¿Quieres comenzar a cargar tus consumos?</p>
                <button class="btn-primary" onclick="showScreen('comidas')" style="font-size: 0.8rem; padding: 8px 16px; border-radius: 10px;">📷 Cargar mi primera comida</button>
            </div>`;
        } else {
            microsGrid.innerHTML = MICROS_MAP.map(m => {
                const v = Math.round(tot.kcal > 0 ? (m.good * Math.min(1, tot.kcal / 2000)) : 0);
                const p = Math.round(v / m.good * 100);
                return `<div class="micro-card"><div class="micro-card-name">${m.icon} ${m.name}</div>
              <div class="micro-card-val">${v}${m.unit}</div>
              <div class="micro-card-pct ${p >= 60 ? 'pct-good' : 'pct-low'}">${p}% del objetivo</div></div>`;
            }).join('');
        }
    }

    const avg = hasMeals ? (today.reduce((s, m) => s + (m.score || 0), 0) / today.length) : 0;
    
    const cardioBar = document.getElementById('imp-cardio');
    const cardioScore = document.getElementById('imp-cardio-score');
    if (cardioBar) cardioBar.style.width = hasMeals ? `${Math.round(avg)}%` : '0%';
    if (cardioScore) cardioScore.textContent = hasMeals ? `${Math.round(avg)} / 100` : '0 / 100';

    const metaBar = document.getElementById('imp-meta');
    const metaScore = document.getElementById('imp-meta-score');
    if (metaBar) metaBar.style.width = hasMeals ? `${Math.round(avg)}%` : '0%';
    if (metaScore) metaScore.textContent = hasMeals ? `${Math.round(avg)} / 100` : '0 / 100';

    const microBar = document.getElementById('imp-micro');
    const microScore = document.getElementById('imp-micro-score');
    if (microBar) microBar.style.width = hasMeals ? `${Math.round(avg)}%` : '0%';
    if (microScore) microScore.textContent = hasMeals ? `${Math.round(avg)} / 100` : '0 / 100';
}

// ===== UTILS =====
function getTodayMeals() { const t = (niaTargetMealDate || new Date()).toDateString(); return meals.filter(m => m.date === t); }
function getTodayActivities() { const t = new Date().toDateString(); return activities.filter(a => a.date === t); }
function calcTotals(list) { return list.reduce((a, m) => ({ kcal: a.kcal + (m.kcal || 0), prot: a.prot + (m.prot || 0), carb: a.carb + (m.carb || 0), fat: a.fat + (m.fat || 0) }), { kcal: 0, prot: 0, carb: 0, fat: 0 }); }
function goalLabel(g) {
    if (!g) return 'salud general';
    const goalsArray = Array.isArray(g) ? g : (typeof g === 'string' ? g.split(',') : [g]);
    const labels = {
        perderPeso: 'disminuir masa grasa',
        ganarMusculo: 'ganar músculo',
        recomposicion: 'recomposición corporal',
        saludGeneral: 'salud general',
        longevidad: 'longevidad',
        energia: 'aumentar energía',
        rendimientoDeportivo: 'rendimiento deportivo',
        saludMental: 'salud mental',
        recuperacionMedica: 'recuperación de problema médico'
    };
    return goalsArray.map(x => labels[x.trim()] || x).join(', ');
}
function showMsg(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:rgba(30,36,51,.95);border:1px solid rgba(255,255,255,.1);color:white;padding:.7rem 1.2rem;border-radius:100px;font-size:.88rem;font-family:Inter,sans-serif;z-index:9999;white-space:nowrap;backdrop-filter:blur(12px);animation:fadeUp .3s ease';
    t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2500);
}
function resetApp() { if (confirm('¿Reiniciar tu perfil? Se borrarán todos tus datos.')) { localStorage.clear(); location.reload(); } }

// ===== FOOD AUTOCOMPLETE =====
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.search.includes('reset=true')) {
        localStorage.removeItem('nutriProfile');
        localStorage.removeItem('nutriMeals');
        localStorage.removeItem('nutriSupps');
        localStorage.removeItem('nutriActivities');
        localStorage.removeItem('nutriMetrics');
        window.location.href = window.location.origin + window.location.pathname;
        return;
    }
    const fs = document.getElementById('food-search');
    if (fs) fs.addEventListener('input', () => {
        const val = fs.value.trim().toLowerCase(), sugg = document.getElementById('food-suggestions');
        if (val.length < 2) { sugg.innerHTML = ''; return; }
        const m = FOOD_DB.filter(f => f.name.toLowerCase().includes(val) && isFoodCompliantWithDiet(f.name, profile.diet)).slice(0, 5);
        sugg.innerHTML = m.length ? m.map(f => `<div class="food-sugg-item" onclick="selectFoodSugg('${f.name}')">${f.emoji} ${f.name} — ${f.kcal} kcal/100g</div>`).join('') : '';
    });
    // Activity calorie estimate on change
    ['act-type', 'act-duration', 'act-intensity'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', (e) => { if (typeof updateKcalEstimate === 'function') updateKcalEstimate(e); });
    });
    const dur = document.getElementById('act-duration');
    if (dur) dur.addEventListener('input', (e) => { if (typeof updateKcalEstimate === 'function') updateKcalEstimate(e); });
    loadApp();
});
function selectFoodSugg(name) {
    document.getElementById('food-search').value = name;
    document.getElementById('food-suggestions').innerHTML = '';
    analyzeFood();
}

// ===== LOAD =====
function loadApp() {
    // Migrar claves heredadas de localStorage si existen
    if (localStorage.getItem('paGeminiKey') && !localStorage.getItem('niaGeminiKey')) {
        localStorage.setItem('niaGeminiKey', localStorage.getItem('paGeminiKey'));
    }
    if (localStorage.getItem('paSheetsUrl') && !localStorage.getItem('niaSheetsUrl')) {
        localStorage.setItem('niaSheetsUrl', localStorage.getItem('paSheetsUrl'));
    }

    // Resetear diario a las 00:01 hs si corresponde
    niaCheckMidnightRollover();

    const sp = localStorage.getItem('nutriProfile');
    if (sp) {
        profile = JSON.parse(sp);
        const sm = localStorage.getItem('nutriMeals'); if (sm) meals = JSON.parse(sm);
        const ss = localStorage.getItem('nutriSupps'); if (ss) supplements = JSON.parse(ss);
        const sa = localStorage.getItem('nutriActivities'); if (sa) activities = JSON.parse(sa);
        const savedMetrics = localStorage.getItem('nutriMetrics'); if (savedMetrics) metrics = JSON.parse(savedMetrics);
        
        // Populate inputs if profile exists so they can review their current settings
        niaPopulateOnboardingInputs();

        // Bypass onboarding and show the main application dashboard
        document.getElementById('onboarding').classList.remove('active');
        document.getElementById('app').classList.add('active');
        updateDashboard();
        updateNutricion();
        updateProfile();
        showScreen('inicio');
        renderMealsLog();
    } else {
        // If no profile exists, prompt user with onboarding screen step 1
        document.getElementById('onboarding').classList.add('active');
        document.getElementById('app').classList.remove('active');
        nextOnbStep(1);
    }
    
    const savedUrl = localStorage.getItem('niaSheetsUrl');
    const sheetsInput = document.getElementById('nia-sheets-url');
    if (sheetsInput && savedUrl) sheetsInput.value = savedUrl;
}

function displayProgresoMotivationalMessage() {
    const rawName = profile.name ? profile.name.trim() : '';
    const firstName = rawName.split(' ')[0] || '';
    const nameCap = firstName ? (firstName.charAt(0).toUpperCase() + firstName.slice(1)) : '';
    
    let motivation = '';
    const goal = profile.goal || '';
    if (goal.includes('perderPeso')) {
        motivation = `¡Qué bueno verte de nuevo${nameCap ? ', ' + nameCap : ''}! Estás en el camino correcto para disminuir tu masa grasa y mejorar tu salud. ¡La constancia es la clave! 📉✨`;
    } else if (goal.includes('ganarMusculo')) {
        motivation = `¡Qué bueno verte de nuevo${nameCap ? ', ' + nameCap : ''}! Cada día cuenta para nutrir tus fibras y ganar masa muscular. ¡A seguir entrenando fuerte! 💪🔥`;
    } else if (goal.includes('recuperacionMedica')) {
        motivation = `¡Qué bueno verte de nuevo${nameCap ? ', ' + nameCap : ''}! Estabilizar tu digestión es un camino de constancia y bienestar. ¡Tu cuerpo te lo agradece hoy! 🩺🌱`;
    } else {
        motivation = `¡Qué bueno verte de nuevo${nameCap ? ', ' + nameCap : ''}! Cada paso y registro te acerca un poco más a tus metas de bienestar. ¡Sigamos construyendo hábitos saludables hoy! 🌟🧬`;
    }
    
    const bannerEl = document.getElementById('progreso-motivational-banner');
    const textEl = document.getElementById('progreso-motivational-text');
    if (bannerEl && textEl) {
        textEl.innerHTML = motivation;
        bannerEl.classList.remove('hidden');
    }
}

// ===== GOOGLE SHEETS & PDF EXPORT SYSTEM =====

const APPS_SCRIPT_TEMPLATE = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Fecha", 
        "Momento", 
        "Detalle Comida", 
        "Calorias (kcal)", 
        "Proteinas (g)", 
        "Carbohidratos (g)", 
        "Grasas (g)", 
        "Puntaje Nutricional"
      ]);
    }
    
    sheet.appendRow([
      data.date,
      data.type,
      data.name,
      data.kcal,
      data.prot,
      data.carb,
      data.fat,
      data.score
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

function niaCopyAppsScriptCode() {
  navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE)
    .then(() => showMsg('✅ Código copiado al portapapeles. Pégalo en tu Google Apps Script.'))
    .catch(() => showMsg('Error al copiar el código. Inténtalo seleccionando el texto manualmente.'));
}

function niaToggleSheetsHelp() {
  const panel = document.getElementById('nia-sheets-help-panel');
  if (panel) {
    panel.classList.toggle('hidden');
  }
}

function niaSaveSheetsConfig() {
  if (localStorage.getItem('niaSaaSPremium') !== 'true') {
    openPremiumModal('report', document.getElementById('nia-report-card'));
    return;
  }
  const input = document.getElementById('nia-sheets-url');
  if (!input) return;
  const url = input.value.trim();
  
  if (url === '') {
    localStorage.removeItem('niaSheetsUrl');
    showMsg('Desconectado de Google Sheets.');
    return;
  }
  
  if (!url.startsWith('https://script.google.com/')) {
    showMsg('❌ URL inválida. Debe comenzar con https://script.google.com/');
    return;
  }
  
  localStorage.setItem('niaSheetsUrl', url);
  showMsg('✅ Planilla de Google Sheets conectada.');
}

function niaSendToGoogleSheets(entry) {
  const url = localStorage.getItem('niaSheetsUrl');
  if (!url) return;

  let payload;
  const dateObj = new Date(entry.date);
  const formattedDate = isNaN(dateObj.getTime()) ? entry.date : dateObj.toLocaleDateString();

  if (entry.duration !== undefined) {
    // Es una actividad física
    const actName = (typeof ACTIVITY_NAMES !== 'undefined' && ACTIVITY_NAMES[entry.type]) || entry.type;
    payload = {
      date: formattedDate,
      type: 'Actividad',
      name: `${actName} (${entry.duration} min, ${entry.intensity || 'moderada'})`,
      kcal: -entry.kcal, // Calorías quemadas (negativas para el balance neto)
      prot: 0,
      carb: 0,
      fat: 0,
      score: 0
    };
  } else {
    // Es una comida
    payload = {
      date: formattedDate,
      type: entry.type,
      name: entry.name,
      kcal: entry.kcal,
      prot: entry.prot,
      carb: entry.carb,
      fat: entry.fat,
      score: entry.score
    };
  }

  fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(() => {
    console.log('Sync: Registro sincronizado con Google Sheets.');
  })
  .catch(err => {
    console.error('Sync Error: Fallo al sincronizar con Google Sheets:', err);
  });
}

function niaDownloadNutriPDFReport() {
  const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;
  const lastDownloadStr = localStorage.getItem('niaLastPdfDownloadTime');
  const now = Date.now();

  if (lastDownloadStr) {
    const lastDownloadTime = parseInt(lastDownloadStr, 10);
    const elapsed = now - lastDownloadTime;
    if (elapsed < FIFTEEN_DAYS_MS) {
      const remainingMs = FIFTEEN_DAYS_MS - elapsed;
      const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
      const nextAvailableDate = new Date(lastDownloadTime + FIFTEEN_DAYS_MS).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      showMsg(`⚠️ Aún no pasaron 15 días desde tu último reporte descargado. Por favor esperá ${remainingDays} día(s) (hasta el ${nextAvailableDate}) para solicitar un nuevo reporte actualizado.`);
      return;
    }
  }

  let filteredMeals = Array.isArray(meals) ? meals : [];
  let filteredActs = Array.isArray(activities) ? activities : [];

  if (filteredMeals.length === 0 && filteredActs.length === 0) {
    showMsg('⚠️ No hay comidas ni actividades registradas para incluir en la planilla.');
    return;
  }

  filteredMeals.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  filteredActs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const primaryColor = [200, 29, 58];
    const secondaryColor = [30, 41, 59];

    // Header bar
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 15, 'F');
    
    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text("PLANILLA REPORTE PDF (PARA NUTRICIONISTA)", 14, 10);
    
    // Sub-info
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);
    doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-AR')}`, 14, 25);
    
    // Profile
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Información del Paciente:", 14, 34);
    
    doc.setFont("helvetica", "normal");
    const name = profile.name || 'Usuario';
    const age = profile.age || '--';
    const weight = profile.weight || '--';
    const height = profile.height || '--';
    const goal = goalLabel(profile.goal) || 'Salud General';
    const targetCals = profile.targetCals || 2000;

    const dietLabel = {
      omnivoro: 'Omnívoro',
      vegetariano: 'Vegetariano',
      vegano: 'Vegano',
      keto: 'Cetogénica (Keto)',
      paleo: 'Paleolítica',
      ayuno: 'Ayuno Intermitente'
    }[profile.diet] || profile.diet || 'Omnívoro';

    doc.text(`Nombre: ${name} (Edad: ${age} años)`, 14, 40);
    doc.text(`Peso: ${weight} kg  |  Altura: ${height} cm`, 14, 45);
    doc.text(`Alimentación: ${dietLabel}  |  Objetivo: ${goal}`, 14, 50);
    doc.text(`Objetivo Calórico Diario: ${targetCals} kcal`, 14, 55);
    
    // Summary
    const totalKcal = filteredMeals.reduce((s, m) => s + (m.kcal || 0), 0);
    const avgScore = filteredMeals.length > 0 ? Math.round(filteredMeals.reduce((s, m) => s + (m.score || 70), 0) / filteredMeals.length) : 0;
    const totalProt = filteredMeals.reduce((s, m) => s + (m.prot || 0), 0);
    const totalCarb = filteredMeals.reduce((s, m) => s + (m.carb || 0), 0);
    const totalFat = filteredMeals.reduce((s, m) => s + (m.fat || 0), 0);

    const burnedKcal = filteredActs.reduce((s, a) => s + (a.kcal || 0), 0);
    const netKcal = totalKcal - burnedKcal;

    doc.setFont("helvetica", "bold");
    doc.text("Resumen de Métricas Registradas:", 110, 34);
    doc.setFont("helvetica", "normal");
    doc.text(`Ingesta Total: ${totalKcal} kcal (${filteredMeals.length} registros)`, 110, 40);
    doc.text(`Gasto Físico: ${burnedKcal} kcal (${filteredActs.length} sesiones)`, 110, 45);
    doc.text(`Balance Neto: ${netKcal} kcal`, 110, 50);
    doc.text(`Puntaje Nutricional Promedio: ${filteredMeals.length > 0 ? avgScore + '/100' : 'N/A'}`, 110, 55);

    doc.setDrawColor(220, 220, 220);
    doc.line(14, 62, 196, 62);

    let currentY = 68;

    // Records table
    if (filteredMeals.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...primaryColor);
      doc.text("Detalle de las Ingestas Registradas", 14, currentY);

      const tableData = filteredMeals.map(m => {
        const formattedDate = new Date(m.date).toLocaleDateString('es-AR');
        const typeLabel = {
          desayuno: 'Desayuno',
          brunch: 'Brunch',
          almuerzo: 'Almuerzo',
          merienda: 'Merienda',
          cena: 'Cena',
          snack: 'Colación'
        }[m.type] || m.type;
        
        return [
          formattedDate,
          typeLabel,
          m.name,
          `${m.kcal || 0} kcal`,
          `P: ${Math.round(m.prot || 0)}g | C: ${Math.round(m.carb || 0)}g | G: ${Math.round(m.fat || 0)}g`,
          `${m.score || 70}/100`
        ];
      });

      doc.autoTable({
        startY: currentY + 5,
        head: [['Fecha', 'Momento', 'Plato / Ingredientes', 'Calorías', 'Macronutrientes', 'Puntaje']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 20 },
          2: { cellWidth: 72 },
          3: { cellWidth: 22 },
          4: { cellWidth: 35 },
          5: { cellWidth: 15, halign: 'center' }
        },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 8.5, font: 'helvetica' }
      });

      currentY = doc.lastAutoTable.finalY + 12;
    }

    // Activity table
    if (filteredActs.length > 0) {
      if (currentY > 250) {
        doc.addPage();
        currentY = 25;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...primaryColor);
      doc.text("Detalle de la Actividad Física Registrada", 14, currentY);

      const activityTableData = filteredActs.map(a => {
        const formattedDate = new Date(a.date).toLocaleDateString('es-AR');
        const actName = (typeof ACTIVITY_NAMES !== 'undefined' && ACTIVITY_NAMES[a.type]) || a.type;
        const duration = `${a.duration || a.dur || 0} min`;
        const intensityLabel = {
          baja: 'Baja',
          liviano: 'Liviano',
          medio: 'Medio',
          moderada: 'Moderada',
          intenso: 'Intenso',
          alta: 'Alta'
        }[a.intensity] || a.intensity;

        return [
          formattedDate,
          actName,
          duration,
          intensityLabel || 'Medio',
          `${a.kcal || 0} kcal`
        ];
      });

      doc.autoTable({
        startY: currentY + 5,
        head: [['Fecha', 'Actividad', 'Duración', 'Intensidad', 'Calorías Quemadas']],
        body: activityTableData,
        theme: 'striped',
        headStyles: { fillColor: secondaryColor, textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 60 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
          4: { cellWidth: 32, halign: 'right' }
        },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 8.5, font: 'helvetica' }
      });

      currentY = doc.lastAutoTable.finalY + 12;
    }

    // Body composition table
    const bMeasurements = JSON.parse(localStorage.getItem('nutriBodyMeasurements') || '[]');
    if (bMeasurements.length > 0) {
      if (currentY > 250) {
        doc.addPage();
        currentY = 25;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...secondaryColor);
      doc.text("Evolución de Composición Corporal", 14, currentY);

      const bodyTableData = bMeasurements.map(b => [
        b.date || '--',
        b.weight ? `${b.weight} kg` : '--',
        b.fat ? `${b.fat}%` : '--',
        b.muscle ? `${b.muscle} kg` : '--',
        b.waist ? `${b.waist} cm` : '--',
        b.hip ? `${b.hip} cm` : '--'
      ]);

      doc.autoTable({
        startY: currentY + 5,
        head: [['Fecha', 'Peso', '% Grasa', 'Masa Muscular', 'Cintura', 'Cadera']],
        body: bodyTableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 32 },
          4: { cellWidth: 30 },
          5: { cellWidth: 30 }
        },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 8.5, font: 'helvetica' }
      });

      currentY = doc.lastAutoTable.finalY + 12;
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: "center" });
      doc.text("Nutrición IA — Planilla Reporte PDF para Nutricionista", 14, 290);
    }

    doc.save(`Nutricion_IA_Reporte_Nutricionista.pdf`);
    localStorage.setItem('niaLastPdfDownloadTime', now.toString());
    showMsg('📄 Planilla Reporte PDF descargada con éxito.');
  } catch (error) {
    console.error('PDF Generation Error:', error);
    showMsg('❌ Error al generar el archivo PDF: ' + error.message);
  }
}
window.niaDownloadNutriPDFReport = niaDownloadNutriPDFReport;
window.niaDownloadPDFReport = niaDownloadNutriPDFReport;

function niaOpenAddExtraFlow() {
  const container = document.getElementById('nia-extra-flow-container');
  if (container) container.classList.remove('hidden');

  const questionBlock = document.getElementById('nia-extra-question-block');
  const photoBlock = document.getElementById('nia-extra-photo-block');
  const textBlock = document.getElementById('nia-extra-text-block');
  const loading = document.getElementById('nia-extra-loading-block');

  if (questionBlock) questionBlock.classList.remove('hidden');
  if (photoBlock) photoBlock.classList.add('hidden');
  if (textBlock) textBlock.classList.add('hidden');
  if (loading) loading.classList.add('hidden');

  const textarea = document.getElementById('nia-extra-text-description');
  if (textarea) textarea.value = '';

  const input = document.getElementById('extra-photo-input');
  if (input) input.value = '';
}

function niaExtraSelectHasPhoto(hasPhoto) {
  const questionBlock = document.getElementById('nia-extra-question-block');
  const photoBlock = document.getElementById('nia-extra-photo-block');
  const textBlock = document.getElementById('nia-extra-text-block');

  if (questionBlock) questionBlock.classList.add('hidden');
  
  if (hasPhoto) {
    if (photoBlock) photoBlock.classList.remove('hidden');
  } else {
    if (textBlock) textBlock.classList.remove('hidden');
  }
}

function niaCancelExtraFlow() {
  const container = document.getElementById('nia-extra-flow-container');
  if (container) container.classList.add('hidden');
}

function niaDropExtra(e) {
  e.preventDefault();
  const zone = document.getElementById('extra-photo-upload');
  if (zone) zone.classList.remove('dragover');
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
    niaProcessExtraFile(e.dataTransfer.files[0]);
  }
}

function niaHandleExtraFileSelect(input) {
  if (input && input.files && input.files[0]) {
    niaProcessExtraFile(input.files[0]);
  }
}

function niaProcessExtraFile(file) {
  if (!file.type.startsWith('image/')) {
    showMsg('Por favor, selecciona un archivo de imagen válido (JPG, PNG, WEBP).');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    
    // Add to uploaded photos list and update preview side-by-side
    niaUploadedPhotos.push({ dataUrl, mimeType: file.type || 'image/jpeg' });
    niaRenderPhotosPreview();

    const base64Data = dataUrl.split(',')[1];
    const mimeType = file.type || 'image/jpeg';
    niaAnalyzeExtraPhoto(base64Data, mimeType);
  };
  reader.readAsDataURL(file);
}

async function niaAnalyzeExtraPhoto(base64Data, mimeType) {
  const loading = document.getElementById('nia-extra-loading-block');
  const photoBlock = document.getElementById('nia-extra-photo-block');
  if (loading) loading.classList.remove('hidden');
  if (photoBlock) photoBlock.classList.add('hidden');

  const prompt = `Sos un nutricionista clínico experto. El usuario ha tomado una fotografía de un postre, café, té o elemento agregado a su comida principal.
Identificá los alimentos y componentes visibles en esta fotografía agregada.
Estimá el peso en gramos (weight_g) de cada ingrediente según proporciones típicas.

Respondé ÚNICAMENTE con un objeto JSON válido con el siguiente formato, sin bloques de código markdown, sin texto adicional:
{
  "quality": "good",
  "ingredients": [
    {
      "name": "nombre del ingrediente en español",
      "weight_g": 100,
      "emoji": "🧁"
    }
  ]
}`;

  try {
    let text = '';
    try {
      const resp = await fetch(getBackendApiUrl('/api/ai-completion'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          base64Image: base64Data,
          mimeType: mimeType
        })
      });
      if (resp.ok) {
        const apiData = await resp.json();
        text = apiData.text || '';
      } else {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || `Backend status: ${resp.status}`);
      }
    } catch (backendErr) {
      if (!niaIsCustomGeminiKeyConfigured()) {
        throw backendErr;
      }
      const apiKey = localStorage.getItem('niaGeminiKey');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const body = {
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType, data: base64Data } }
          ]
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
      };

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!resp.ok) throw new Error(`API error ${resp.status}`);
      const data = await resp.json();
      text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Respuesta no contiene JSON');
    const result = niaParseSafeJSON(jsonMatch[0]);

    if (result.ingredients && result.ingredients.length > 0) {
      const container = document.getElementById('nia-edit-list-container');
      if (container) {
        result.ingredients.forEach(item => {
          container.appendChild(niaCreateEditIngredientRowHTML(item.name, item.weight_g, item.emoji || '🍽️'));
        });
      }
      showMsg(`✅ Agregado(s) incorporado(s) exitosamente.`);
    } else {
      showMsg('⚠️ No se pudieron identificar ingredientes del agregado.');
    }
    // Volver a preguntar si hay otro ingrediente o foto
    niaOpenAddExtraFlow();
  } catch (err) {
    console.error('Error al analizar agregado:', err);
    showMsg('Fallo al analizar el agregado: ' + err.message);
    if (loading) loading.classList.add('hidden');
    if (photoBlock) photoBlock.classList.remove('hidden');
  }
}

async function niaAnalyzeExtraText() {
  const textDesc = document.getElementById('nia-extra-text-description');
  const textValue = textDesc ? textDesc.value.trim() : '';
  if (!textValue) {
    showMsg('Por favor escribe una descripción del agregado.');
    return;
  }

  const loading = document.getElementById('nia-extra-loading-block');
  const textBlock = document.getElementById('nia-extra-text-block');
  if (loading) loading.classList.remove('hidden');
  if (textBlock) textBlock.classList.add('hidden');

  const prompt = `Sos un nutricionista clínico experto. El usuario ha descrito un postre, café, té o elemento agregado a su comida principal:
"${textValue}"

Identificá los ingredientes y componentes del elemento agregado.
Estimá el peso en gramos (weight_g) de cada ingrediente según proporciones típicas o los gramos sugeridos.

Respondé ÚNICAMENTE con un objeto JSON válido con el siguiente formato, sin bloques de código markdown, sin texto adicional:
{
  "quality": "good",
  "ingredients": [
    {
      "name": "nombre del ingrediente en español",
      "weight_g": 100,
      "emoji": "🧁"
    }
  ]
}`;

  try {
    let text = '';
    try {
      const resp = await fetch(getBackendApiUrl('/api/ai-completion'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt
        })
      });
      if (resp.ok) {
        const apiData = await resp.json();
        text = apiData.text || '';
      } else {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || `Backend status: ${resp.status}`);
      }
    } catch (backendErr) {
      if (!niaIsCustomGeminiKeyConfigured()) {
        throw backendErr;
      }
      const apiKey = localStorage.getItem('niaGeminiKey');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const body = {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
      };

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!resp.ok) throw new Error(`API error ${resp.status}`);
      const data = await resp.json();
      text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Respuesta no contiene JSON');
    const result = niaParseSafeJSON(jsonMatch[0]);

    if (result.ingredients && result.ingredients.length > 0) {
      const container = document.getElementById('nia-edit-list-container');
      if (container) {
        result.ingredients.forEach(item => {
          container.appendChild(niaCreateEditIngredientRowHTML(item.name, item.weight_g, item.emoji || '🍽️'));
        });
      }
      showMsg(`✅ Agregado(s) incorporado(s) exitosamente.`);
    } else {
      showMsg('⚠️ No se pudieron identificar ingredientes del agregado.');
    }
    // Volver a preguntar si hay otro ingrediente o foto
    niaOpenAddExtraFlow();
  } catch (err) {
    console.error('Error al analizar agregado:', err);
    showMsg('Fallo al analizar el agregado: ' + err.message);
    if (loading) loading.classList.add('hidden');
    if (textBlock) textBlock.classList.remove('hidden');
  }
}

function niaRenderPhotosPreview() {
  const container = document.getElementById('photo-preview-container');
  if (!container) return;

  if (niaUploadedPhotos.length === 0) {
    container.innerHTML = `
      <img id="photo-preview-img" src="" alt="Vista previa de comida" />
      <button type="button" id="remove-photo-btn" class="remove-photo-btn" onclick="niaRemovePhoto(event)">×</button>
    `;
    return;
  }

  if (niaUploadedPhotos.length === 1) {
    container.innerHTML = `
      <img id="photo-preview-img" src="${niaUploadedPhotos[0].dataUrl}" alt="Vista previa de comida" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" />
      <button type="button" id="remove-photo-btn" class="remove-photo-btn" onclick="niaRemovePhoto(event)">×</button>
    `;
  } else if (niaUploadedPhotos.length === 2) {
    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; height: 100%; padding: 12px; box-sizing: border-box; background: rgba(0,0,0,0.03);">
        <div style="flex: 1; height: 100%; border-radius: 8px; overflow: hidden; border: 1.5px solid rgba(200,29,58,0.15); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <img src="${niaUploadedPhotos[0].dataUrl}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" />
        </div>
        <span style="font-size: 2.2rem; font-weight: 700; color: var(--green); text-shadow: 0 1px 2px rgba(0,0,0,0.1); margin: 0 4px; z-index: 15;">+</span>
        <div style="flex: 1; height: 100%; border-radius: 8px; overflow: hidden; border: 1.5px solid rgba(200,29,58,0.15); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <img src="${niaUploadedPhotos[1].dataUrl}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" />
        </div>
      </div>
      <button type="button" id="remove-photo-btn" class="remove-photo-btn" onclick="niaRemovePhoto(event)">×</button>
    `;
  } else {
    // 3 or more photos
    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 100%; padding: 8px; box-sizing: border-box; background: rgba(0,0,0,0.03);">
        <div style="flex: 1; height: 100%; border-radius: 8px; overflow: hidden; border: 1.5px solid rgba(200,29,58,0.15); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <img src="${niaUploadedPhotos[0].dataUrl}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" />
        </div>
        <span style="font-size: 1.6rem; font-weight: 700; color: var(--green); text-shadow: 0 1px 2px rgba(0,0,0,0.1); z-index: 15;">+</span>
        <div style="flex: 1; height: 100%; border-radius: 8px; overflow: hidden; border: 1.5px solid rgba(200,29,58,0.15); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <img src="${niaUploadedPhotos[1].dataUrl}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" />
        </div>
        <span style="font-size: 1.6rem; font-weight: 700; color: var(--green); text-shadow: 0 1px 2px rgba(0,0,0,0.1); z-index: 15;">+</span>
        <div style="flex: 1; height: 100%; border-radius: 8px; overflow: hidden; border: 1.5px solid rgba(200,29,58,0.15); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <img src="${niaUploadedPhotos[2].dataUrl}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" />
        </div>
      </div>
      <button type="button" id="remove-photo-btn" class="remove-photo-btn" onclick="niaRemovePhoto(event)">×</button>
    `;
  }
}

// ===== INTEGRACIÓN DE APPS Y SMARTWATCHES =====
async function connectApp(appName, btn) {
  // Plan Básico check: Always redirect to premium upgrade dialog
  if (typeof openPremiumModal === 'function') {
    openPremiumModal(appName, btn);
    return;
  }

  const appLabels = {
    garmin: 'Garmin Connect', apple: 'Apple Health', google: 'Google Fit',
    fitbit: 'Fitbit', strava: 'Strava', polar: 'Polar Flow',
    samsung: 'Samsung Health', suunto: 'Suunto'
  };

  const isNative = typeof window !== 'undefined' && (window.cordova || window.Capacitor);

  if (isNative && (appName === 'apple' || appName === 'google' || appName === 'samsung')) {
    btn.textContent = 'Solicitando...';
    btn.disabled = true;

    if (!navigator.health) {
      btn.textContent = 'No disponible';
      showMsg('❌ Error: El plugin de salud no está cargado.');
      btn.disabled = false;
      return;
    }

    navigator.health.isAvailable(() => {
      // Solicitar permisos de lectura
      const dataTypes = ['steps', 'calories.active', 'distance', 'heart_rate', 'sleep'];
      navigator.health.requestAuthorization(dataTypes, async () => {
        btn.textContent = '✓ Conectado';
        btn.classList.add('connected');
        btn.disabled = true;
        showMsg(`✅ Sincronizado con ${appLabels[appName]}`);
        await importRealHealthData(appName);
      }, (err) => {
        console.error("Permiso denegado", err);
        btn.textContent = 'Conectar';
        btn.disabled = false;
        showMsg('❌ Permiso de salud denegado.');
      });
    }, (err) => {
      console.error("Servicio de salud no disponible", err);
      btn.textContent = 'No disponible';
      showMsg('❌ Las funciones de salud no están disponibles en este dispositivo.');
    });
  } else {
    // Si se trata de Garmin/Fitbit etc. en nativo, recordar que se sincronizan por el agregador
    if (isNative && appName !== 'apple' && appName !== 'google' && appName !== 'samsung') {
      showMsg(`ℹ️ Sincronizá tu reloj ${appLabels[appName]} con la app de Salud (Apple Health o Google Fit) y luego conéctala desde aquí.`);
      return;
    }

    // Simulación en PWA (Web)
    btn.textContent = 'Conectando...';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = '✓ Conectado';
      btn.classList.add('connected');
      btn.disabled = true;
      showMsg(`✅ ${appLabels[appName]} (Simulación PWA) conectado`);
      setTimeout(() => importSimulatedData(appName), 800);
    }, 1800);
  }
}

async function importRealHealthData(source) {
  const sourceLabels = {
    apple: 'Apple Health',
    google: 'Google Fit',
    samsung: 'Samsung Health'
  };

  const todayMidnight = new Date();
  todayMidnight.setHours(0,0,0,0);
  const now = new Date();

  showMsg('📊 Consultando métricas en tu dispositivo...');

  try {
    // 1. Pasos (Aggregated)
    const steps = await new Promise((resolve) => {
      navigator.health.queryAggregated({
        startDate: todayMidnight,
        endDate: now,
        dataType: 'steps',
        bucket: 'day'
      }, (res) => {
        if (res && res.length > 0) resolve(res[0].value || 0);
        else resolve(0);
      }, () => resolve(0));
    });

    // 2. Calorías Activas (Aggregated)
    const kcal = await new Promise((resolve) => {
      navigator.health.queryAggregated({
        startDate: todayMidnight,
        endDate: now,
        dataType: 'calories.active',
        bucket: 'day'
      }, (res) => {
        if (res && res.length > 0) resolve(Math.round(res[0].value || 0));
        else resolve(0);
      }, () => resolve(0));
    });

    // 3. Distancia (Aggregated) en metros -> pasar a km
    const distMeters = await new Promise((resolve) => {
      navigator.health.queryAggregated({
        startDate: todayMidnight,
        endDate: now,
        dataType: 'distance',
        bucket: 'day'
      }, (res) => {
        if (res && res.length > 0) resolve(res[0].value || 0);
        else resolve(0);
      }, () => resolve(0));
    });
    const dist = distMeters > 0 ? parseFloat((distMeters / 1000).toFixed(2)) : 0;

    // 4. Ritmo Cardíaco (Últimas 100 mediciones de hoy, promedio)
    const hr = await new Promise((resolve) => {
      navigator.health.query({
        startDate: todayMidnight,
        endDate: now,
        dataType: 'heart_rate',
        limit: 100
      }, (res) => {
        if (res && res.length > 0) {
          let sum = 0;
          res.forEach(item => sum += item.value);
          resolve(Math.round(sum / res.length));
        } else resolve(null);
      }, () => resolve(null));
    });

    // 5. Sueño (Query de las últimas 24hs)
    const yesterdayMidnight = new Date();
    yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1);
    yesterdayMidnight.setHours(18, 0, 0, 0); // Desde las 6pm de ayer

    const sleep = await new Promise((resolve) => {
      navigator.health.query({
        startDate: yesterdayMidnight,
        endDate: now,
        dataType: 'sleep',
        limit: 50
      }, (res) => {
        if (res && res.length > 0) {
          let totalSleepMs = 0;
          res.forEach(item => {
            if (item.startDate && item.endDate) {
              totalSleepMs += (new Date(item.endDate) - new Date(item.startDate));
            }
          });
          const hours = (totalSleepMs / (1000 * 60 * 60));
          resolve(hours > 0 ? parseFloat(hours.toFixed(1)) : null);
        } else resolve(null);
      }, () => resolve(null));
    });

    const today = new Date();
    const entry = {
      id: Date.now(),
      date: today.toLocaleDateString('es-AR'),
      time: today.toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' }),
      steps: steps > 0 ? steps : null,
      kcal: kcal > 0 ? kcal : null,
      dist: dist > 0 ? dist : null,
      duration: null,
      hr: hr,
      elevation: null,
      sleep: sleep,
      water: null,
      source: sourceLabels[source] || source
    };

    if (entry.steps || entry.kcal || entry.hr || entry.sleep) {
      metrics.unshift(entry);
      localStorage.setItem('nutriMetrics', JSON.stringify(metrics));
      renderMetricsHistory();
      if (typeof checkAchievements === 'function') checkAchievements();
      showMsg(`📊 Datos reales de ${sourceLabels[source]} cargados.`);
    } else {
      showMsg('⚠️ No se encontraron métricas hoy en tu app de salud.');
    }
  } catch (err) {
    console.error("Error al importar datos reales", err);
    showMsg('❌ Error al importar datos reales.');
  }
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
  if (typeof checkAchievements === 'function') checkAchievements();
  showMsg(`📊 Datos de ${sourceLabels[source]} importados (PWA)`);
}

function niaUpdateStepsProgressBar(val) {
  const steps = parseInt(val) || 0;
  const max = 10000;
  const pct = Math.min(Math.max((steps / max) * 100, 0), 100);
  const fill = document.getElementById('steps-progress-bar-fill');
  const runner = document.getElementById('steps-progress-runner');
  const display = document.getElementById('metric-steps-val-display');
  
  if (fill) fill.style.width = `${pct}%`;
  if (runner) runner.style.left = `${pct}%`;
  if (display) display.textContent = `${steps.toLocaleString('es-AR')} / 10.000 pasos`;
}
window.niaUpdateStepsProgressBar = niaUpdateStepsProgressBar;

function saveMetrics() {
  const dateEl = document.getElementById('metric-date');
  const timeEl = document.getElementById('metric-time');
  const activityType = document.getElementById('metric-activity-type')?.value || 'gimnasia';
  const duration = document.getElementById('metric-duration-preset')?.value || 45;
  const intensity = document.getElementById('metric-intensity')?.value || 'medio';
  const steps = document.getElementById('metric-steps')?.value;
  const dist = document.getElementById('metric-dist')?.value;

  if (!steps && !duration && !activityType) {
    showMsg('Completá al menos un campo de actividad o pasos 📅');
    return;
  }

  const actNames = {
    gimnasia: '🏋️ Gimnasia / Musculación', deporte: '⚽ Deporte en Equipo', crossfit: '💪 CrossFit / Funcional',
    natacion: '🏊 Natación', running: '🏃 Running', caminata: '🚶 Caminata', ciclismo: '🚴 Ciclismo',
    pilates: '🌀 Pilates', yoga: '🧘 Yoga / Stretching', tenis: '🎾 Tenis / Pádel', boxeo: '🥊 Boxeo',
    baile: '💃 Baile / Zumba', otro: '🏅 Deporte'
  };

  const intLabels = { liviano: '🟢 Liviano', medio: '🟡 Medio', intenso: '🔴 Intenso' };

  // MET table for calories estimation based on activity and intensity
  const metMap = {
    gimnasia: { liviano: 4, medio: 6, intenso: 8 },
    deporte: { liviano: 5, medio: 7, intenso: 9 },
    crossfit: { liviano: 6, medio: 8, intenso: 10 },
    natacion: { liviano: 5, medio: 7, intenso: 9 },
    running: { liviano: 7, medio: 9, intenso: 11 },
    caminata: { liviano: 3, medio: 4.5, intenso: 6 },
    ciclismo: { liviano: 4, medio: 7, intenso: 9 },
    pilates: { liviano: 3, medio: 4, intenso: 5 },
    yoga: { liviano: 2.5, medio: 3.5, intenso: 4.5 },
    tenis: { liviano: 5, medio: 7, intenso: 9 },
    boxeo: { liviano: 6, medio: 8, intenso: 10 },
    baile: { liviano: 4, medio: 6, intenso: 8 },
    otro: { liviano: 4, medio: 6, intenso: 8 }
  };

  const userWeight = (window.profile && window.profile.weight) ? window.profile.weight : 70;
  const met = (metMap[activityType] || {})[intensity] || 6;
  const durMin = parseInt(duration) || 45;
  const kcalEstimated = Math.round(met * userWeight * (durMin / 60));

  const entry = {
    id: Date.now(),
    date: dateEl?.value ? new Date(dateEl.value + 'T12:00:00').toLocaleDateString('es-AR') : new Date().toLocaleDateString('es-AR'),
    time: timeEl?.value || new Date().toLocaleTimeString('es-AR', {hour:'2-digit',minute:'2-digit'}),
    activity: actNames[activityType] || activityType,
    steps: steps ? parseInt(steps) : null,
    kcal: kcalEstimated,
    dist: dist ? parseFloat(dist) : null,
    duration: durMin,
    intensity: intLabels[intensity] || intensity,
    source: 'Manual / Voz'
  };

  metrics.unshift(entry);
  localStorage.setItem('nutriMetrics', JSON.stringify(metrics));

  // Also log into activities list so it updates Dashboard & Weekly Summary
  const newAct = {
    id: entry.id,
    type: activityType === 'gimnasia' ? 'pesas' : (activityType === 'running' ? 'correr' : activityType),
    dur: durMin,
    duration: durMin,
    intensity: intensity === 'liviano' ? 'baja' : (intensity === 'intenso' ? 'alta' : 'moderada'),
    time: entry.time,
    mode: 'gym',
    kcal: kcalEstimated,
    date: new Date().toDateString()
  };
  if (Array.isArray(window.activities)) {
    window.activities.push(newAct);
    localStorage.setItem('nutriActivities', JSON.stringify(window.activities));
  }

  // Reset steps
  const stepsInput = document.getElementById('metric-steps');
  if (stepsInput) {
    stepsInput.value = '';
    niaUpdateStepsProgressBar(0);
  }
  const distInput = document.getElementById('metric-dist');
  if (distInput) distInput.value = '';

  renderMetricsHistory();
  if (typeof updateActivityPage === 'function') updateActivityPage();
  if (typeof updateDashboard === 'function') updateDashboard();
  showMsg(`✅ Métricas de ${actNames[activityType] || 'actividad'} guardadas correctamente (~${kcalEstimated} kcal)`);
}

function renderMetricsHistory() {
  const container = document.getElementById('metrics-history');
  if (!container) return;
  if (metrics.length === 0) {
    container.innerHTML = '<p class="empty-note">Cargá tus datos manualmente o por voz para actualizar este campo</p>';
    return;
  }
  container.innerHTML = metrics.slice(0, 10).map(m => `
    <div class="metric-entry glass-card">
      <div class="metric-entry-header">
        <span class="metric-source-badge">${m.source || 'Manual'}</span>
        <span class="metric-datetime">${m.date} ${m.time}</span>
        <button class="supp-delete" onclick="deleteMetric(${m.id})" title="Eliminar">🗑</button>
      </div>
      <div class="metric-chips">
        ${m.activity ? `<div class="metric-chip"><span class="mc-val">${m.activity}</span></div>` : ''}
        ${m.steps ? `<div class="metric-chip"><span class="mc-icon">🏃</span><span class="mc-val">${m.steps.toLocaleString('es-AR')}</span><span class="mc-lbl">pasos</span></div>` : ''}
        ${m.duration ? `<div class="metric-chip"><span class="mc-icon">⏱️</span><span class="mc-val">${m.duration} min</span></div>` : ''}
        ${m.intensity ? `<div class="metric-chip"><span class="mc-val">${m.intensity}</span></div>` : ''}
        ${m.kcal ? `<div class="metric-chip"><span class="mc-icon">🔥</span><span class="mc-val">${m.kcal}</span><span class="mc-lbl">kcal</span></div>` : ''}
        ${m.dist ? `<div class="metric-chip"><span class="mc-icon">📍</span><span class="mc-val">${m.dist} km</span></div>` : ''}
      </div>
    </div>
  `).join('');
}

function deleteMetric(id) {
  metrics = metrics.filter(m => m.id !== id);
  localStorage.setItem('nutriMetrics', JSON.stringify(metrics));
  renderMetricsHistory();
}

// Window bindings for HTML inline onclick handlers
window.finishOnboarding = finishOnboarding;
window.goToPersonalization = goToPersonalization;
window.goToSlide = goToSlide;
window.nextOnbStep = nextOnbStep;
window.nextSlide = nextSlide;
window.niaEditProfileFromOnboarding = niaEditProfileFromOnboarding;
window.requestCameraPermission = requestCameraPermission;
window.requestNotificationPermission = requestNotificationPermission;
window.resetApp = resetApp;
window.toggleGoalMultiple = toggleGoalMultiple;
window.validateStep2 = validateStep2;
window.validateStep3 = validateStep3;
window.toggleClinicalItem = toggleClinicalItem;
window.startNewUserExperience = startNewUserExperience;
window.niaSelectMealDay = niaSelectMealDay;
window.niaCancelMealsFlow = niaCancelMealsFlow;
window.niaCancelExtraFlow = niaCancelExtraFlow;
window.niaOpenAddExtraFlow = niaOpenAddExtraFlow;
window.niaAddToLog = niaAddToLog;
window.niaAddEditIngredientRow = niaAddEditIngredientRow;
window.niaSubmitConfirmedIngredients = niaSubmitConfirmedIngredients;
window.niaExtraSelectHasPhoto = niaExtraSelectHasPhoto;
window.niaAnalyzeExtraText = niaAnalyzeExtraText;
window.niaRemovePhoto = niaRemovePhoto;
window.niaShowCalendarSelector = niaShowCalendarSelector;
window.niaHideCalendarSelector = niaHideCalendarSelector;
window.niaStartFlow = niaStartFlow;
window.niaSaveSheetsConfig = niaSaveSheetsConfig;
window.niaToggleSheetsHelp = niaToggleSheetsHelp;
window.niaCopyAppsScriptCode = niaCopyAppsScriptCode;
window.niaDownloadPDFReport = niaDownloadPDFReport;
window.showScreen = showScreen;
window.connectApp = connectApp;
window.saveMetrics = saveMetrics;

// ===== ONBOARDING SUMMARY & PLAN FUNCTIONS =====
function showOnboardingSummary() {
    const calEl = document.getElementById('onb-sum-calories');
    const protEl = document.getElementById('onb-sum-protein');
    const carbEl = document.getElementById('onb-sum-carbs');
    const fatEl = document.getElementById('onb-sum-fats');
    
    if (calEl) calEl.textContent = profile.targetCals || '--';
    if (protEl) protEl.textContent = profile.prot || '--';
    if (carbEl) carbEl.textContent = profile.carb || '--';
    if (fatEl) fatEl.textContent = profile.fat || '--';
    
    // Hide progress bar and all steps
    document.querySelectorAll('.onb-step').forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
    });
    
    // Show step 6 by adding active and removing hidden
    const step6 = document.getElementById('onb-step-6');
    if (step6) {
        step6.classList.remove('hidden');
        step6.classList.add('active');
    }
    
    const progressContainer = document.getElementById('onb-progress-container');
    if (progressContainer) progressContainer.classList.add('hidden');
}

function finishOnboardingAndNavigate(targetTab) {
    const activeBtn = document.activeElement;
    if (activeBtn && activeBtn.tagName === 'BUTTON') {
        activeBtn.disabled = true;
        activeBtn.innerHTML = '⌛ Cargando tu plan...';
    }

    localStorage.setItem('niaFirstTimeTour', 'true');
    localStorage.setItem('nutriProfile', JSON.stringify(profile));
    localStorage.removeItem('niaDailyPhotosCount');
    
    // Sincronizar automáticamente con Supabase si el usuario está autenticado
    if (typeof niaSyncLocalToCloud === 'function' && localStorage.getItem('niaSaasToken')) {
        niaSyncLocalToCloud();
    }

    if (targetTab === 'hidratacion') {
        localStorage.setItem('niaScrollToHydration', 'true');
        targetTab = 'comidas';
    }
    localStorage.setItem('niaFinishRedirect', targetTab);

    setTimeout(() => {
        initApp();
        if (activeBtn && activeBtn.tagName === 'BUTTON') {
            activeBtn.disabled = false;
        }
    }, 100);
}

// ===== PERSISTENT DAILY PROGRESS BAR =====
function updateDailyProgressBar() {
    const today = new Date().toDateString();
    
    // 1. Calculate meals progress (25% per meal, max 50%)
    const mealsToday = Array.isArray(meals) ? meals.filter(m => m.date === today).length : 0;
    const mealsProgress = Math.min(2, mealsToday) * 25;
    
    // 2. Calculate activities progress (25% per activity, max 25%)
    const activitiesToday = Array.isArray(activities) ? activities.filter(a => a.date === today).length : 0;
    const activitiesProgress = Math.min(1, activitiesToday) * 25;
    
    // 3. Calculate hydration progress (25% per logging, max 25%)
    let waterTodayCount = 0;
    try {
        const getTodayStr = () => new Date().toISOString().split('T')[0];
        let hydrationLog = [];
        const hl = localStorage.getItem('nutriHydrationLog');
        if (hl) hydrationLog = JSON.parse(hl);
        waterTodayCount = Array.isArray(hydrationLog) ? hydrationLog.filter(h => h.date === getTodayStr()).length : 0;
    } catch (e) {
        console.warn('Error reading hydration logs for progress:', e);
    }
    const hydrationProgress = Math.min(1, waterTodayCount) * 25;
    
    // Total progress
    const totalProgress = Math.min(100, mealsProgress + activitiesProgress + hydrationProgress);
    
    // Update elements
    const fillEl = document.getElementById('header-progress-fill');
    const valEl = document.getElementById('header-progress-val');
    
    if (fillEl) fillEl.style.width = `${totalProgress}%`;
    if (valEl) valEl.textContent = `${totalProgress}%`;
}

window.showOnboardingSummary = showOnboardingSummary;
window.finishOnboardingAndNavigate = finishOnboardingAndNavigate;
window.updateDailyProgressBar = updateDailyProgressBar;

// ============================================================
// COMPONENTE DE CARGA POR VOZ (3 BOTONES DE MICRÓFONO REUTILIZABLE)
// ============================================================
window.voiceState = {
  type: 'food', // 'food', 'wearable', 'assistant'
  status: 'idle', // 'idle', 'recording', 'processing', 'confirm', 'error'
  mediaRecorder: null,
  audioChunks: [],
  timerInterval: null,
  seconds: 0,
  pendingData: null,
  sourceTranscript: ''
};

let voiceRecognitionObj = null;

function openVoiceRecorder(type = 'food') {
  window.voiceState.type = type;
  window.voiceState.pendingData = null;
  window.voiceState.sourceTranscript = '';
  
  const modal = document.getElementById('voice-recorder-modal');
  const iconEl = document.getElementById('voice-modal-icon');
  const titleEl = document.getElementById('voice-modal-title');
  const subEl = document.getElementById('voice-modal-subtitle');
  
  if (type === 'food') {
    if (iconEl) iconEl.textContent = '🍽️';
    if (titleEl) titleEl.textContent = 'Registrar Comidas y Bebidas por Voz';
    if (subEl) subEl.textContent = 'Dictá lo que comiste o tomaste (ej: "Almorcé 200g de pechuga de pollo con ensalada y un vaso de agua")';
  } else if (type === 'wearable') {
    if (iconEl) iconEl.textContent = '⌚';
    if (titleEl) titleEl.textContent = 'Registrar Métricas Deportivas por Voz';
    if (subEl) subEl.textContent = 'Dictá tus ejercicios o lecturas (ej: "Corrí 5 km en 25 minutos con 145 bpm de pulso")';
  } else if (type === 'assistant') {
    if (iconEl) iconEl.textContent = '🎙️';
    if (titleEl) titleEl.textContent = 'Consultar a Nutri por Voz';
    if (subEl) subEl.textContent = 'Dictá tu duda sobre nutrición, alimentación, entrenamiento o recuperación.';
  }

  resetVoiceState();
  if (modal) modal.classList.remove('hidden');
}

function closeVoiceRecorder() {
  stopVoiceRecording();
  const modal = document.getElementById('voice-recorder-modal');
  if (modal) modal.classList.add('hidden');
}

function resetVoiceState() {
  stopVoiceRecording();
  window.voiceState.status = 'idle';
  window.voiceState.seconds = 0;
  window.voiceState.audioChunks = [];
  
  const timerEl = document.getElementById('voice-recording-timer');
  if (timerEl) {
    timerEl.textContent = '00:00';
    timerEl.classList.add('hidden');
  }

  document.getElementById('voice-wave-container')?.classList.add('hidden');

  const badge = document.getElementById('voice-mic-status-badge');
  if (badge) {
    badge.textContent = 'Tocá para hablar';
    badge.style.color = 'var(--green)';
    badge.style.background = 'rgba(34,197,94,0.15)';
    badge.style.borderColor = 'rgba(34,197,94,0.3)';
  }

  const btn = document.getElementById('voice-mic-main-btn');
  if (btn) btn.style.transform = 'scale(1)';

  const panels = ['idle', 'processing', 'confirm', 'error'];
  panels.forEach(p => {
    const el = document.getElementById(`voice-state-${p}`);
    if (el) el.classList.add('hidden');
  });
  document.getElementById('voice-state-idle')?.classList.remove('hidden');

  const manualInp = document.getElementById('voice-manual-text-input');
  if (manualInp) {
    manualInp.value = '';
    if (!manualInp.hasAttribute('data-bound')) {
      manualInp.setAttribute('data-bound', 'true');
      manualInp.addEventListener('input', (e) => {
        const detected = detectMealTypeFromText(e.target.value);
        if (detected) {
          window.voiceState.detectedMealType = detected;
          niaUpdateVoiceMealTypeBadge(detected);
        }
      });
    }
  }
  window.voiceState.detectedMealType = null;
  niaUpdateVoiceMealTypeBadge(null);
}

function toggleVoiceRecording() {
  if (window.voiceState.status === 'recording') {
    stopVoiceRecording();
  } else {
    startVoiceRecording();
  }
}

function startVoiceRecording() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  window.voiceState.status = 'recording';
  document.getElementById('voice-wave-container')?.classList.remove('hidden');
  document.getElementById('voice-recording-timer')?.classList.remove('hidden');

  const badge = document.getElementById('voice-mic-status-badge');
  if (badge) {
    badge.textContent = '🔴 Escuchando... Tocá para detener';
    badge.style.color = '#ef4444';
    badge.style.background = 'rgba(239, 68, 68, 0.15)';
    badge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
  }

  const btn = document.getElementById('voice-mic-main-btn');
  if (btn) btn.style.transform = 'scale(1.1)';

  // 1. Web Speech API para Transcripción de Voz en Tiempo Real
  if (SpeechRecognition) {
    try {
      if (voiceRecognitionObj) {
        try { voiceRecognitionObj.stop(); } catch(e){}
      }
      voiceRecognitionObj = new SpeechRecognition();
      voiceRecognitionObj.continuous = true;
      voiceRecognitionObj.interimResults = true;
      voiceRecognitionObj.lang = 'es-AR';

      voiceRecognitionObj.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        const textInp = document.getElementById('voice-manual-text-input');
        if (textInp) {
          textInp.value = currentTranscript;
          const detected = detectMealTypeFromText(currentTranscript);
          if (detected) {
            window.voiceState.detectedMealType = detected;
            niaUpdateVoiceMealTypeBadge(detected);
          }
        }
      };

      voiceRecognitionObj.onerror = (event) => {
        console.warn('SpeechRecognition warning:', event.error);
      };

      voiceRecognitionObj.start();
    } catch (e) {
      console.warn('Web Speech API SpeechRecognition fallback:', e);
    }
  }

  // 2. Captura de Stream de Audio MediaRecorder
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      window.voiceState.audioChunks = [];
      let options = {};
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/webm';
      }
      const recorder = new MediaRecorder(stream, options);
      window.voiceState.mediaRecorder = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) window.voiceState.audioChunks.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start(250);
    }).catch(err => {
      console.warn('Mic audio stream permission warning:', err);
    });
  }

  // Contador de tiempo de grabación
  window.voiceState.seconds = 0;
  if (window.voiceState.timerInterval) clearInterval(window.voiceState.timerInterval);
  window.voiceState.timerInterval = setInterval(() => {
    window.voiceState.seconds++;
    const secs = window.voiceState.seconds;
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    const timerEl = document.getElementById('voice-recording-timer');
    if (timerEl) timerEl.textContent = `${m}:${s}`;
    if (secs >= 60) stopVoiceRecording();
  }, 1000);
}

function stopVoiceRecording() {
  if (window.voiceState.timerInterval) clearInterval(window.voiceState.timerInterval);
  if (voiceRecognitionObj) {
    try { voiceRecognitionObj.stop(); } catch(e){}
  }
  if (window.voiceState.mediaRecorder && window.voiceState.mediaRecorder.state === 'recording') {
    try { window.voiceState.mediaRecorder.stop(); } catch(e){}
  }

  window.voiceState.status = 'idle';
  document.getElementById('voice-wave-container')?.classList.add('hidden');
  
  const badge = document.getElementById('voice-mic-status-badge');
  if (badge) {
    badge.textContent = '✅ Dictado listo. Podés revisar o editar el texto abajo.';
    badge.style.color = 'var(--green)';
    badge.style.background = 'rgba(34,197,94,0.15)';
    badge.style.borderColor = 'rgba(34,197,94,0.3)';
  }

  const btn = document.getElementById('voice-mic-main-btn');
  if (btn) btn.style.transform = 'scale(1)';
}

function submitVoiceTextManual() {
  stopVoiceRecording();
  const inp = document.getElementById('voice-manual-text-input');
  const text = inp ? inp.value.trim() : '';

  // Si hay texto transcrito por Web Speech API, lo usamos directamente
  if (text) {
    sendVoiceAudioToBackend(null, null, text);
    return;
  }

  // Si no hay texto, verificamos si tenemos audio grabado en audioChunks
  if (window.voiceState.audioChunks && window.voiceState.audioChunks.length > 0) {
    showMsg('Procesando audio grabado...');
    const mimeType = window.voiceState.mediaRecorder?.mimeType || 'audio/webm';
    const audioBlob = new Blob(window.voiceState.audioChunks, { type: mimeType });
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result.split(',')[1];
      sendVoiceAudioToBackend(base64data, mimeType, null);
    };
    reader.readAsDataURL(audioBlob);
  } else {
    showMsg('Por favor dictá o escribí un texto antes de procesar.');
  }
}

async function sendVoiceAudioToBackend(base64Audio, mimeType, textTranscript = null) {
  window.voiceState.status = 'processing';
  
  document.getElementById('voice-state-recording')?.classList.add('hidden');
  document.getElementById('voice-state-idle')?.classList.add('hidden');
  document.getElementById('voice-state-processing')?.classList.remove('hidden');

  const token = localStorage.getItem('niaSaasToken');
  const type = window.voiceState.type;
  const endpoint = getBackendApiUrl(`/api/voice/${type}`);

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        base64Audio,
        mimeType,
        textTranscript
      })
    });

    const data = await resp.json();
    if (!resp.ok || !data.success) {
      throw new Error(data.error || 'Fallo en la estructuración de voz por IA');
    }

    window.voiceState.sourceTranscript = data.source_transcript || textTranscript || 'Carga por voz';
    window.voiceState.pendingData = data;

    if (type === 'food') {
      renderVoiceFoodConfirmUI(data.items || []);
    } else if (type === 'wearable') {
      renderVoiceWearableConfirmUI(data.metrics || []);
    } else if (type === 'assistant') {
      handleVoiceAssistantResponse(data);
    }

  } catch (err) {
    console.warn(`⚠️ Backend voz /api/voice/${type} no disponible o 404 (${err.message}). Ejecutando fallback cliente directo con Gemini 2.0 Flash...`);
    try {
      const data = await processClientSideVoiceFallback(type, base64Audio, mimeType, textTranscript);
      window.voiceState.sourceTranscript = data.source_transcript || textTranscript || 'Carga por voz';
      window.voiceState.pendingData = data;

      if (type === 'food') {
        renderVoiceFoodConfirmUI(data.items || []);
      } else if (type === 'wearable') {
        renderVoiceWearableConfirmUI(data.metrics || []);
      } else if (type === 'assistant') {
        handleVoiceAssistantResponse(data);
      }
      return;
    } catch (fallbackErr) {
      console.error(`❌ Client voice fallback error for ${type}:`, fallbackErr);
      document.getElementById('voice-state-processing')?.classList.add('hidden');
      document.getElementById('voice-state-error')?.classList.remove('hidden');
      
      const errTxt = document.getElementById('voice-error-text');
      if (errTxt) errTxt.textContent = fallbackErr.message || 'Ocurrió un inconveniente al procesar la voz. Podés reintentar o cargar los datos manualmente.';
    }
  }
}

// Fallback cliente directo para procesamiento de voz cuando el backend no está disponible en servidores estáticos
async function processClientSideVoiceFallback(type, base64Audio, mimeType, textTranscript) {
  const apiKey = localStorage.getItem('niaGeminiKey') || (window.DEFAULT_CLIENT_GEMINI_KEY || 'AQ.Ab8RN6ItiqORVmWfguoQUvre7-9sEo7xTvB7pX1ubcpuPv0RQQ');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  let prompt = '';
  if (type === 'food') {
    prompt = `Sos un experto nutricionista clínico. Analizá este alimento descrito por voz/texto: "${textTranscript || 'Comida ingresada'}"
Identificá cada alimento y respondé ÚNICAMENTE con un array JSON de objetos con este formato exacto:
[
  {
    "food_name": "Nombre del alimento en español",
    "quantity": 1,
    "unit": "porción",
    "meal_type": "almuerzo",
    "calories": 250,
    "protein_g": 15,
    "carbs_g": 30,
    "fat_g": 8
  }
]`;
  } else if (type === 'wearable') {
    prompt = `Sos un analizador deportivo. Analizá estas métricas deportivas: "${textTranscript || 'Actividad física'}"
Respondé ÚNICAMENTE con un array JSON de objetos:
[
  {
    "metric_type": "pasos",
    "value": 5000,
    "unit": "pasos"
  }
]`;
  } else {
    prompt = `Sos Nutri, un asistente nutricional clínico inteligente de la aplicación. El usuario pregunta: "${textTranscript || 'Hola'}"
Respondé de manera empática, profesional, motivadora y muy breve (máximo 100 palabras) en español de Argentina con voseo sutil ("tenés", "podés").
Respondé ÚNICAMENTE con un objeto JSON válido:
{
  "user_message": "${textTranscript || ''}",
  "assistant_response": "Tu respuesta clínica aquí",
  "in_scope": true
}`;
  }

  let parts = [{ text: prompt }];
  if (base64Audio && mimeType) {
    parts.unshift({ inlineData: { mimeType, data: base64Audio } });
  }

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 2048 }
    })
  });

  if (!resp.ok) {
    throw new Error(`Gemini API Error ${resp.status}`);
  }

  const json = await resp.json();
  const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const jsonMatch = rawText.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
  const parsedJSON = niaParseSafeJSON(jsonMatch ? jsonMatch[0] : rawText);

  if (type === 'food') {
    const items = Array.isArray(parsedJSON) ? parsedJSON : (parsedJSON.items || [
      { food_name: textTranscript || 'Comida ingresada', quantity: 1, unit: 'porción', meal_type: 'almuerzo', calories: 200, protein_g: 10, carbs_g: 20, fat_g: 5 }
    ]);
    return { success: true, provider: 'gemini-2.0-flash-client', source_transcript: textTranscript || 'Carga por voz', items };
  } else if (type === 'wearable') {
    const metrics = Array.isArray(parsedJSON) ? parsedJSON : (parsedJSON.metrics || [
      { metric_type: 'actividad_fisica', value: 30, unit: 'min' }
    ]);
    return { success: true, provider: 'gemini-2.0-flash-client', source_transcript: textTranscript || 'Carga por voz', metrics };
  } else {
    return {
      success: true,
      provider: 'gemini-2.0-flash-client',
      user_message: textTranscript || '',
      assistant_response: parsedJSON.assistant_response || rawText || 'Hola, ¿en qué te puedo ayudar hoy con tu alimentación?',
      in_scope: parsedJSON.in_scope !== false
    };
  }
}

function detectMealTypeFromText(text) {
  if (!text) return null;
  const norm = String(text).toLowerCase();
  if (norm.match(/\b(desayuné|desayune|desayuno|desayunar|desayunando|mañana)\b/) || norm.includes('el desayuno') || norm.includes('de desayuno')) return 'desayuno';
  if (norm.match(/\b(almorcé|almorce|almuerzo|almorzar|almorzando|mediodía|mediodia)\b/) || norm.includes('el almuerzo') || norm.includes('de almuerzo')) return 'almuerzo';
  if (norm.match(/\b(merendé|merende|merienda|merendar|merendando|tarde)\b/) || norm.includes('la merienda') || norm.includes('de merienda')) return 'merienda';
  if (norm.match(/\b(cené|cene|cena|cenar|cenando|noche)\b/) || norm.includes('la cena') || norm.includes('de cena')) return 'cena';
  if (norm.match(/\b(snack|colación|colacion|tentempié|tentempie|picoteo)\b/) || norm.includes('media mañana') || norm.includes('media tarde')) return 'snack';
  return null;
}
window.detectMealTypeFromText = detectMealTypeFromText;

function niaUpdateVoiceMealTypeBadge(detected) {
  const badge = document.getElementById('voice-detected-meal-badge');
  if (!badge) return;
  const labels = {
    desayuno: '🌅 Desayuno detectado',
    almuerzo: '☀️ Almuerzo detectado',
    merienda: '🍎 Merienda detectada',
    cena: '🌙 Cena detectada',
    snack: '🥜 Colación detectada'
  };
  if (detected && labels[detected]) {
    badge.textContent = labels[detected];
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}
window.niaUpdateVoiceMealTypeBadge = niaUpdateVoiceMealTypeBadge;

let pendingDuplicateCallback = null;

function showDuplicateMealModal(mealTypeLabel, callback) {
  pendingDuplicateCallback = callback;
  const descEl = document.getElementById('duplicate-modal-desc');
  const titleEl = document.getElementById('duplicate-modal-title');
  if (titleEl) titleEl.textContent = `El ${mealTypeLabel} ya fue ingresado hoy`;
  if (descEl) {
    descEl.textContent = `Ya tenés un registro cargado de ${mealTypeLabel} para el día de hoy. ¿Querés agregar estos alimentos a tu registro o preferís cambiar a otro tipo de comida?`;
  }
  const modal = document.getElementById('duplicate-meal-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeDuplicateModal() {
  const modal = document.getElementById('duplicate-meal-modal');
  if (modal) modal.classList.add('hidden');
  pendingDuplicateCallback = null;
}

function confirmDuplicateSave(action) {
  const modal = document.getElementById('duplicate-meal-modal');
  if (modal) modal.classList.add('hidden');

  if (action === 'add' && typeof pendingDuplicateCallback === 'function') {
    const cb = pendingDuplicateCallback;
    pendingDuplicateCallback = null;
    cb();
  } else if (action === 'change') {
    pendingDuplicateCallback = null;
    showMsg('💡 Podés seleccionar otro tipo de comida (ej: Merienda, Cena o Colación) en el cuadro desplegable antes de guardar.');
  }
}
window.showDuplicateMealModal = showDuplicateMealModal;
window.closeDuplicateModal = closeDuplicateModal;
window.confirmDuplicateSave = confirmDuplicateSave;

function syncVoiceMealType(changedSelect) {
  const newVal = changedSelect.value;
  const allSelects = document.querySelectorAll('#voice-confirm-content .v-food-meal');
  allSelects.forEach(sel => {
    sel.value = newVal;
  });
}
window.syncVoiceMealType = syncVoiceMealType;

function renderVoiceFoodConfirmUI(items) {
  document.getElementById('voice-state-processing')?.classList.add('hidden');
  document.getElementById('voice-state-confirm')?.classList.remove('hidden');

  const container = document.getElementById('voice-confirm-content');
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = '<p style="font-size:0.8rem; color:var(--orange);">No se detectaron alimentos claros. Podés reintentar o agregar un ingrediente.</p>';
    return;
  }

  // Detectar tipo de comida a partir del texto o dictado
  const textInputVal = document.getElementById('voice-manual-text-input')?.value || '';
  const transcriptLower = ((window.voiceState.sourceTranscript || '') + ' ' + textInputVal).toLowerCase();
  
  const detectedMeal = detectMealTypeFromText(transcriptLower) || window.voiceState.detectedMealType || (items[0] && items[0].meal_type) || 'almuerzo';

  items.forEach(i => { i.meal_type = detectedMeal; });

  let html = `<div style="font-size:0.75rem; color:var(--cyan); margin-bottom:8px; font-weight:700;">Transcripción: "${window.voiceState.sourceTranscript || textInputVal}"</div>`;
  
  items.forEach((item, index) => {
    html += `
      <div class="voice-confirm-row" id="voice-food-row-${index}">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <input type="text" class="input-field v-food-name" value="${item.food_name}" style="font-weight:700; font-size:0.85rem; padding:4px 8px; margin:0; flex:2;" />
          <select class="input-field v-food-meal" onchange="syncVoiceMealType(this)" style="font-size:0.75rem; padding:4px; margin:0; flex:1; margin-left:4px;">
            <option value="desayuno" ${item.meal_type === 'desayuno' ? 'selected' : ''}>🌅 Desayuno</option>
            <option value="almuerzo" ${item.meal_type === 'almuerzo' ? 'selected' : ''}>☀️ Almuerzo</option>
            <option value="merienda" ${item.meal_type === 'merienda' ? 'selected' : ''}>🍎 Merienda</option>
            <option value="cena" ${item.meal_type === 'cena' ? 'selected' : ''}>🌙 Cena</option>
            <option value="snack" ${item.meal_type === 'snack' ? 'selected' : ''}>🥜 Snack</option>
          </select>
        </div>
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:4px; margin-top:4px;">
          <div><label style="font-size:0.65rem; color:var(--text-dim);">Cant.</label><input type="number" class="input-field v-food-qty" value="${item.quantity}" style="font-size:0.75rem; padding:2px 4px; margin:0;" step="0.1" /></div>
          <div><label style="font-size:0.65rem; color:var(--text-dim);">Kcal</label><input type="number" class="input-field v-food-kcal" value="${item.calories}" style="font-size:0.75rem; padding:2px 4px; margin:0;" /></div>
          <div><label style="font-size:0.65rem; color:var(--text-dim);">Prot (g)</label><input type="number" class="input-field v-food-prot" value="${item.protein_g}" style="font-size:0.75rem; padding:2px 4px; margin:0;" step="0.1" /></div>
          <div><label style="font-size:0.65rem; color:var(--text-dim);">Carb (g)</label><input type="number" class="input-field v-food-carb" value="${item.carbs_g}" style="font-size:0.75rem; padding:2px 4px; margin:0;" step="0.1" /></div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderVoiceWearableConfirmUI(metrics) {
  document.getElementById('voice-state-processing')?.classList.add('hidden');
  document.getElementById('voice-state-confirm')?.classList.remove('hidden');

  const container = document.getElementById('voice-confirm-content');
  if (!container) return;

  if (!metrics || metrics.length === 0) {
    container.innerHTML = '<p style="font-size:0.8rem; color:var(--orange);">No se detectaron métricas deportivas claras.</p>';
    return;
  }

  let html = `<div style="font-size:0.75rem; color:var(--cyan); margin-bottom:8px; font-weight:700;">Transcripción: "${window.voiceState.sourceTranscript}"</div>`;
  
  metrics.forEach((m, index) => {
    html += `
      <div class="voice-confirm-row" id="voice-metric-row-${index}">
        <div style="display:flex; gap:6px;">
          <input type="text" class="input-field v-metric-type" value="${m.metric_type}" placeholder="Métrica" style="font-weight:700; font-size:0.8rem; padding:4px 8px; margin:0; flex:2;" />
          <input type="number" class="input-field v-metric-val" value="${m.value}" placeholder="Valor" style="font-size:0.8rem; padding:4px 8px; margin:0; flex:1;" step="0.1" />
          <input type="text" class="input-field v-metric-unit" value="${m.unit}" placeholder="Unidad" style="font-size:0.8rem; padding:4px 8px; margin:0; flex:1;" />
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function handleVoiceAssistantResponse(data) {
  closeVoiceRecorder();
  showScreen('nutri');

  if (typeof addBubble === 'function') {
    addBubble(data.user_message, 'user');
    addBubble(data.assistant_response, 'bot');
  } else {
    showMsg(`Nutri responde: ${data.assistant_response}`);
  }
}

function extractAndSyncHydrationFromFoods(items, sourceTranscript = '') {
  if (!Array.isArray(items) || items.length === 0) return;
  const drinkRegex = /\b(agua|mate|té|te|jugo|soda|café|cafe|gaseosa|leche|kefir|licuado|cerveza|vino|fernet|bebida|infusión|infusion)\b/i;

  let addedAnyDrink = false;

  items.forEach(item => {
    const name = (item.food_name || item.name || '').toLowerCase();
    const transcriptLower = (sourceTranscript || '').toLowerCase();
    const isDrink = drinkRegex.test(name) || drinkRegex.test(transcriptLower);

    if (isDrink) {
      let ml = 250; // Default: 250 cm3 si no se especifica la cantidad

      const combinedText = (name + ' ' + transcriptLower).toLowerCase();
      const mlMatch = combinedText.match(/(\d+)\s*(ml|cm3|cc|c\.c\.)/i);
      if (mlMatch) {
        ml = parseInt(mlMatch[1]) || 250;
      } else if (combinedText.match(/\b(1\/2|medio|medio\s*litro|500ml)\b/i)) {
        ml = 500;
      } else if (combinedText.match(/\b(1\s*litro|un\s*litro|1l|1000ml)\b/i)) {
        ml = 1000;
      } else if (combinedText.match(/\b(taza|vaso)\b/i)) {
        ml = 250;
      } else if (item.quantity && item.quantity > 1 && !mlMatch) {
        ml = Math.round(item.quantity * 250);
      }

      if (typeof hydrationLog !== 'undefined') {
        const todayYMD = (typeof getTodayStr === 'function') ? getTodayStr() : new Date().toISOString().split('T')[0];
        hydrationLog.push({
          ml: ml,
          time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
          date: todayYMD,
          timestamp: Date.now(),
          source: item.food_name || item.name || 'Bebida registrada'
        });
        addedAnyDrink = true;
      }
    }
  });

  if (addedAnyDrink) {
    if (typeof saveNewFeatureData === 'function') saveNewFeatureData();
    if (typeof updateHydrationUI === 'function') updateHydrationUI();
    if (typeof renderProgressCharts === 'function') renderProgressCharts(typeof currentPeriodDays !== 'undefined' ? currentPeriodDays : 7);
  }
}
window.extractAndSyncHydrationFromFoods = extractAndSyncHydrationFromFoods;

async function confirmAndSaveVoiceData() {
  const type = window.voiceState.type;
  const token = localStorage.getItem('niaSaasToken');

  if (type === 'food') {
    const rows = document.querySelectorAll('#voice-confirm-content .voice-confirm-row');
    const itemsToSave = [];
    rows.forEach(r => {
      const name = r.querySelector('.v-food-name')?.value.trim();
      const mealType = r.querySelector('.v-food-meal')?.value || 'almuerzo';
      const qty = parseFloat(r.querySelector('.v-food-qty')?.value) || 1;
      const kcal = parseInt(r.querySelector('.v-food-kcal')?.value) || 0;
      const prot = parseFloat(r.querySelector('.v-food-prot')?.value) || 0;
      const carb = parseFloat(r.querySelector('.v-food-carb')?.value) || 0;

      if (name) {
        itemsToSave.push({
          food_name: name,
          quantity: qty,
          unit: 'porción',
          meal_type: mealType,
          calories: kcal,
          protein_g: prot,
          carbs_g: carb,
          fat_g: 0
        });
      }
    });

    if (itemsToSave.length === 0) {
      showMsg('Por favor ingresa al menos un alimento válido.');
      return;
    }

    const selectedMealType = itemsToSave[0]?.meal_type || 'almuerzo';
    const targetDateStr = (typeof niaTargetMealDate !== 'undefined' && niaTargetMealDate) ? niaTargetMealDate.toDateString() : new Date().toDateString();
    const todayMeals = meals.filter(m => m.date === targetDateStr);
    const existingSameMeal = todayMeals.find(m => m.type === selectedMealType);

    if (existingSameMeal && !window.voiceState.bypassDuplicateCheck) {
      const mealLabels = { desayuno: 'desayuno', almuerzo: 'almuerzo', merienda: 'merienda', cena: 'cena', snack: 'colación' };
      const label = mealLabels[selectedMealType] || selectedMealType;
      showDuplicateMealModal(label, () => {
        window.voiceState.bypassDuplicateCheck = true;
        confirmAndSaveVoiceData();
        window.voiceState.bypassDuplicateCheck = false;
      });
      return;
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      fetch(getBackendApiUrl('/api/voice/food/confirm'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          items: itemsToSave,
          source_transcript: window.voiceState.sourceTranscript,
          meal_type: selectedMealType
        })
      }).catch(e => console.warn('Sync cloud info warning:', e));

      itemsToSave.forEach(i => {
        const newMeal = {
          id: Date.now() + Math.random(),
          name: i.food_name,
          emoji: '🎙️',
          type: i.meal_type,
          kcal: i.calories,
          prot: i.protein_g,
          carb: i.carbs_g,
          fat: i.fat_g,
          score: 75,
          qty: i.quantity,
          unit: i.unit || 'unidad',
          transcript: window.voiceState.sourceTranscript || document.getElementById('voice-manual-text-input')?.value || '',
          date: targetDateStr
        };
        meals.push(newMeal);
        if (typeof niaCheckAndConsumeTicket === 'function') {
          niaCheckAndConsumeTicket(newMeal);
        }
      });

      // Sincronizar automáticamente hidratación (250 cm3 por defecto para bebidas/infusiones si no se especifica otra cantidad)
      extractAndSyncHydrationFromFoods(itemsToSave, window.voiceState.sourceTranscript || document.getElementById('voice-manual-text-input')?.value || '');

      localStorage.setItem('nutriMeals', JSON.stringify(meals));

      if (typeof renderMealsLog === 'function') renderMealsLog();
      if (typeof updateDashboard === 'function') updateDashboard();
      if (typeof updateNutricion === 'function') updateNutricion();
      if (typeof updateDailyProgressBar === 'function') updateDailyProgressBar();
      if (typeof updateHydrationUI === 'function') updateHydrationUI();
      if (typeof renderProgressCharts === 'function') renderProgressCharts(typeof currentPeriodDays !== 'undefined' ? currentPeriodDays : 7);
      if (typeof checkAchievements === 'function') checkAchievements();
      if (typeof updateHomeStatsSummary === 'function') updateHomeStatsSummary();

      showMsg('✅ Comida registrada con éxito por voz.');
      closeVoiceRecorder();

    } catch (err) {
      showMsg('⚠️ Error al confirmar comida: ' + err.message);
    }

  } else if (type === 'wearable') {
    const rows = document.querySelectorAll('#voice-confirm-content .voice-confirm-row');
    const metricsToSave = [];
    rows.forEach(r => {
      const metricType = r.querySelector('.v-metric-type')?.value.trim();
      const val = parseFloat(r.querySelector('.v-metric-val')?.value) || 0;
      const unit = r.querySelector('.v-metric-unit')?.value.trim() || '';

      if (metricType) {
        metricsToSave.push({
          metric_type: metricType,
          value: val,
          unit: unit,
          recorded_at: new Date().toISOString()
        });
      }
    });

    if (metricsToSave.length === 0) {
      showMsg('Por favor ingresa al menos una métrica válida.');
      return;
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const resp = await fetch(getBackendApiUrl('/api/voice/wearable/confirm'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          metrics: metricsToSave,
          source_transcript: window.voiceState.sourceTranscript
        })
      });

      if (!resp.ok) throw new Error('Error al guardar métricas en el servidor');

      metricsToSave.forEach(m => {
        activities.push({
          id: Date.now() + Math.random(),
          name: m.metric_type,
          mins: 30,
          kcal: 150,
          date: new Date().toDateString()
        });
      });
      localStorage.setItem('nutriActivities', JSON.stringify(activities));

      if (typeof updateDashboard === 'function') updateDashboard();
      if (typeof updateDailyProgressBar === 'function') updateDailyProgressBar();

      showMsg('✅ Métricas deportivas guardadas con éxito por voz.');
      closeVoiceRecorder();

    } catch (err) {
      showMsg('⚠️ Error al confirmar métricas: ' + err.message);
    }
  }
}

window.openVoiceRecorder = openVoiceRecorder;
window.closeVoiceRecorder = closeVoiceRecorder;
window.resetVoiceState = resetVoiceState;
window.toggleVoiceRecording = toggleVoiceRecording;
window.startVoiceRecording = startVoiceRecording;
window.stopVoiceRecording = stopVoiceRecording;
window.submitVoiceTextManual = submitVoiceTextManual;

// ===== CARTEL DE TICKET DESCONTADO CON BOTÓN DE CIERRE Y DURACIÓN PROLONGADA =====
function showTicketBanner(msg) {
  const oldBanner = document.getElementById('nia-ticket-notification-banner');
  if (oldBanner) oldBanner.remove();

  const banner = document.createElement('div');
  banner.id = 'nia-ticket-notification-banner';
  banner.style.cssText = `
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #7B1D30, #a81c38);
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-radius: 16px;
    box-shadow: 0 10px 35px rgba(123, 29, 48, 0.65);
    padding: 12px 16px;
    color: #ffffff;
    font-family: Inter, system-ui, -apple-system, sans-serif;
    font-size: 0.88rem;
    font-weight: 700;
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    max-width: 92%;
    width: 440px;
    backdrop-filter: blur(12px);
    animation: fadeDown 0.35s ease;
  `;

  banner.innerHTML = `
    <div style="display:flex; align-items:center; gap:10px;">
      <span style="font-size:1.5rem; flex-shrink:0;">🎟️❌</span>
      <span style="line-height:1.35; flex:1;">${msg}</span>
    </div>
    <button type="button" onclick="this.parentElement.remove()" style="background:rgba(255,255,255,0.22); border:none; color:white; border-radius:50%; width:28px; height:28px; font-weight:900; font-size:0.9rem; cursor:pointer; flex-shrink:0; display:flex; align-items:center; justify-content:center; transition:background 0.2s;" title="Cerrar cartel">✕</button>
  `;

  document.body.appendChild(banner);

  setTimeout(() => {
    if (banner && banner.parentElement) {
      banner.remove();
    }
  }, 8500); // 8.5 segundos de visualización
}
window.showTicketBanner = showTicketBanner;

// ============================================================
// SISTEMA DE 5 TICKETS SEMANALES "COMIDAS DISTINTAS" & AVISOS
// ============================================================

function niaGetISOWeekId(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function niaGetWeeklyTicketsData() {
  const currentWeek = niaGetISOWeekId(new Date());
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem('niaWeeklyTicketsData'));
  } catch(e) {}

  if (!saved || saved.weekId !== currentWeek) {
    saved = {
      weekId: currentWeek,
      remainingTickets: 5,
      history: []
    };
    localStorage.setItem('niaWeeklyTicketsData', JSON.stringify(saved));
  }
  return saved;
}

function niaInitWeeklyTickets() {
  niaGetWeeklyTicketsData();
  niaRenderWeeklyTicketsUI();
}

function niaRenderWeeklyTicketsUI() {
  const data = niaGetWeeklyTicketsData();
  const remaining = data.remainingTickets;
  
  const titleEl = document.getElementById('tickets-status-title');
  const badgeEl = document.getElementById('tickets-badge-tag');
  const iconsRow = document.getElementById('tickets-icons-row');

  if (titleEl) {
    titleEl.textContent = `${remaining} de 5 tickets disponibles`;
  }
  if (badgeEl) {
    if (remaining > 0) {
      badgeEl.textContent = `🎟️ ${remaining} LIBRES`;
      badgeEl.style.background = '#7B1D30';
    } else {
      badgeEl.textContent = `⚠️ CUPO AGOTADO`;
      badgeEl.style.background = '#c81d3a';
    }
  }

  if (iconsRow) {
    let slotsHTML = '';
    for (let i = 0; i < 5; i++) {
      if (i < remaining) {
        slotsHTML += `<div class="ticket-slot active" title="Ticket #${i+1} Disponible" style="position: relative; display: inline-flex; align-items: center; justify-content: center; font-size: 1.9rem; filter: drop-shadow(0 2px 4px rgba(123,29,48,0.3)); transition: all 0.3s ease;">🎟️</div>`;
      } else {
        slotsHTML += `
          <div class="ticket-slot consumed" title="Ticket #${i+1} Consumido" style="position: relative; display: inline-flex; align-items: center; justify-content: center; font-size: 1.9rem; transition: all 0.3s ease;">
            <span style="opacity: 0.35; filter: grayscale(1);">🎟️</span>
            <span style="position: absolute; top: -3px; right: -4px; font-size: 1.15rem; color: #dc2626; text-shadow: 0 1px 3px rgba(0,0,0,0.5); font-weight: 900;">❌</span>
          </div>`;
      }
    }
    iconsRow.innerHTML = slotsHTML;
  }
}

function niaCheckAndConsumeTicket(meal) {
  if (!meal) return;
  const data = niaGetWeeklyTicketsData();
  
  const mealNameStr = String(meal.name || '').toLowerCase();
  const mealKcal = parseFloat(meal.kcal || 0);

  // Palabras clave de alcohol y bebidas azucaradas
  const alcoholSugarRegex = /\b(cerveza|vino|fernet|gin|vodka|ron|whisky|champaña|sidra|trago|cocktail|gaseosa|refresco|coca-cola|coca cola|sprite|fanta|pepsi|energizante|monster|red bull|licor|azúcar|azucar)\b/i;
  const isAlcoholOrSugar = alcoholSugarRegex.test(mealNameStr) || (typeof niaSelectedDrink !== 'undefined' && niaSelectedDrink !== 'ninguna' && (niaAlcoholPct > 0 || niaSelectedDrink !== 'agua_pura'));

  // Exceso de calorías (plato individual > 40% del plan diario o total del día superando targetCals)
  const targetCals = (window.profile && window.profile.targetCals) ? window.profile.targetCals : 2000;
  const todayMeals = typeof getTodayMeals === 'function' ? getTodayMeals() : [];
  const todayCals = todayMeals.reduce((s, m) => s + (m.kcal || 0), 0);

  const isExcessCalories = (mealKcal > (targetCals * 0.4)) || (todayCals > targetCals);

  if (!isAlcoholOrSugar && !isExcessCalories) {
    return; // Comida normal dentro del plan
  }

  // Si los 5 tickets ya fueron consumidos esta semana:
  if (data.remainingTickets <= 0) {
    setTimeout(() => {
      showTicketBanner("Ya cubriste tu cupo de tickets semanales de Comidas Distintas. ¡Cuidado con el exceso!");
    }, 400);
    return;
  }

  // Consumir 1 ticket
  data.remainingTickets -= 1;
  const reasonType = isAlcoholOrSugar ? 'alcohol_sugar' : 'excess_calories';
  data.history.push({
    timestamp: Date.now(),
    mealName: meal.name,
    type: reasonType
  });
  localStorage.setItem('niaWeeklyTicketsData', JSON.stringify(data));
  niaRenderWeeklyTicketsUI();

  // Desplegar aviso personalizado superior (duración 8.5s + botón de cierre ✕)
  setTimeout(() => {
    if (data.remainingTickets === 0) {
      showTicketBanner("Ya cubriste tu cupo de tickets semanales de Comidas Distintas. ¡Cuidado con el exceso!");
    } else if (isAlcoholOrSugar) {
      showTicketBanner("Ups! Has consumido un ticket por ingreso de bebida alcohólica o bebida con exceso de azúcar y calorías");
    } else {
      showTicketBanner("Ups! Has consumido un ticket por ingreso de comida con exceso de calorías");
    }
  }, 400);
}

// ===== NOTIFICACIONES PROGRAMADAS DE ESTIMULACIÓN MÓVIL =====
const SCHEDULED_REMINDERS = [
  { id: 1001, hour: 10, minute: 0, text: "¿Querés cargar alguna comida para actualizar tu plan? 🍽️" },
  { id: 1002, hour: 12, minute: 0, text: "¡No olvides hidratarte bien durante el día! ¿Querés actualizar tus niveles de hidratación? 💧" },
  { id: 1003, hour: 18, minute: 30, text: "¿Querés cargar alguna comida para actualizar tu plan? 🍏" },
  { id: 1004, hour: 20, minute: 0, text: "¡No olvides hidratarte bien durante el día! ¿Querés actualizar tus niveles de hidratación? 💧" },
  { id: 1005, hour: 23, minute: 0, text: "¿Querés cargar alguna comida para actualizar tu plan? 🌙" }
];

function niaGetActiveRemindersList() {
  const reminders = [...SCHEDULED_REMINDERS];
  const supps = Array.isArray(window.supplements) && window.supplements.length > 0
    ? window.supplements
    : JSON.parse(localStorage.getItem('nutriSupps') || '[]');

  if (supps.length > 0) {
    reminders.push({ id: 2001, hour: 9, minute: 0, text: "¡Hora de tomar tu suplemento! 💊" });
    reminders.push({ id: 2002, hour: 15, minute: 0, text: "¡Hora de tomar tu suplemento! 💊" });
  }
  return reminders;
}

let niaWebReminderInterval = null;

function niaScheduleDailyReminders() {
  const isEnabled = localStorage.getItem('niaNotifEnabled') !== 'false';
  if (!isEnabled) {
    niaCancelDailyReminders();
    return;
  }

  const activeReminders = niaGetActiveRemindersList();

  // 1. Capacitor Native App Notifications
  if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
    const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;
    LocalNotifications.requestPermissions().then((perm) => {
      if (perm.display === 'granted') {
        const notificationsToSchedule = activeReminders.map(rem => ({
          title: "Nutrición IA",
          body: rem.text,
          id: rem.id,
          schedule: {
            on: { hour: rem.hour, minute: rem.minute },
            repeats: true,
            allowWhileIdle: true
          }
        }));
        LocalNotifications.schedule({ notifications: notificationsToSchedule }).catch(err => {
          console.warn("Error scheduling native local notifications:", err);
        });
      }
    });
  }

  // 2. Web Notifications API (PWA / Browser)
  if ('Notification' in window && Notification.permission === 'granted') {
    if (niaWebReminderInterval) clearInterval(niaWebReminderInterval);
    
    niaWebReminderInterval = setInterval(() => {
      const now = new Date();
      const curHour = now.getHours();
      const curMin = now.getMinutes();
      
      const matchingRem = activeReminders.find(r => r.hour === curHour && r.minute === curMin);
      if (matchingRem) {
        const lastFiredKey = `niaNotifFired_${matchingRem.id}_${now.toDateString()}`;
        if (!localStorage.getItem(lastFiredKey)) {
          localStorage.setItem(lastFiredKey, 'true');
          new Notification("Nutrición IA", {
            body: matchingRem.text,
            icon: "/granada.png",
            badge: "/granada.png"
          });
        }
      }
    }, 45000);
  }
}

function niaCancelDailyReminders() {
  if (niaWebReminderInterval) {
    clearInterval(niaWebReminderInterval);
    niaWebReminderInterval = null;
  }
  if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
    const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;
    const ids = SCHEDULED_REMINDERS.map(r => ({ id: r.id }));
    LocalNotifications.cancel({ notifications: ids }).catch(() => {});
  }
}

function niaHandleNotifToggle(toggleInput) {
  const enabled = toggleInput ? toggleInput.checked : true;
  localStorage.setItem('niaNotifEnabled', String(enabled));

  if (enabled) {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          niaScheduleDailyReminders();
          showMsg("🔔 Notificaciones estimulantes activadas.");
        } else {
          showMsg("⚠️ Habilitá los permisos de notificación en tu navegador para recibir los avisos.");
        }
      });
    } else {
      niaScheduleDailyReminders();
      showMsg("🔔 Notificaciones estimulantes activadas.");
    }
  } else {
    niaCancelDailyReminders();
    showMsg("🔕 Notificaciones suspendidas.");
  }
}

window.niaGetISOWeekId = niaGetISOWeekId;
window.niaGetWeeklyTicketsData = niaGetWeeklyTicketsData;
window.niaInitWeeklyTickets = niaInitWeeklyTickets;
window.niaRenderWeeklyTicketsUI = niaRenderWeeklyTicketsUI;
window.niaCheckAndConsumeTicket = niaCheckAndConsumeTicket;
window.niaScheduleDailyReminders = niaScheduleDailyReminders;
window.niaCancelDailyReminders = niaCancelDailyReminders;
window.niaHandleNotifToggle = niaHandleNotifToggle;
window.niaGetActiveRemindersList = niaGetActiveRemindersList;
window.confirmAndSaveVoiceData = confirmAndSaveVoiceData;


