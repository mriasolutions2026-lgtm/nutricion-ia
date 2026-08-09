
// Global State References Safe Fallback
var meals = window.meals || [];
var profile = window.profile || {};
var supplements = window.supplements || [];
var activities = window.activities || [];
var metrics = window.metrics || [];

function niaAcceptDailyDisclaimer() {
  const modal = document.getElementById('nia-daily-disclaimer-modal');
  if (modal) modal.classList.add('hidden');
  localStorage.setItem('niaDisclaimerLastShown', new Date().toDateString());
}
// =============================================
// NutricionLu — app-new-features.js v3.0
// Hidratación, Progreso (Charts), Composición
// Corporal, Logros/Gamificación
// =============================================

// ===== STATE =====
let hydrationLog = [];        // [{ml, time, timestamp}]
let weightLog = [];           // [{kg, date}]
let bodyMeasurements = [];    // [{date, fat, muscle, waist, hip, arm, thigh}]
let hydrationGoalMl = 2000;
let currentPeriodDays = 7;
let chartWeight = null;
let chartCalories = null;
let chartMacrosPie = null;

// ===== BADGES DEFINITIONS =====
const BADGES = [
    { id: 'first_meal',   icon: '🍽️', name: 'Primera comida',    desc: 'Registraste tu primer comida',          check: () => (window.meals || []).length >= 1 },
    { id: 'week_streak',  icon: '🔥', name: '7 días seguidos',    desc: 'Registraste comidas 7 días seguidos',   check: () => getStreak() >= 7 },
    { id: 'month_streak', icon: '🏆', name: '30 días maestro',     desc: '30 días de registros consecutivos',     check: () => getStreak() >= 30 },
    { id: 'hydrated',     icon: '💧', name: 'Bien hidratado/a',   desc: 'Alcanzaste tu objetivo de hidratación', check: () => getTodayHydrationMl() >= hydrationGoalMl },
    { id: 'supplement_1', icon: '💊', name: 'Primer suplemento',  desc: 'Registraste tu primer suplemento',      check: () => (window.supplements || []).length >= 1 },
    { id: 'activity_1',   icon: '🏃', name: 'En movimiento',      desc: 'Registraste tu primera actividad',      check: () => (window.activities || []).length >= 1 },
    { id: 'weight_track', icon: '⚖️', name: 'Control de peso',    desc: 'Registraste tu peso por primera vez',   check: () => weightLog.length >= 1 },
    { id: 'body_comp',    icon: '🫀', name: 'Composición corporal', desc: 'Registraste medidas corporales',       check: () => bodyMeasurements.length >= 1 },
    { id: 'meals_10',     icon: '🥗', name: 'Foodie saludable',   desc: '10 comidas registradas en total',       check: () => (window.meals || []).length >= 10 },
    { id: 'meals_50',     icon: '🌟', name: 'Experto en nutrición', desc: '50 comidas registradas en total',     check: () => (window.meals || []).length >= 50 },
    { id: 'hydration_7',  icon: '🌊', name: 'Semana hidratada',   desc: '7 días alcanzando objetivo de agua',    check: () => getHydrationStreakDays() >= 7 },
    { id: 'perfect_day',  icon: '✨', name: 'Día perfecto',       desc: 'Alcanzaste meta calórica + hidratación en un día', check: () => checkPerfectDay() },
];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadNewFeatureData();
    updateHydrationUI();
    updateAchievementsDash();
    updateStreakCard();
    updateBadgesGrid();
    updateAchievementsStats();
    // Set today's date as default for weight entry
    const wdi = document.getElementById('weight-date-input');
    if (wdi) wdi.value = getTodayStr();
    if (typeof updateDailyProgressBar === 'function') {
        updateDailyProgressBar();
    }
    // Render progress charts on initial Home screen load
    setTimeout(() => {
        renderProgressCharts(currentPeriodDays);
    }, 100);
});

function loadNewFeatureData() {
    const h = localStorage.getItem('nutriHydration');
    const hl = localStorage.getItem('nutriHydrationLog');
    const wl = localStorage.getItem('nutriWeightLog');
    const bm = localStorage.getItem('nutriBodyMeasurements');
    if (h) hydrationGoalMl = parseInt(h) || 2000;
    if (hl) {
        hydrationLog = JSON.parse(hl);
    }
    if (wl) weightLog = JSON.parse(wl);
    if (bm) bodyMeasurements = JSON.parse(bm);
}

function saveNewFeatureData() {
    localStorage.setItem('nutriHydration', String(hydrationGoalMl));
    localStorage.setItem('nutriHydrationLog', JSON.stringify(hydrationLog));
    localStorage.setItem('nutriWeightLog', JSON.stringify(weightLog));
    localStorage.setItem('nutriBodyMeasurements', JSON.stringify(bodyMeasurements));
    
    // Auto-sincronizar con Supabase en segundo plano
    if (typeof niaSyncLocalToCloud === 'function' && localStorage.getItem('niaSaasToken')) {
        niaSyncLocalToCloud();
    }
}

// ===== UTILITIES =====
function getTodayStr() {
    return new Date().toISOString().split('T')[0];
}

function getTodayHydrationMl() {
    const today = getTodayStr();
    return hydrationLog.filter(e => e.date === today).reduce((sum, e) => sum + (e.ml || 0), 0);
}

function getHydrationPct() {
    return Math.min(100, Math.round(getTodayHydrationMl() / hydrationGoalMl * 100));
}

// ===== HYDRATION =====
function addWater(ml) {
    const entry = { ml, time: new Date().toLocaleTimeString('es-AR', {hour:'2-digit',minute:'2-digit'}), date: getTodayStr(), timestamp: Date.now() };
    hydrationLog.push(entry);
    saveNewFeatureData();
    if (typeof niaPostLog === 'function') {
        niaPostLog('hydration', entry, entry.date).then(id => {
            if (id) {
                entry.saasId = id;
                saveNewFeatureData();
            }
        });
    }
    updateHydrationUI();
    checkAchievements();
    if (typeof updateDailyProgressBar === 'function') updateDailyProgressBar();
    showMsg(`¡Muy bien! +${ml}ml de agua registrado. ¡Te estás hidratando excelente hoy! 💧💪`);
}

function openCustomWater() {
    document.getElementById('water-custom-modal').classList.remove('hidden');
    setTimeout(() => document.getElementById('custom-water-input').focus(), 100);
}

function closeCustomWater() {
    document.getElementById('water-custom-modal').classList.add('hidden');
    document.getElementById('custom-water-input').value = '';
}

function saveCustomWater() {
    const ml = parseInt(document.getElementById('custom-water-input').value);
    if (!ml || ml < 50 || ml > 3000) { showMsg('Ingresá una cantidad entre 50 y 3000 ml'); return; }
    closeCustomWater();
    addWater(ml);
}

function saveHydrationGoal() {
    const val = parseInt(document.getElementById('hydration-goal-input').value);
    if (!val || val < 500 || val > 5000) { showMsg('Objetivo válido: entre 500 y 5000 ml'); return; }
    hydrationGoalMl = val;
    saveNewFeatureData();
    updateHydrationUI();
    showMsg('✅ Objetivo de hidratación actualizado');
}

function updateHydrationUI() {
    const consumed = getTodayHydrationMl();
    const pct = getHydrationPct();
    const glasses = Math.round(consumed / 250);
    const goalGlasses = Math.round(hydrationGoalMl / 250);
    const remaining = Math.max(0, hydrationGoalMl - consumed);

    // 1. Dashboard Home widget (botella + métricas)
    const fillDash = document.getElementById('hydration-fill-dash');
    if (fillDash) {
        fillDash.style.height = pct + '%';
        fillDash.style.background = pct >= 100
            ? 'linear-gradient(180deg, #00b4d8, #0077b6)'
            : 'linear-gradient(180deg, #38bdf8, #0284c7)';
    }
    setEl('hydration-pct-dash', pct + '%');
    setEl('hydration-glasses-dash', glasses);
    setEl('hydration-goal-dash', goalGlasses);
    setEl('hydration-ml-dash', consumed.toLocaleString('es-AR') + ' ml');

    // 2. Módulo Comidas widget (botella + métricas)
    const fillComidas = document.getElementById('hydration-fill-comidas');
    if (fillComidas) {
        fillComidas.style.height = pct + '%';
        fillComidas.style.background = pct >= 100
            ? 'linear-gradient(180deg, #00b4d8, #0077b6)'
            : 'linear-gradient(180deg, #38bdf8, #0284c7)';
    }
    setEl('hydration-pct-comidas', pct + '%');
    setEl('hydration-consumed-ml', consumed.toLocaleString('es-AR') + ' ml');
    setEl('hydration-goal-ml', hydrationGoalMl.toLocaleString('es-AR') + ' ml');
    
    const remText = remaining > 0 ? `(Faltan ${remaining.toLocaleString('es-AR')} ml)` : '¡Objetivo alcanzado! 🎉';
    setEl('hydration-remaining-ml', remText);

    // Barra de progreso horizontal en Comidas
    const pb = document.getElementById('hydration-progress-bar');
    if (pb) pb.style.width = Math.min(100, pct) + '%';

    // Input de objetivo sincronizado
    const goalInput = document.getElementById('hydration-goal-input');
    if (goalInput) goalInput.value = hydrationGoalMl;
}

function renderHydrationLog() {
    const log = document.getElementById('hydration-log');
    if (!log) return;
    const today = getTodayStr();
    const todayLog = hydrationLog.filter(e => e.date === today);
    if (todayLog.length === 0) {
        log.innerHTML = '<p class="empty-note">No hay registros de hidratación hoy. ¡Empezá tomando agua!</p>';
        return;
    }
    log.innerHTML = [...todayLog].reverse().map((e, idx) => {
        const originalIdx = hydrationLog.indexOf(e);
        return `
            <div class="hydration-log-item" style="animation-delay:${idx*0.05}s">
                <span class="hydration-log-icon">💧</span>
                <span class="hydration-log-ml">${e.ml} ml</span>
                <span class="hydration-log-time">${e.time}</span>
                <button class="hydration-log-del" onclick="deleteHydrationEntry(${originalIdx})">✕</button>
            </div>`;
    }).join('');
}

function deleteHydrationEntry(idx) {
    const hydToDelete = hydrationLog[idx];
    if (hydToDelete && hydToDelete.saasId && typeof niaDeleteLog === 'function') {
        niaDeleteLog(hydToDelete.saasId);
    }
    hydrationLog.splice(idx, 1);
    saveNewFeatureData();
    updateHydrationUI();
    if (typeof updateDailyProgressBar === 'function') updateDailyProgressBar();
}

// ===== WEIGHT / PROGRESS =====
function openWeightEntry() {
    document.getElementById('weight-modal').classList.remove('hidden');
    const wi = document.getElementById('weight-input');
    if (wi) { wi.value = ''; setTimeout(() => wi.focus(), 100); }
}

function closeWeightEntry() {
    document.getElementById('weight-modal').classList.add('hidden');
}

function saveWeightEntry() {
    const kg = parseFloat(document.getElementById('weight-input').value);
    const date = document.getElementById('weight-date-input').value || getTodayStr();
    if (!kg || kg < 20 || kg > 300) { showMsg('Ingresá un peso válido (20-300 kg)'); return; }
    // Remove duplicate for same date
    weightLog = weightLog.filter(e => e.date !== date);
    const entry = { kg, date };
    weightLog.push(entry);
    weightLog.sort((a, b) => a.date.localeCompare(b.date));
    saveNewFeatureData();
    if (typeof niaPostLog === 'function') {
        niaPostLog('weight', entry, entry.date).then(id => {
            if (id) {
                entry.saasId = id;
                saveNewFeatureData();
            }
        });
    }
    closeWeightEntry();
    renderProgressCharts(currentPeriodDays);
    checkAchievements();
    showMsg('✅ Peso registrado');
}

function selectPeriod(days, btn) {
    currentPeriodDays = days;
    document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProgressCharts(days);
}

let chartProgressDoughnut = null;

function renderProgressCharts(days) {
    renderProgressTarget(days);
}

function renderProgressTarget(targetDays) {
    const ctx = document.getElementById('progress-doughnut-chart');
    if (!ctx) return;

    const mealList = window.meals || (typeof meals !== 'undefined' ? meals : []);
    // Count unique days with logged meals
    const uniqueDaysLogged = [...new Set(mealList.map(m => {
        const mDate = m.date;
        return mDate ? (mDate.includes('-') ? mDate : new Date(mDate).toISOString().split('T')[0]) : null;
    }).filter(Boolean))].length;

    const completed = Math.min(uniqueDaysLogged, targetDays);
    const remaining = Math.max(0, targetDays - completed);
    const pct = Math.round((completed / targetDays) * 100);

    // Update Text elements
    const labelPct = document.getElementById('progress-percentage-label');
    if (labelPct) labelPct.textContent = pct + '%';

    const goalTitle = document.getElementById('progress-goal-title');
    if (goalTitle) goalTitle.textContent = `Meta: ${targetDays} días de registro`;

    const goalDesc = document.getElementById('progress-goal-desc');
    if (goalDesc) {
        if (remaining === 0) {
            goalDesc.innerHTML = `🎉 <strong>¡Meta cumplida!</strong> Completaste los ${targetDays} días de registro desde que activaste tu cuenta.`;
        } else {
            goalDesc.innerHTML = `Llevás <strong>${completed} de ${targetDays}</strong> días registrados desde la activación. <br>¡Te faltan <strong>${remaining}</strong> días para este logro!`;
        }
    }

    // Render Doughnut Chart
    if (chartProgressDoughnut) {
        chartProgressDoughnut.destroy();
    }

    chartProgressDoughnut = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completado', 'Restante'],
            datasets: [{
                data: [completed, remaining],
                backgroundColor: ['#7B1D30', 'rgba(123, 29, 48,0.12)'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            cutout: '70%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.label}: ${ctx.raw} ${ctx.raw === 1 ? 'día' : 'días'}`
                    }
                }
            }
        }
    });
}

function getDateRange(days) {
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
}

function renderWeightChart(days) {
    const ctx = document.getElementById('chart-weight');
    if (!ctx) return;
    const noData = document.getElementById('weight-no-data');
    const dates = getDateRange(days);
    const filtered = weightLog.filter(e => dates.includes(e.date));

    if (filtered.length < 2) {
        if (noData) noData.style.display = '';
        ctx.style.display = 'none';
        return;
    }
    if (noData) noData.style.display = 'none';
    ctx.style.display = '';

    const labels = filtered.map(e => e.date.slice(5));
    const data = filtered.map(e => e.kg);

    if (chartWeight) chartWeight.destroy();
    chartWeight = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Peso (kg)',
                data,
                borderColor: '#7B1D30',
                backgroundColor: 'rgba(123, 29, 48,0.08)',
                borderWidth: 2.5,
                pointBackgroundColor: '#7B1D30',
                pointRadius: 5,
                pointHoverRadius: 8,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.parsed.y + ' kg' } } },
            scales: {
                x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 } } },
                y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 }, callback: v => v + ' kg' } }
            }
        }
    });
}

function renderCaloriesChart(days) {
    const ctx = document.getElementById('chart-calories');
    if (!ctx) return;
    const noData = document.getElementById('cal-no-data');
    const dates = getDateRange(days);

    const mealList = window.meals || (typeof meals !== 'undefined' ? meals : []);
    const userProfile = window.profile || (typeof profile !== 'undefined' ? profile : {});

    // Build calories per date from meals
    const calsByDate = {};
    dates.forEach(d => calsByDate[d] = 0);
    mealList.forEach(m => {
        const mDate = m.date;
        const d = mDate ? (mDate.includes('-') ? mDate : new Date(mDate).toISOString().split('T')[0]) : getTodayStr();
        if (calsByDate[d] !== undefined) calsByDate[d] += (m.kcal || 0);
    });

    const vals = dates.map(d => calsByDate[d]);
    const hasData = vals.some(v => v > 0);

    if (!hasData) {
        if (noData) noData.style.display = '';
        ctx.style.display = 'none';
        return;
    }
    if (noData) noData.style.display = 'none';
    ctx.style.display = '';

    const target = userProfile.targetCals || 2000;
    if (chartCalories) chartCalories.destroy();
    chartCalories = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates.map(d => d.slice(5)),
            datasets: [
                {
                    label: 'Calorías',
                    data: vals,
                    backgroundColor: vals.map(v => v > target * 1.1 ? 'rgba(123, 29, 48,0.7)' : v > 0 ? 'rgba(123, 29, 48,0.45)' : 'rgba(123, 29, 48,0.1)'),
                    borderColor: '#7B1D30',
                    borderWidth: 1.5,
                    borderRadius: 6
                },
                {
                    label: 'Objetivo',
                    data: Array(dates.length).fill(target),
                    type: 'line',
                    borderColor: '#e8829a',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 11 }, callback: v => v + ' kcal' } }
            }
        }
    });
}

function renderMacrosPieChart() {
    const ctx = document.getElementById('chart-macros-pie');
    if (!ctx) return;
    const noData = document.getElementById('macros-no-data');
    const mealList = window.meals || (typeof meals !== 'undefined' ? meals : []);
    const totalProt = mealList.reduce((s, m) => s + (m.prot || 0), 0);
    const totalCarb = mealList.reduce((s, m) => s + (m.carb || 0), 0);
    const totalFat = mealList.reduce((s, m) => s + (m.fat || 0), 0);
    const total = totalProt + totalCarb + totalFat;
    if (total === 0) {
        if (noData) noData.style.display = '';
        ctx.style.display = 'none';
        return;
    }
    if (noData) noData.style.display = 'none';
    ctx.style.display = '';

    if (chartMacrosPie) chartMacrosPie.destroy();
    chartMacrosPie = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Proteínas', 'Carbohidratos', 'Grasas'],
            datasets: [{
                data: [Math.round(totalProt * 4), Math.round(totalCarb * 4), Math.round(totalFat * 9)],
                backgroundColor: ['#7B1D30', '#e8829a', '#b85c78'],
                borderColor: 'transparent',
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            cutout: '65%',
            plugins: {
                legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 16 } },
                tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed} kcal (${Math.round(ctx.parsed / (totalProt*4+totalCarb*4+totalFat*9) * 100)}%)` } }
            }
        }
    });
}

function renderStatsSummary(days) {
    const el = document.getElementById('stats-summary');
    if (!el) return;
    const mealList = window.meals || (typeof meals !== 'undefined' ? meals : []);
    const userProfile = window.profile || (typeof profile !== 'undefined' ? profile : {});
    const dates = getDateRange(days);
    const calsByDate = {};
    dates.forEach(d => calsByDate[d] = 0);
    mealList.forEach(m => {
        const mDate = m.date;
        const d = mDate ? (mDate.includes('-') ? mDate : new Date(mDate).toISOString().split('T')[0]) : getTodayStr();
        if (calsByDate[d] !== undefined) calsByDate[d] += (m.kcal || 0);
    });
    const calsArr = dates.map(d => calsByDate[d]).filter(v => v > 0);
    const avgCals = calsArr.length ? Math.round(calsArr.reduce((a, b) => a + b) / calsArr.length) : 0;
    const target = userProfile.targetCals || 2000;
    const adherence = target > 0 ? Math.round(calsArr.filter(v => Math.abs(v - target) < target * 0.15).length / (calsArr.length || 1) * 100) : 0;
    const wChange = weightLog.length >= 2 ? (weightLog[weightLog.length-1].kg - weightLog[0].kg).toFixed(1) : null;
    const stats = [
        { icon: '🔥', label: 'Promedio kcal/día', val: avgCals ? avgCals + ' kcal' : '--' },
        { icon: '🎯', label: 'Adherencia al plan', val: calsArr.length ? adherence + '%' : '--' },
        { icon: '⚖️', label: 'Cambio de peso', val: wChange !== null ? (wChange > 0 ? '+' : '') + wChange + ' kg' : '--' },
        { icon: '📅', label: 'Días registrados', val: calsArr.length + ' de ' + days },
    ];
    el.innerHTML = stats.map(s => `
        <div class="stats-summary-card glass-card">
            <div class="stat-sum-icon">${s.icon}</div>
            <div class="stat-sum-val">${s.val}</div>
            <div class="stat-sum-label">${s.label}</div>
        </div>`).join('');
}

// ===== BODY COMPOSITION =====
function saveBodyMeasurement() {
    const weight = parseFloat(document.getElementById('body-weight').value);
    const fat = parseFloat(document.getElementById('body-fat').value);
    const muscle = parseFloat(document.getElementById('body-muscle').value);
    const waist = parseFloat(document.getElementById('body-waist').value);
    const hip = parseFloat(document.getElementById('body-hip').value);
    const arm = parseFloat(document.getElementById('body-arm').value);
    const thigh = parseFloat(document.getElementById('body-thigh').value);

    if (!weight && !fat && !muscle && !waist) { showMsg('Completá al menos peso, % grasa, masa muscular o cintura'); return; }

    const entry = { 
        date: getTodayStr(), 
        weight: weight||null,
        fat: fat||null, 
        muscle: muscle||null, 
        waist: waist||null, 
        hip: hip||null, 
        arm: arm||null, 
        thigh: thigh||null 
    };

    bodyMeasurements = bodyMeasurements.filter(e => e.date !== getTodayStr());
    bodyMeasurements.push(entry);
    bodyMeasurements.sort((a, b) => a.date.localeCompare(b.date));
    saveNewFeatureData();

    // Sync body measurements
    if (typeof niaPostLog === 'function') {
        niaPostLog('body_measurement', entry, entry.date).then(id => {
            if (id) {
                entry.saasId = id;
                saveNewFeatureData();
            }
        });
    }

    // Sync weight log if weight was entered
    if (weight) {
        const weightEntry = { date: getTodayStr(), weight: weight };
        weightLog = weightLog.filter(e => e.date !== getTodayStr());
        weightLog.push(weightEntry);
        weightLog.sort((a, b) => a.date.localeCompare(b.date));
        saveNewFeatureData();
        if (typeof niaPostLog === 'function') {
            niaPostLog('weight', weightEntry, getTodayStr()).then(id => {
                if (id) {
                    weightEntry.saasId = id;
                    saveNewFeatureData();
                }
            });
        }
    }

    // Clear inputs
    ['body-weight','body-fat','body-muscle','body-waist','body-hip','body-arm','body-thigh'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
    });
    updateBodyUI();
    checkAchievements();
    showMsg('✅ Medidas corporales guardadas');
}

function updateBodyUI() {
    renderBodyIndicators();
    renderBodyHistory();

    // Restrict body composition inputs to professional or admin users only
    const saasProfileStr = localStorage.getItem('niaSaasProfile');
    let isProfessional = false;
    if (saasProfileStr) {
        try {
            const p = JSON.parse(saasProfileStr);
            if (p.role === 'professional' || p.role === 'admin') {
                isProfessional = true;
            }
        } catch(e) {}
    }

    // Enable/disable inputs based on role
    const ids = ['body-weight', 'body-fat', 'body-muscle', 'body-waist', 'body-hip', 'body-arm', 'body-thigh'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.disabled = !isProfessional;
            el.style.opacity = isProfessional ? '1' : '0.7';
            el.style.cursor = isProfessional ? 'text' : 'not-allowed';
        }
    });

    // Hide Save Button for patients to avoid confusion
    const btn = document.getElementById('btn-save-body-measurements');
    if (btn) {
        btn.style.display = isProfessional ? '' : 'none';
    }
}

function renderBodyIndicators() {
    const el = document.getElementById('body-indicators');
    if (!el || bodyMeasurements.length === 0) { if(el) el.innerHTML = ''; return; }
    const last = bodyMeasurements[bodyMeasurements.length - 1];
    const prev = bodyMeasurements.length >= 2 ? bodyMeasurements[bodyMeasurements.length - 2] : null;

    const indicators = [];
    if (last.fat !== null) {
        const diff = prev && prev.fat !== null ? (last.fat - prev.fat).toFixed(1) : null;
        const risk = last.fat > (profile.sex === 'M' ? 25 : 32) ? '⚠️ Alto' : last.fat < (profile.sex === 'M' ? 8 : 15) ? '⚠️ Bajo' : '✅ Normal';
        indicators.push({ icon: '🫀', label: '% Grasa corporal', val: last.fat + '%', diff, badge: risk });
    }
    if (last.muscle !== null) {
        const diff = prev && prev.muscle !== null ? (last.muscle - prev.muscle).toFixed(1) : null;
        indicators.push({ icon: '💪', label: 'Masa muscular', val: last.muscle + ' kg', diff, badge: null });
    }
    if (last.waist !== null && last.hip !== null) {
        const whr = (last.waist / last.hip).toFixed(2);
        const riskWHR = (profile.sex === 'M' ? whr > 0.9 : whr > 0.85) ? '⚠️ Riesgo metabólico' : '✅ Saludable';
        indicators.push({ icon: '📏', label: 'Índice cintura/cadera', val: whr, diff: null, badge: riskWHR });
    }
    if (last.waist !== null) {
        const diff = prev && prev.waist !== null ? (last.waist - prev.waist).toFixed(1) : null;
        indicators.push({ icon: '〰️', label: 'Cintura', val: last.waist + ' cm', diff, badge: null });
    }

    el.innerHTML = indicators.map(ind => `
        <div class="body-indicator-card glass-card">
            <div class="body-ind-icon">${ind.icon}</div>
            <div class="body-ind-val">${ind.val}</div>
            <div class="body-ind-label">${ind.label}</div>
            ${ind.diff !== null ? `<div class="body-ind-diff ${parseFloat(ind.diff) < 0 ? 'positive' : parseFloat(ind.diff) > 0 ? 'negative' : ''}">${parseFloat(ind.diff) > 0 ? '+' : ''}${ind.diff}</div>` : ''}
            ${ind.badge ? `<div class="body-ind-badge">${ind.badge}</div>` : ''}
        </div>`).join('');
}

function renderBodyHistory() {
    const el = document.getElementById('body-history');
    if (!el) return;
    if (bodyMeasurements.length === 0) {
        el.innerHTML = '<p class="empty-note">No hay medidas registradas aún. Ingresá tu primera medición.</p>';
        return;
    }
    el.innerHTML = [...bodyMeasurements].reverse().slice(0, 10).map(e => `
        <div class="body-history-item glass-card">
            <div class="body-hist-date">${e.date}</div>
            <div class="body-hist-vals">
                ${e.fat !== null ? `<span>🫀 ${e.fat}%</span>` : ''}
                ${e.muscle !== null ? `<span>💪 ${e.muscle}kg</span>` : ''}
                ${e.waist !== null ? `<span>〰️ ${e.waist}cm</span>` : ''}
                ${e.hip !== null ? `<span>🍑 ${e.hip}cm</span>` : ''}
            </div>
        </div>`).join('');
}

// ===== GAMIFICATION / ACHIEVEMENTS =====
function getStreak() {
    const mealList = window.meals || (typeof meals !== 'undefined' ? meals : []);
    if (!mealList || mealList.length === 0) return 0;
    const daysWithMeals = [...new Set(mealList.map(m => {
        const mDate = m.date;
        if (!mDate) return getTodayStr();
        if (mDate.includes('-')) return mDate;
        try {
            const d = new Date(mDate);
            return isNaN(d.getTime()) ? getTodayStr() : d.toISOString().split('T')[0];
        } catch (e) {
            return getTodayStr();
        }
    }))].sort();
    let streak = 0;
    let cur = getTodayStr();
    for (let i = daysWithMeals.length - 1; i >= 0; i--) {
        if (daysWithMeals[i] === cur) {
            streak++;
            const d = new Date(cur);
            d.setDate(d.getDate() - 1);
            cur = d.toISOString().split('T')[0];
        } else {
            if (daysWithMeals[i] < cur) break;
        }
    }
    return streak;
}

function getHydrationStreakDays() {
    // Simplified: check how many consecutive days reached goal
    return 0; // Future: track daily hydration history
}

function checkPerfectDay() {
    const mealList = window.meals || (typeof meals !== 'undefined' ? meals : []);
    const userProfile = window.profile || (typeof profile !== 'undefined' ? profile : {});
    const calsToday = mealList.filter(m => {
        const mDate = m.date;
        const d = mDate ? (mDate.includes('-') ? mDate : new Date(mDate).toISOString().split('T')[0]) : getTodayStr();
        return d === getTodayStr();
    }).reduce((s, m) => s + (m.kcal||0), 0);
    const target = userProfile.targetCals || 2000;
    const hydrated = getTodayHydrationMl() >= hydrationGoalMl;
    return hydrated && calsToday > 0 && Math.abs(calsToday - target) < target * 0.1;
}

let earnedBadges = JSON.parse(localStorage.getItem('nutriBadges') || '[]');

function checkAchievements() {
    let newBadge = false;
    BADGES.forEach(b => {
        if (!earnedBadges.includes(b.id) && b.check()) {
            earnedBadges.push(b.id);
            newBadge = true;
            showBadgeNotification(b);
        }
    });
    if (newBadge) localStorage.setItem('nutriBadges', JSON.stringify(earnedBadges));
    updateBadgesGrid();
    updateAchievementsDash();
    updateStreakCard();
    updateAchievementsStats();
}

function showBadgeNotification(badge) {
    const notif = document.createElement('div');
    notif.className = 'badge-notification';
    notif.innerHTML = `<span class="badge-notif-icon">${badge.icon}</span><div><strong>¡Nuevo logro!</strong><div>${badge.name}</div></div>`;
    document.body.appendChild(notif);
    setTimeout(() => notif.classList.add('show'), 10);
    setTimeout(() => { notif.classList.remove('show'); setTimeout(() => notif.remove(), 400); }, 3500);
}

function updateBadgesGrid() {
    const el = document.getElementById('badges-grid');
    if (!el) return;
    el.innerHTML = BADGES.map(b => `
        <div class="badge-card ${earnedBadges.includes(b.id) ? 'earned' : 'locked'}">
            <div class="badge-icon">${earnedBadges.includes(b.id) ? b.icon : '🔒'}</div>
            <div class="badge-name">${b.name}</div>
            <div class="badge-desc">${b.desc}</div>
            ${earnedBadges.includes(b.id) ? '<div class="badge-earned-tag">✅ Obtenida</div>' : ''}
        </div>`).join('');
}

function updateAchievementsDash() {
    const el = document.getElementById('achievements-dash');
    if (!el) return;
    const recent = earnedBadges.slice(-3);
    if (recent.length === 0) {
        el.innerHTML = '<p class="empty-note" style="font-size:0.8rem;padding:0.5rem 0">Completá tus primeros registros para desbloquear logros 🏅</p>';
        return;
    }
    el.innerHTML = `<div class="achievements-dash-row">${
        recent.map(id => {
            const b = BADGES.find(x => x.id === id);
            return b ? `<div class="ach-dash-badge glass-card"><span>${b.icon}</span><span>${b.name}</span></div>` : '';
        }).join('')
    }</div>`;
}

function updateStreakCard() {
    const streak = getStreak();
    
    // Update streak label text
    const streakDaysLabel = document.getElementById('streak-days-label');
    if (streakDaysLabel) {
        streakDaysLabel.textContent = `${streak} ${streak === 1 ? 'día' : 'días'} ${streak === 1 ? 'seguido' : 'seguidos'}`;
    } else {
        // Fallback for old template
        setEl('streak-days', streak);
    }
    
    // Update badge status
    const badgeEl = document.getElementById('streak-badge');
    if (badgeEl) {
        if (streak >= 30) badgeEl.textContent = '🏆 Maestro';
        else if (streak >= 14) badgeEl.textContent = '⭐ Dedicado';
        else if (streak >= 7) badgeEl.textContent = '🔥 En racha';
        else if (streak >= 3) badgeEl.textContent = '💪 Constante';
        else badgeEl.textContent = '🌱 Comenzando';
    }

    // Update dynamic motivational/adherence message
    const msgEl = document.getElementById('streak-incentive-msg');
    if (msgEl) {
        if (!profile || !profile.name) {
            msgEl.innerHTML = `👋 <strong>¡Bienvenido a Nutricion IA!</strong> Registrate para comenzar tu plan nutricional personalizado.`;
        } else {
            const todayMeals = meals.filter(m => {
                const mDate = m.date;
                const d = mDate ? (mDate.includes('-') ? mDate : new Date(mDate).toISOString().split('T')[0]) : getTodayStr();
                return d === getTodayStr();
            });

            const target = (profile && profile.targetCals) ? profile.targetCals : 2000;
            const currentCals = todayMeals.reduce((s, m) => s + (m.kcal || 0), 0);

            if (todayMeals.length === 0) {
                msgEl.innerHTML = `<strong>¡Plan activo!</strong> Registrá tu primera comida de hoy para ver tu adherencia al plan de <strong>${target} kcal</strong>.`;
            } else {
                const diffPct = (currentCals - target) / target;
                if (Math.abs(diffPct) <= 0.15) {
                    msgEl.innerHTML = `🌟 <strong>¡Excelente adherencia hoy!</strong> Consumiste <strong>${currentCals} kcal</strong>, ideal para tu meta diaria de <strong>${target} kcal</strong>. ¡Seguí así!`;
                } else if (diffPct > 0.15) {
                    msgEl.innerHTML = `⚠️ <strong>Límite calórico superado:</strong> Llevás <strong>${currentCals} kcal</strong> registradas frente a tu meta de <strong>${target} kcal</strong>. Intentá compensar con alimentos livianos y fibra.`;
                } else {
                    msgEl.innerHTML = `💪 <strong>¡Buen registro!</strong> Consumiste <strong>${currentCals} kcal</strong> hasta ahora. Podés consumir hasta <strong>${Math.max(0, target - currentCals)} kcal</strong> más para completar tu meta de <strong>${target} kcal</strong>.`;
                }
            }
        }
    }
}

function updateAchievementsStats() {
    const el = document.getElementById('achievements-stats');
    if (!el) return;
    const streak = getStreak();
    el.innerHTML = `
        <div class="ach-stat-card glass-card"><div class="ach-stat-val">${meals.length}</div><div class="ach-stat-label">Comidas registradas</div></div>
        <div class="ach-stat-card glass-card"><div class="ach-stat-val">${activities.length}</div><div class="ach-stat-label">Actividades registradas</div></div>
        <div class="ach-stat-card glass-card"><div class="ach-stat-val">${streak}</div><div class="ach-stat-label">Racha actual (días)</div></div>
        <div class="ach-stat-card glass-card"><div class="ach-stat-val">${earnedBadges.length}</div><div class="ach-stat-label">Logros desbloqueados</div></div>
    `;
}

// ===== HOOK INTO showScreen for lazy chart rendering =====
const _origShowScreen = typeof showScreen === 'function' ? showScreen : null;
if (_origShowScreen) {
    window.showScreen = function(name) {
        _origShowScreen(name);
        
        let target = name;
        if (target === 'inicio') target = 'home';
        if (target === 'suplementos') target = 'nutricion';
        if (target === 'apps') target = 'actividad';
        if (target === 'hidratacion') target = 'comidas';
        if (target === 'logros') target = 'home';
        if (target === 'progreso') target = 'home';
        if (target === 'cuerpo') target = 'nutricion';

        if (target === 'home') {
            checkAchievements();
            updateHomeStatsSummary();
            setTimeout(() => renderProgressCharts(currentPeriodDays), 100);
        }
        if (target === 'nutricion') {
            updateBodyUI();
        }
        if (target === 'comidas') {
            updateHydrationUI();
        }
    };
}

// ===== WEEKLY CONSUMPTION AVERAGES & SUMMARY =====
function updateHomeStatsSummary() {
    const days = 7;
    const dates = getDateRange(days);
    
    // 1. Calories and Adherence
    const calsByDate = {};
    dates.forEach(d => calsByDate[d] = 0);
    if (Array.isArray(meals)) {
        meals.forEach(m => {
            const mDate = m.date;
            const d = mDate ? (mDate.includes('-') ? mDate : new Date(mDate).toISOString().split('T')[0]) : getTodayStr();
            if (calsByDate[d] !== undefined) calsByDate[d] += (m.kcal || 0);
        });
    }
    const calsArr = dates.map(d => calsByDate[d]).filter(v => v > 0);
    const avgCals = calsArr.length ? Math.round(calsArr.reduce((a, b) => a + b) / calsArr.length) : 0;
    const target = (profile && profile.targetCals) ? profile.targetCals : 2000;
    const adherence = target > 0 ? Math.round(calsArr.filter(v => Math.abs(v - target) < target * 0.15).length / (calsArr.length || 1) * 100) : 0;

    // 2. Water Average
    const waterByDate = {};
    dates.forEach(d => waterByDate[d] = 0);
    if (Array.isArray(hydrationLog)) {
        hydrationLog.forEach(h => {
            const d = h.date;
            if (waterByDate[d] !== undefined) waterByDate[d] += (h.ml || 0);
        });
    }
    const waterArr = dates.map(d => waterByDate[d]).filter(v => v > 0);
    const avgWater = waterArr.length ? Math.round(waterArr.reduce((a, b) => a + b) / waterArr.length) : 0;

    // Update HTML
    setEl('home-avg-calories', avgCals ? avgCals + ' kcal' : '-- kcal');
    setEl('home-plan-adherence', calsArr.length ? adherence + '%' : '--%');
    setEl('home-avg-water', avgWater ? avgWater + ' ml' : '-- ml');
}

// Utility: set element text content
function setEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

// Window bindings for HTML inline onclick handlers
window.addWater = addWater;
window.closeCustomWater = closeCustomWater;
window.closeWeightEntry = closeWeightEntry;
window.openCustomWater = openCustomWater;
window.openWeightEntry = openWeightEntry;
window.saveBodyMeasurement = saveBodyMeasurement;
window.saveCustomWater = saveCustomWater;
window.saveHydrationGoal = saveHydrationGoal;
window.saveWeightEntry = saveWeightEntry;
window.selectPeriod = selectPeriod;
window.updateHomeStatsSummary = updateHomeStatsSummary;

// =============================================
// SAAS CLOUD SYNC LOGIC (SUPABASE)
// =============================================

function niaOpenSaaSModal() {
  document.getElementById('saas-modal').classList.remove('hidden');
  niaUpdateSaaSUI();
}

function niaCloseSaaSModal() {
  document.getElementById('saas-modal').classList.add('hidden');
}

function niaSwitchSaaSTab(tab) {
  const loginTabBtn = document.getElementById('saas-tab-login');
  const registerTabBtn = document.getElementById('saas-tab-register');
  const loginForm = document.getElementById('saas-login-form');
  const registerForm = document.getElementById('saas-register-form');
  const alertEl = document.getElementById('saas-alert');

  if (alertEl) alertEl.classList.add('hidden');

  if (tab === 'login') {
    if (loginTabBtn) {
      loginTabBtn.style.color = 'var(--cyan)';
      loginTabBtn.style.borderBottomColor = 'var(--cyan)';
    }
    if (registerTabBtn) {
      registerTabBtn.style.color = 'var(--text-dim)';
      registerTabBtn.style.borderBottomColor = 'transparent';
    }
    if (loginForm) loginForm.classList.remove('hidden');
    if (registerForm) registerForm.classList.add('hidden');
  } else {
    if (registerTabBtn) {
      registerTabBtn.style.color = 'var(--green)';
      registerTabBtn.style.borderBottomColor = 'var(--green)';
    }
    if (loginTabBtn) {
      loginTabBtn.style.color = 'var(--text-dim)';
      loginTabBtn.style.borderBottomColor = 'transparent';
    }
    if (loginForm) loginForm.classList.add('hidden');
    if (registerForm) registerForm.classList.remove('hidden');
  }
}

function niaToggleOrgField() {
  const roleSelect = document.getElementById('saas-register-role');
  if (!roleSelect) return;
  const role = roleSelect.value;
  const orgField = document.getElementById('saas-org-field');
  const orgInput = document.getElementById('saas-register-org');
  if (role === 'admin' || role === 'professional') {
    if (orgField) orgField.classList.remove('hidden');
    if (orgInput) orgInput.required = true;
  } else {
    if (orgField) orgField.classList.add('hidden');
    if (orgInput) orgInput.required = false;
  }
}

function niaShowSaaSAlert(text, type = 'error') {
  const alertEl = document.getElementById('saas-alert');
  if (!alertEl) return;
  alertEl.textContent = text;
  alertEl.classList.remove('hidden');
  if (type === 'error') {
    alertEl.style.background = 'rgba(239, 83, 80, 0.12)';
    alertEl.style.border = '1px solid rgba(239, 83, 80, 0.25)';
    alertEl.style.color = '#ef5350';
  } else {
    alertEl.style.background = 'rgba(76, 175, 80, 0.12)';
    alertEl.style.border = '1px solid rgba(76, 175, 80, 0.25)';
    alertEl.style.color = '#4caf50';
  }
}

async function niaHandleSaaSLogin() {
  const emailInput = document.getElementById('saas-login-email');
  const passwordInput = document.getElementById('saas-login-password');
  if (!emailInput || !passwordInput) return;
  
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const alertEl = document.getElementById('saas-alert');
  if (alertEl) alertEl.classList.add('hidden');

  try {
    const apiUrl = typeof getBackendApiUrl === 'function' ? getBackendApiUrl('/api/auth/login') : '/api/auth/login';
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Credenciales de inicio de sesión incorrectas');
    }

    localStorage.setItem('niaSaasToken', data.session.access_token);
    localStorage.setItem('niaSaasProfile', JSON.stringify(data.profile || data.user));
    
    niaShowSaaSAlert('¡Inicio de sesión exitoso! Sincronizando datos locales...', 'success');
    
    await niaSyncLocalToCloud();
    niaCloseSaaSModal();
    showMsg('☁️ Sincronización con la nube activa. Tus datos están a salvo.');
  } catch (err) {
    niaShowSaaSAlert(err.message, 'error');
  }
}

async function niaHandleSaaSRegister() {
  const nameInput = document.getElementById('saas-register-name');
  const emailInput = document.getElementById('saas-register-email');
  const passwordInput = document.getElementById('saas-register-password');
  const roleSelect = document.getElementById('saas-register-role');
  const orgInput = document.getElementById('saas-register-org');

  if (!nameInput || !emailInput || !passwordInput || !roleSelect || !orgInput) return;

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const role = roleSelect.value;
  const organizationName = orgInput.value.trim();
  
  const alertEl = document.getElementById('saas-alert');
  if (alertEl) alertEl.classList.add('hidden');

  try {
    const apiUrl = typeof getBackendApiUrl === 'function' ? getBackendApiUrl('/api/auth/register') : '/api/auth/register';
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        name,
        role,
        organizationName: (role === 'admin' || role === 'professional') ? organizationName : null
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al crear la cuenta. Por favor verifica tus datos.');
    }

    // Auto login
    const loginUrl = typeof getBackendApiUrl === 'function' ? getBackendApiUrl('/api/auth/login') : '/api/auth/login';
    const loginResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const loginData = await loginResponse.json();
    if (!loginResponse.ok) throw new Error(loginData.error || 'Registro exitoso, pero falló el inicio de sesión automático.');

    localStorage.setItem('niaSaasToken', loginData.session.access_token);
    localStorage.setItem('niaSaasProfile', JSON.stringify(loginData.profile || loginData.user));
    
    niaShowSaaSAlert('¡Cuenta creada con éxito! Sincronizando...', 'success');
    
    await niaSyncLocalToCloud();
    niaCloseSaaSModal();
    showMsg('☁️ Registro exitoso y sincronización activada.');
  } catch (err) {
    niaShowSaaSAlert(err.message, 'error');
  }
}

function niaHandleSaaSLogout() {
  localStorage.removeItem('niaSaasToken');
  localStorage.removeItem('niaSaasProfile');
  
  const badge = document.getElementById('saas-status-badge');
  if (badge) {
    badge.textContent = 'Local';
    badge.style.background = 'rgba(0,0,0,0.06)';
    badge.style.color = 'var(--text-dim)';
  }

  showMsg('🔌 Sesión cerrada. La aplicación ahora opera en modo local.');
  niaCloseSaaSModal();
  
  if (typeof updateDailyProgressBar === 'function') updateDailyProgressBar();
}

async function niaUpdateSaaSUI() {
  const token = localStorage.getItem('niaSaasToken');
  const loggedInView = document.getElementById('saas-logged-in-view');
  const loggedOutView = document.getElementById('saas-logged-out-view');
  const badge = document.getElementById('saas-status-badge');

  if (token) {
    if (loggedInView) loggedInView.classList.remove('hidden');
    if (loggedOutView) loggedOutView.classList.add('hidden');

    if (badge) {
      badge.textContent = 'Nube ☁️';
      badge.style.background = 'rgba(0, 180, 216, 0.12)';
      badge.style.color = 'var(--cyan)';
      badge.style.fontWeight = 'bold';
    }

    const profileDataStr = localStorage.getItem('niaSaasProfile');
    if (profileDataStr) {
      try {
        const profileData = JSON.parse(profileDataStr);
        setEl('saas-user-email', profileData.email || profileData.user?.email || 'Suscripción Activa');
        setEl('saas-user-role', profileData.role || 'PACIENTE');
      } catch (e) {}
    }

    try {
      const apiUrl = typeof getBackendApiUrl === 'function' ? getBackendApiUrl('/api/limits') : '/api/limits';
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        
        setEl('saas-limit-image', `${data.image.current} / ${data.image.limit}`);
        const imagePct = Math.min(100, Math.round((data.image.current / data.image.limit) * 100));
        const barImg = document.getElementById('saas-bar-image');
        if (barImg) barImg.style.width = `${imagePct}%`;

        setEl('saas-limit-chat', `${data.chat.current} / ${data.chat.limit}`);
        const chatPct = Math.min(100, Math.round((data.chat.current / data.chat.limit) * 100));
        const barChat = document.getElementById('saas-bar-chat');
        if (barChat) barChat.style.width = `${chatPct}%`;

        setEl('saas-limit-pdf', `${data.pdf.current} / ${data.pdf.limit}`);
        const pdfPct = Math.min(100, Math.round((data.pdf.current / data.pdf.limit) * 100));
        const barPdf = document.getElementById('saas-bar-pdf');
        if (barPdf) barPdf.style.width = `${pdfPct}%`;
      }
    } catch (err) {
      console.error('Error fetching limits:', err);
    }
  } else {
    if (loggedInView) loggedInView.classList.add('hidden');
    if (loggedOutView) loggedOutView.classList.remove('hidden');

    if (badge) {
      badge.textContent = 'Local';
      badge.style.background = 'rgba(0,0,0,0.06)';
      badge.style.color = 'var(--text-dim)';
      badge.style.fontWeight = 'normal';
    }
  }
}

async function niaSyncLocalToCloud() {
  const token = localStorage.getItem('niaSaasToken');
  if (!token) return;

  const btn = document.querySelector('button[onclick="niaSyncLocalToCloud()"]');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Sincronizando...';
  }

  try {
    let syncCount = 0;

    // 0. Sincronizar Perfil del Usuario
    const localProfileStr = localStorage.getItem('nutriProfile');
    if (localProfileStr) {
      try {
        const localProfileObj = JSON.parse(localProfileStr);
        const dbProfileObj = {
          name: localProfileObj.name || 'Usuario',
          sex: localProfileObj.sex || null,
          age: localProfileObj.age ? parseInt(localProfileObj.age) : null,
          weight: localProfileObj.weight ? parseFloat(localProfileObj.weight) : null,
          height: localProfileObj.height ? parseFloat(localProfileObj.height) : null,
          target_weight: localProfileObj.targetWeight ? parseFloat(localProfileObj.targetWeight) : null,
          dislikes: localProfileObj.dislikes || null,
          activity_level: localProfileObj.activity || null,
          diet_type: localProfileObj.diet || null,
          allergies: Array.isArray(localProfileObj.allergies) ? localProfileObj.allergies : [],
          goals: Array.isArray(localProfileObj.conditions) ? localProfileObj.conditions : [],
          target_cals: localProfileObj.targetCals ? parseInt(localProfileObj.targetCals) : 2000,
          target_protein: localProfileObj.prot ? parseInt(localProfileObj.prot) : 120,
          target_carbs: localProfileObj.carb ? parseInt(localProfileObj.carb) : 200,
          target_fat: localProfileObj.fat ? parseInt(localProfileObj.fat) : 65
        };

        const profileUrl = typeof getBackendApiUrl === 'function' ? getBackendApiUrl('/api/profile') : '/api/profile';
        await fetch(profileUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(dbProfileObj)
        });
      } catch (profileErr) {
        console.error('Error al sincronizar perfil con SaaS:', profileErr);
      }
    }

    const syncItem = async (item, type, dateStr) => {
      if (item.saasId) return;
      
      const payload = { ...item };
      delete payload.saasId;

      const logsUrl = typeof getBackendApiUrl === 'function' ? getBackendApiUrl('/api/logs') : '/api/logs';
      const response = await fetch(logsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: dateStr,
          type: type,
          payload: payload
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data[0] && data[0].id) {
          item.saasId = data[0].id;
          syncCount++;
        }
      }
    };

    // 1. Sync meals
    for (let item of meals) {
      const dateStr = item.date ? niaStandardizeDate(item.date) : new Date().toISOString().split('T')[0];
      await syncItem(item, 'meal', dateStr);
    }
    localStorage.setItem('nutriMeals', JSON.stringify(meals));

    // 2. Sync supplements
    for (let item of supplements) {
      const dateStr = new Date().toISOString().split('T')[0];
      await syncItem(item, 'supplement', dateStr);
    }
    localStorage.setItem('nutriSupps', JSON.stringify(supplements));

    // 3. Sync activities
    for (let item of activities) {
      const dateStr = item.date ? niaStandardizeDate(item.date) : new Date().toISOString().split('T')[0];
      await syncItem(item, 'activity', dateStr);
    }
    localStorage.setItem('nutriActivities', JSON.stringify(activities));

    // 4. Sync hydrationLog
    for (let item of hydrationLog) {
      const dateStr = item.date || new Date().toISOString().split('T')[0];
      await syncItem(item, 'hydration', dateStr);
    }
    localStorage.setItem('nutriHydrationLog', JSON.stringify(hydrationLog));

    // 5. Sync weightLog
    for (let item of weightLog) {
      const dateStr = item.date || new Date().toISOString().split('T')[0];
      await syncItem(item, 'weight', dateStr);
    }
    localStorage.setItem('nutriWeightLog', JSON.stringify(weightLog));

    // 6. Sync bodyMeasurements
    for (let item of bodyMeasurements) {
      const dateStr = item.date || new Date().toISOString().split('T')[0];
      await syncItem(item, 'body_measurement', dateStr);
    }
    localStorage.setItem('nutriBodyMeasurements', JSON.stringify(bodyMeasurements));

    showMsg(`🔄 Sincronización finalizada. ${syncCount} nuevos registros subidos a la nube.`);
    await niaLoadSaaSData();
    niaUpdateSaaSUI();
  } catch (err) {
    console.error('Error in sync:', err);
    showMsg('⚠️ Falló la sincronización: ' + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '🔄 Sincronizar Datos';
    }
  }
}

function niaStandardizeDate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch (e) {}
  return new Date().toISOString().split('T')[0];
}

async function niaLoadSaaSData() {
  const token = localStorage.getItem('niaSaasToken');
  if (!token) return;

  try {
    // 1. Cargar y fusionar el perfil de usuario desde Supabase
    try {
      const profileUrl = typeof getBackendApiUrl === 'function' ? getBackendApiUrl('/api/profile') : '/api/profile';
      const profileResponse = await fetch(profileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (profileResponse.ok) {
        const dbProfile = await profileResponse.json();
        if (dbProfile) {
          // Fusionar con el perfil local existente para no perder campos locales
          const localProfileStr = localStorage.getItem('nutriProfile');
          let currentProfile = {};
          if (localProfileStr) {
            try { currentProfile = JSON.parse(localProfileStr); } catch (e) {}
          }
          
          profile = {
            name: dbProfile.name || currentProfile.name || '',
            sex: dbProfile.sex || currentProfile.sex || '',
            age: dbProfile.age || currentProfile.age || '',
            weight: dbProfile.weight || currentProfile.weight || '',
            height: dbProfile.height || currentProfile.height || '',
            targetWeight: dbProfile.target_weight || currentProfile.targetWeight || '',
            activity: dbProfile.activity_level || currentProfile.activity || '',
            diet: dbProfile.diet_type || currentProfile.diet || 'equilibrada',
            allergies: Array.isArray(dbProfile.allergies) ? dbProfile.allergies : (currentProfile.allergies || []),
            conditions: Array.isArray(dbProfile.goals) ? dbProfile.goals : (currentProfile.conditions || []),
            dislikes: dbProfile.dislikes || currentProfile.dislikes || '',
            targetCals: dbProfile.target_cals || currentProfile.targetCals || 2000,
            prot: dbProfile.target_protein || currentProfile.prot || 120,
            carb: dbProfile.target_carbs || currentProfile.carb || 200,
            fat: dbProfile.target_fat || currentProfile.fat || 65
          };
          
          localStorage.setItem('nutriProfile', JSON.stringify(profile));
          
          // Desactivar pantalla de onboarding si estaba activa y redirigir al panel
          const onboardingEl = document.getElementById('onboarding');
          const appEl = document.getElementById('app');
          if (onboardingEl && onboardingEl.classList.contains('active')) {
            onboardingEl.classList.remove('active');
            if (appEl) appEl.classList.add('active');
            if (typeof showScreen === 'function') showScreen('inicio');
          }

          if (typeof updateProfile === 'function') updateProfile();
        }
      }
    } catch (profileErr) {
      console.error('Error al cargar perfil desde SaaS:', profileErr);
    }

    const logsUrl = typeof getBackendApiUrl === 'function' ? getBackendApiUrl('/api/logs') : '/api/logs';
    const response = await fetch(logsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Error al cargar datos desde Supabase');

    const logs = await response.json();

    const newMeals = [];
    const newSupps = [];
    const newActs = [];
    const newHydration = [];
    const newWeight = [];
    const newBody = [];

    logs.forEach(log => {
      const item = { ...log.payload, saasId: log.id };
      
      switch (log.type) {
        case 'meal':
          newMeals.push(item);
          break;
        case 'supplement':
          newSupps.push(item);
          break;
        case 'activity':
          newActs.push(item);
          break;
        case 'hydration':
          newHydration.push(item);
          break;
        case 'weight':
          newWeight.push(item);
          break;
        case 'body_measurement':
          newBody.push(item);
          break;
      }
    });

    // Estrategia de Mezcla Segura (No destructiva):
    // Preservar registros locales que aún no se han subido a la nube (sin saasId)
    // y unirlos con los registros que se acaban de descargar desde Supabase.
    
    const localMeals = (meals || []).filter(m => !m.saasId);
    meals = [...newMeals, ...localMeals];
    localStorage.setItem('nutriMeals', JSON.stringify(meals));

    const localSupps = (supplements || []).filter(s => !s.saasId);
    supplements = [...newSupps, ...localSupps];
    localStorage.setItem('nutriSupps', JSON.stringify(supplements));

    const localActs = (activities || []).filter(a => !a.saasId);
    activities = [...newActs, ...localActs];
    localStorage.setItem('nutriActivities', JSON.stringify(activities));
    
    const localHydration = (hydrationLog || []).filter(h => !h.saasId);
    hydrationLog = [...newHydration, ...localHydration];
    localStorage.setItem('nutriHydrationLog', JSON.stringify(hydrationLog));

    const localWeight = (weightLog || []).filter(w => !w.saasId);
    weightLog = [...newWeight, ...localWeight];
    localStorage.setItem('nutriWeightLog', JSON.stringify(weightLog));

    const localBody = (bodyMeasurements || []).filter(b => !b.saasId);
    bodyMeasurements = [...newBody, ...localBody];
    localStorage.setItem('nutriBodyMeasurements', JSON.stringify(bodyMeasurements));

    if (typeof updateDailyProgressBar === 'function') updateDailyProgressBar();
    if (typeof updateHydrationUI === 'function') updateHydrationUI();
    if (typeof updateBodyUI === 'function') updateBodyUI();
    if (typeof renderProgressCharts === 'function') renderProgressCharts(currentPeriodDays);
    if (typeof updateStreakCard === 'function') updateStreakCard();
    if (typeof checkAchievements === 'function') checkAchievements();

    const dml = document.getElementById('dashboard-meals-list');
    if (dml && typeof renderMeals === 'function') {
      renderMeals();
    }
  } catch (err) {
    console.error('Error loading SaaS data:', err);
  }
}

async function niaPostLog(type, payload, dateStr) {
  const token = localStorage.getItem('niaSaasToken');
  if (!token) return null;

  try {
    const logsUrl = typeof getBackendApiUrl === 'function' ? getBackendApiUrl('/api/logs') : '/api/logs';
    const response = await fetch(logsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        date: dateStr || new Date().toISOString().split('T')[0],
        type: type,
        payload: payload
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data[0] && data[0].id) {
        return data[0].id;
      }
    }
  } catch (err) {
    console.error('Error posting log to SaaS:', err);
  }
  return null;
}

async function niaDeleteLog(saasId) {
  const token = localStorage.getItem('niaSaasToken');
  if (!token || !saasId) return;

  try {
    const deleteUrl = typeof getBackendApiUrl === 'function' ? getBackendApiUrl(`/api/logs/${saasId}`) : `/api/logs/${saasId}`;
    await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (err) {
    console.error('Error deleting log from SaaS:', err);
  }
}

// Auto-run on startup if token exists
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    niaUpdateSaaSUI();
    niaLoadSaaSData();
  }, 300);
});

// Window attachments
window.niaOpenSaaSModal = niaOpenSaaSModal;
window.niaCloseSaaSModal = niaCloseSaaSModal;
window.niaSwitchSaaSTab = niaSwitchSaaSTab;
window.niaToggleOrgField = niaToggleOrgField;
window.niaHandleSaaSLogin = niaHandleSaaSLogin;
window.niaHandleSaaSRegister = niaHandleSaaSRegister;
window.niaHandleSaaSLogout = niaHandleSaaSLogout;
window.niaSyncLocalToCloud = niaSyncLocalToCloud;
window.niaPostLog = niaPostLog;
window.niaDeleteLog = niaDeleteLog;

// ===== DAILY PHOTO ANALYSIS LIMITS & PREMIUM STATE =====
function getDailyPhotosCount() {
  const today = new Date().toDateString();
  const stored = localStorage.getItem('niaDailyPhotosCount');
  if (stored) {
    try {
      const data = JSON.parse(stored);
      if (data.date === today) {
        return data.count || 0;
      }
    } catch(e) {}
  }
  return 0;
}

function incrementDailyPhotosCount() {
  const today = new Date().toDateString();
  const current = getDailyPhotosCount();
  localStorage.setItem('niaDailyPhotosCount', JSON.stringify({
    date: today,
    count: current + 1
  }));
}

function isUserPremium() {
  return localStorage.getItem('niaSaaSPremium') === 'true';
}

// ===== PREMIUM UPGRADE INLINE HELPERS =====
let pendingAppToConnect = null;
let pendingButtonToConnect = null;
let premiumContext = null; // 'food', 'barcode' or 'wearable'

function openBarcodeScannerPaywall(e) {
  if (e) e.stopPropagation();
  
  if (isUserPremium()) {
    showMsg('📱 Escáner de código de barras: Iniciando cámara en Plan Premium...');
    setTimeout(() => {
      showMsg('📊 [Simulación] Lector de código de barras activado. Producto detectado: Yogur Griego Natural. Cargando información nutricional...');
    }, 1000);
    return;
  }

  const btn = document.getElementById('nia-btn-barcode');
  openPremiumModal('barcode', btn);
}

function openPremiumModal(appNameOrContext, btnOrElement) {
  pendingAppToConnect = appNameOrContext;
  pendingButtonToConnect = btnOrElement;
  
  if (appNameOrContext === 'food') {
    premiumContext = 'food';
  } else if (appNameOrContext === 'barcode') {
    premiumContext = 'barcode';
  } else if (appNameOrContext === 'report') {
    premiumContext = 'report';
  } else {
    premiumContext = 'wearable';
  }

  // Remove any existing inline warning box first
  const oldBox = document.getElementById('premium-inline-warning');
  if (oldBox) oldBox.remove();

  let questionText = '';
  let noResponseText = '';

  if (premiumContext === 'food') {
    questionText = `⚠️ <strong>No puedes acceder a mas de 4 análisis de fotos por día en Plan Básico</strong>. ¿Deseas pasarte al plan premium? ¿Quieres que te explique las ventajas de cambiar de plan?`;
    noResponseText = `Continuarás con el <strong>Plan Básico</strong>.<br>Podés cargar de manera manual tus comidas a continuación utilizando el buscador de alimentos o ingresando el detalle manualmente.`;
  } else if (premiumContext === 'barcode') {
    questionText = `⚠️ <strong>No podemos habilitar el escaneo de códigos de barras</strong> en este plan básico. ¿Deseas pasarte al plan premium? ¿Quieres que te explique las ventajas de cambiar de plan?`;
    noResponseText = `Continuarás con el <strong>Plan Básico</strong>.<br>Más abajo puedes cargar manualmente el producto leyendo las características en el envase del mismo.`;
  } else if (premiumContext === 'report') {
    questionText = `⚠️ <strong>No podemos enviar reportes automáticos ni sincronizar planillas</strong> en este plan básico. ¿Deseas pasarte al plan premium? ¿Quieres que te explique las ventajas de cambiar de plan?`;
    noResponseText = `Continuarás con el <strong>Plan Básico</strong>.<br>Puedes visualizar las métricas en pantalla, pero la exportación automática y el envío mensual en PDF están reservados para miembros Premium.`;
  } else {
    const appLabel = {
      garmin: 'Garmin Connect', apple: 'Apple Health', google: 'Google Fit',
      fitbit: 'Fitbit', strava: 'Strava', polar: 'Polar Flow',
      samsung: 'Samsung Health', suunto: 'Suunto'
    }[appNameOrContext] || appNameOrContext;
    
    questionText = `⚠️ <strong>No podemos hacer la carga automática</strong> de tu smart watch <strong>(${appLabel})</strong> con este plan. ¿Deseas pasarte al plan premium? ¿Quieres que te explique las ventajas de cambiar de plan?`;
    noResponseText = `Continuarás con el <strong>Plan Básico</strong>.<br>Podés cargar de manera manual tus métricas copiándolas desde la aplicación de tu reloj en tu teléfono móvil.`;
  }

  const html = `
    <div id="premium-inline-warning" class="glass-card" style="margin-top: 0.75rem; padding: 1rem; border: 1px solid rgba(239, 83, 80, 0.35); background: rgba(239, 83, 80, 0.05); border-radius: 8px; font-size: 0.82rem; text-align: left; animation: fadeIn 0.3s ease; width: 100%; box-sizing: border-box;">
      
      <!-- Step 1: Initial Question -->
      <div id="premium-inline-step-1">
        <p style="margin: 0 0 0.75rem 0; color: var(--text); line-height: 1.45;">
          ${questionText}
        </p>
        <div style="display: flex; gap: 0.5rem;">
          <button class="period-btn active" style="padding: 4px 12px; font-size: 0.75rem; background: var(--cyan); border-color: var(--cyan); margin: 0; color: white;" onclick="handlePremiumInlineChoice(true)">Sí</button>
          <button class="period-btn" style="padding: 4px 12px; font-size: 0.75rem; margin: 0;" onclick="handlePremiumInlineChoice(false)">No</button>
        </div>
      </div>

      <!-- Step 2: Explain Advantages (If "Sí" is clicked) -->
      <div id="premium-inline-step-advantages" class="hidden">
        <h4 style="margin: 0 0 0.5rem 0; font-size: 0.88rem; color: var(--text); font-weight: 700;">💎 Ventajas de pasarte a Premium:</h4>
        <ul style="margin: 0 0 1rem 0; padding-left: 1.2rem; line-height: 1.5; color: var(--text-dim); display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem;">
          <li><strong>Cargas automáticas</strong> de smartwatches de las marcas más importantes del mercado (Apple Health, Google Fit, Garmin, Samsung, etc.) con aplicación directa a tu plan nutricional sin más clics.</li>
          <li><strong>Fotos de platos con análisis de IA ilimitadas</strong> para cargar todas tus comidas.</li>
          <li><strong>Envío de Informe directo mensual</strong> a tu nutricionista/profesional de la salud para que monitoree tu evolución.</li>
          <li><strong>Habilitación de escáner de etiquetas</strong> de alimentos para subir los productos directamente leyendo el código de barras.</li>
          <li><strong>Precio reducido por 3 meses</strong> como beneficio especial de bienvenida.</li>
          <li><strong>Acceso directo y sin cargo</strong> a todas las actualizaciones y mejoras de la aplicación.</li>
        </ul>
        <div style="display: flex; gap: 0.5rem;">
          <button class="period-btn active" style="padding: 4px 12px; font-size: 0.75rem; background: var(--cyan); border-color: var(--cyan); margin: 0; color: white;" onclick="goToPremiumCheckoutInline()">Ir a Pagar (Premium)</button>
          <button class="period-btn" style="padding: 4px 12px; font-size: 0.75rem; margin: 0;" onclick="closePremiumInlineBox()">Continuar en Plan Básico / Cancelar</button>
        </div>
      </div>

      <!-- Step 3: If "No" is clicked -->
      <div id="premium-inline-step-no" class="hidden">
        <p style="margin: 0 0 0.5rem 0; color: var(--text-dim); line-height: 1.45; font-size: 0.78rem;">
          ${noResponseText}
        </p>
        <button class="period-btn" style="padding: 4px 12px; font-size: 0.72rem; margin: 0;" onclick="closePremiumInlineBox()">Entendido</button>
      </div>

      <!-- Step 4: Pasarela de pagos (If "Ir a Pagar" is clicked) -->
      <div id="premium-inline-step-checkout" class="hidden">
        <p style="margin: 0 0 0.75rem 0; color: var(--text-dim); line-height: 1.45; font-size: 0.78rem;">
          Te estamos redirigiendo a la pasarela de pagos para activar tu suscripción Premium y habilitar todas las funciones avanzadas.
        </p>
        <div style="padding: 8px 10px; margin-bottom: 0.75rem; font-size: 0.75rem; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.12); border-radius: 6px; text-align: center; color: var(--text-muted);">
          💳 [Pasarela de Pago Segura - Próximamente Habilitada]
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="period-btn active" style="padding: 4px 12px; font-size: 0.75rem; background: var(--green); border-color: var(--green); margin: 0; color: white;" onclick="processMockUpgradeInline()">Pagar y Activar</button>
          <button class="period-btn" style="padding: 4px 12px; font-size: 0.75rem; margin: 0;" onclick="closePremiumInlineBox()">Cancelar</button>
        </div>
      </div>
    </div>
  `;

  // For food/barcode/report context, append after the entire upload card element (outside it)
  const container = (premiumContext === 'food' || premiumContext === 'barcode') 
    ? document.getElementById('photo-upload')
    : (premiumContext === 'report')
      ? document.getElementById('nia-report-card')
      : (btnOrElement.closest('.app-connect-card-compact') || btnOrElement.parentElement);

  if (container) {
    container.insertAdjacentHTML('afterend', html);
    setTimeout(() => {
      document.getElementById('premium-inline-warning')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }
}

function closePremiumInlineBox() {
  const box = document.getElementById('premium-inline-warning');
  if (box) box.remove();
  pendingAppToConnect = null;
  pendingButtonToConnect = null;
  premiumContext = null;
}

function handlePremiumInlineChoice(choice) {
  const step1 = document.getElementById('premium-inline-step-1');
  if (step1) step1.classList.add('hidden');

  if (choice) {
    const advantagesBlock = document.getElementById('premium-inline-step-advantages');
    if (advantagesBlock) advantagesBlock.classList.remove('hidden');
  } else {
    const noBlock = document.getElementById('premium-inline-step-no');
    if (noBlock) noBlock.classList.remove('hidden');
  }

  setTimeout(() => {
    document.getElementById('premium-inline-warning')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 50);
}

function goToPremiumCheckoutInline() {
  if (typeof showMsg === 'function') {
    showMsg('Pasarela de Pagos en construcción 🚧');
  } else {
    alert('Pasarela de Pagos en construcción 🚧');
  }
}

function processMockUpgradeInline() {
  localStorage.setItem('niaSaaSPremium', 'true');
  showMsg('💳 Pasarela de pagos: Suscripción Premium activada con éxito (Simulación)');
  
  if (premiumContext === 'food') {
    showMsg('🎉 ¡Plan Premium Activado! Ya podés subir y analizar tus fotos de comida sin límites.');
    
    // Clear disabled state of the analyze button if they had a photo loaded
    const analyzeBtn = document.getElementById('photo-analyze-btn');
    if (analyzeBtn) {
      analyzeBtn.removeAttribute('disabled');
    }
  } else if (premiumContext === 'barcode') {
    showMsg('🎉 ¡Plan Premium Activado! Ya podés usar el escáner de códigos de barras.');
  } else if (pendingAppToConnect && pendingButtonToConnect) {
    const btn = pendingButtonToConnect;
    const appLabel = {
      garmin: 'Garmin Connect', apple: 'Apple Health', google: 'Google Fit',
      fitbit: 'Fitbit', strava: 'Strava', polar: 'Polar Flow',
      samsung: 'Samsung Health', suunto: 'Suunto'
    }[pendingAppToConnect] || pendingAppToConnect;
    
    btn.textContent = '✓ Conectado';
    btn.classList.add('connected');
    btn.disabled = true;
    showMsg(`✅ ${appLabel} conectado con tu Plan Premium`);
  }

  closePremiumInlineBox();
}

function niaShowWelcomeSelection() {
  const welcomeCarousel = document.getElementById('welcome-carousel');
  const welcomeDots = document.getElementById('welcome-dots');
  const welcomeSelector = document.getElementById('onb-welcome-selector');
  const skipBtn = document.querySelector('.onb-skip-btn');

  if (welcomeCarousel) welcomeCarousel.classList.add('hidden');
  if (welcomeDots) welcomeDots.classList.add('hidden');
  if (skipBtn) skipBtn.classList.add('hidden');
  if (welcomeSelector) welcomeSelector.classList.remove('hidden');
}

function niaStartNewUserFlow() {
  if (typeof goToPersonalization === 'function') {
    goToPersonalization();
  }
}

function niaShowEmailLoginForm() {
  const welcomeSelector = document.getElementById('onb-welcome-selector');
  const emailLoginForm = document.getElementById('onb-email-login-form');

  if (welcomeSelector) welcomeSelector.classList.add('hidden');
  if (emailLoginForm) emailLoginForm.classList.remove('hidden');
}

function niaBackToWelcomeSelector() {
  const welcomeSelector = document.getElementById('onb-welcome-selector');
  const emailLoginForm = document.getElementById('onb-email-login-form');

  if (emailLoginForm) emailLoginForm.classList.add('hidden');
  if (welcomeSelector) welcomeSelector.classList.remove('hidden');
}

async function niaHandleEmailOnlyLogin() {
  const emailInput = document.getElementById('onb-login-email');
  if (!emailInput) return;
  const email = emailInput.value.trim();
  if (!email || !email.includes('@')) {
    if (typeof showMsg === 'function') showMsg('Por favor ingresá un correo electrónico válido');
    return;
  }

  const btn = document.querySelector('button[onclick="niaHandleEmailOnlyLogin()"]');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Accediendo...';
  }

  try {
    const identifyUrl = typeof getBackendApiUrl === 'function' ? getBackendApiUrl('/api/auth/identify') : '/api/auth/identify';
    const response = await fetch(identifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'No se pudo acceder');
    }

    if (data.isNew) {
      if (typeof showMsg === 'function') showMsg('No encontramos una cuenta con este correo. Iniciando registro de nuevo usuario.');
      niaStartNewUserFlow();
      return;
    }

    // 1. Guardar token y perfil en localStorage
    localStorage.setItem('niaSaasToken', data.token);
    
    // Mapear el perfil de base de datos a formato local
    const dbProfile = data.profile;
    profile = {
      name: dbProfile.name || 'Usuario',
      sex: dbProfile.sex || 'F',
      age: dbProfile.age ? parseInt(dbProfile.age) : 30,
      weight: dbProfile.weight ? parseFloat(dbProfile.weight) : 70,
      height: dbProfile.height ? parseFloat(dbProfile.height) : 165,
      targetWeight: dbProfile.target_weight ? parseFloat(dbProfile.target_weight) : (dbProfile.weight ? parseFloat(dbProfile.weight) : 70),
      diet: dbProfile.diet || 'omnivoro',
      goal: dbProfile.goal || 'saludGeneral',
      activity: dbProfile.activity || 'moderado',
      tdee: dbProfile.tdee || 2000,
      targetCals: dbProfile.target_cals || 2000,
      prot: dbProfile.prot || 120,
      carb: dbProfile.carb || 200,
      fat: dbProfile.fat || 65,
      allergies: Array.isArray(dbProfile.allergies) ? dbProfile.allergies : [],
      conditions: Array.isArray(dbProfile.conditions) ? dbProfile.conditions : [],
      dislikes: dbProfile.dislikes || ''
    };
    localStorage.setItem('nutriProfile', JSON.stringify(profile));

    // 2. Mapear los logs descargados y guardarlos
    const newMeals = [];
    const newSupps = [];
    const newActs = [];
    const newHydration = [];
    const newWeight = [];
    const newBody = [];

    if (Array.isArray(data.logs)) {
      data.logs.forEach(log => {
        const item = { ...log.payload, saasId: log.id };
        switch (log.type) {
          case 'meal': newMeals.push(item); break;
          case 'supplement': newSupps.push(item); break;
          case 'activity': newActs.push(item); break;
          case 'hydration': newHydration.push(item); break;
          case 'weight': newWeight.push(item); break;
          case 'body_measurement': newBody.push(item); break;
        }
      });
    }

    meals = newMeals;
    localStorage.setItem('nutriMeals', JSON.stringify(meals));

    supplements = newSupps;
    localStorage.setItem('nutriSupps', JSON.stringify(supplements));

    activities = newActs;
    localStorage.setItem('nutriActivities', JSON.stringify(activities));

    hydrationLog = newHydration;
    localStorage.setItem('nutriHydrationLog', JSON.stringify(hydrationLog));

    weightLog = newWeight;
    localStorage.setItem('nutriWeightLog', JSON.stringify(weightLog));

    bodyMeasurements = newBody;
    localStorage.setItem('nutriBodyMeasurements', JSON.stringify(bodyMeasurements));

    // 3. Inicializar la app y redirigir
    localStorage.setItem('niaFirstTimeTour', 'true');
    if (typeof initApp === 'function') initApp();

    // Ocultar onboarding por completo
    const onboardingEl = document.getElementById('onboarding');
    const appEl = document.getElementById('app');
    if (onboardingEl) onboardingEl.classList.remove('active');
    if (appEl) appEl.classList.add('active');

    // Redirigir a la pestaña inicio
    if (typeof showScreen === 'function') showScreen('inicio');

    // 4. Mostrar saludo personalizado
    const rawName = profile.name ? profile.name.trim() : '';
    const firstName = rawName.split(' ')[0] || 'amigo';
    const nameCap = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    if (typeof showMsg === 'function') {
      showMsg(`¡Qué bueno verte de nuevo, ${nameCap}! Sigamos cambiando hábitos 🚀`);
    }

  } catch (err) {
    console.error('Error al iniciar sesión por email:', err);
    if (typeof showMsg === 'function') showMsg(err.message || 'Error al iniciar sesión.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Acceder →';
    }
  }
}

window.openBarcodeScannerPaywall = openBarcodeScannerPaywall;
window.openPremiumModal = openPremiumModal;
window.closePremiumInlineBox = closePremiumInlineBox;
window.handlePremiumInlineChoice = handlePremiumInlineChoice;
window.goToPremiumCheckoutInline = goToPremiumCheckoutInline;
window.processMockUpgradeInline = processMockUpgradeInline;
window.getDailyPhotosCount = getDailyPhotosCount;
window.incrementDailyPhotosCount = incrementDailyPhotosCount;
window.isUserPremium = isUserPremium;

window.niaShowWelcomeSelection = niaShowWelcomeSelection;
window.niaStartNewUserFlow = niaStartNewUserFlow;
window.niaShowEmailLoginForm = niaShowEmailLoginForm;
window.niaBackToWelcomeSelector = niaBackToWelcomeSelector;
window.niaHandleEmailOnlyLogin = niaHandleEmailOnlyLogin;

function niaOpenTermsModal() {
  const modal = document.getElementById('nia-terms-modal');
  if (modal) modal.classList.remove('hidden');
}

function niaCloseTermsModal() {
  const modal = document.getElementById('nia-terms-modal');
  if (modal) modal.classList.add('hidden');
}


async function niaDeleteAccountAndData() {
  if (!confirm('🚨 ¿Estás seguro de que deseas eliminar tu cuenta y todos tus datos registrados de forma permanente? Esta acción no se puede deshacer.')) {
    return;
  }

  const token = localStorage.getItem('niaSaasToken');
  if (token) {
    try {
      // Intentar eliminar del backend en la nube
      const deleteUrl = typeof getBackendApiUrl === 'function' ? getBackendApiUrl('/api/auth/delete-account') : '/api/auth/delete-account';
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        console.warn('Fallo al eliminar cuenta en el backend, procediendo a limpiar localmente.');
      }
    } catch (e) {
      console.warn('Error llamando a delete-account en el servidor:', e.message);
    }
  }

  // Limpiar almacenamiento local por completo
  localStorage.clear();

  // Resetear estados en memoria (comidas, suplementos, actividades, perfil)
  if (typeof meals !== 'undefined') meals = [];
  if (typeof supplements !== 'undefined') supplements = [];
  if (typeof activities !== 'undefined') activities = [];
  if (typeof profile !== 'undefined') profile = {};
  if (typeof hydrationLog !== 'undefined') hydrationLog = [];
  if (typeof weightLog !== 'undefined') weightLog = [];
  if (typeof bodyMeasurements !== 'undefined') bodyMeasurements = [];

  // Cerrar modal de términos si estaba abierto
  niaCloseTermsModal();

  if (typeof showMsg === 'function') {
    showMsg('Cuenta y datos locales eliminados permanentemente.');
  }

  // Forzar recarga o reinicio al onboarding
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

window.niaOpenTermsModal = niaOpenTermsModal;
window.niaCloseTermsModal = niaCloseTermsModal;
window.niaAcceptDailyDisclaimer = niaAcceptDailyDisclaimer;
window.niaDeleteAccountAndData = niaDeleteAccountAndData;
