/**
 * push-client.js — NutricionLu Web Push Client
 * Maneja: suscripción, preferencias y panel de control de notificaciones push.
 * Se incluye en index.html con <script src="/push-client.js">
 */

// ─── Estado global de push ───────────────────────────────────────────────────
window.niaPush = {
  registration: null,
  subscription: null,
  vapidKey: null,
  prefs: {
    desayuno:    true,
    almuerzo:    true,
    merienda:    true,
    cena:        true,
    suplementos: true,
    hidratacion: true
  }
};

// ─── Utils ────────────────────────────────────────────────────────────────────
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

function getBackendUrl(path) {
  const base = (typeof getBackendApiUrl === 'function')
    ? getBackendApiUrl('').replace(/\/$/, '')
    : '';
  return base + path;
}

// ─── Cargar clave VAPID desde el servidor ────────────────────────────────────
async function niaPushGetVapidKey() {
  try {
    const res  = await fetch(getBackendUrl('/api/push/vapid-key'));
    const data = await res.json();
    window.niaPush.vapidKey = data.publicKey || null;
    return window.niaPush.vapidKey;
  } catch (e) {
    console.warn('[Push] No se pudo obtener VAPID key:', e.message);
    return null;
  }
}

// ─── Suscribir este dispositivo ──────────────────────────────────────────────
async function niaPushSubscribe() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    showMsg('Tu navegador no soporta notificaciones push.', 'warn');
    return null;
  }

  // Pedir permiso
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') {
    showMsg('⚠️ Notificaciones denegadas. Activarlas desde la configuración del navegador.');
    return null;
  }

  try {
    const vapidKey = window.niaPush.vapidKey || await niaPushGetVapidKey();
    if (!vapidKey) throw new Error('Servidor sin VAPID key configurada.');

    const reg = await navigator.serviceWorker.ready;
    window.niaPush.registration = reg;

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly:      true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey)
    });
    window.niaPush.subscription = sub;

    // Guardar en servidor
    const token = localStorage.getItem('niaSaasToken') || '';
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const resp = await fetch(getBackendUrl('/api/push/subscribe'), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        subscription: sub.toJSON(),
        prefs: window.niaPush.prefs
      })
    });

    if (!resp.ok) throw new Error('Error al guardar suscripción en servidor.');

    localStorage.setItem('niaPushSubscribed', 'true');
    localStorage.setItem('niaPushPrefs', JSON.stringify(window.niaPush.prefs));
    niaPushUpdateUI(true);
    showMsg('🔔 ¡Notificaciones activadas! Las recibirás aunque la app esté cerrada.');
    return sub;
  } catch (err) {
    console.error('[Push] Error al suscribir:', err);
    showMsg('❌ Error al activar notificaciones: ' + err.message);
    return null;
  }
}

// ─── Desuscribir este dispositivo ────────────────────────────────────────────
async function niaPushUnsubscribe() {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch(getBackendUrl('/api/push/unsubscribe'), {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ endpoint: sub.endpoint })
      });
      await sub.unsubscribe();
    }
    window.niaPush.subscription = null;
    localStorage.setItem('niaPushSubscribed', 'false');
    niaPushUpdateUI(false);
    showMsg('🔕 Notificaciones desactivadas.');
  } catch (err) {
    console.error('[Push] Error al desuscribir:', err);
    showMsg('❌ Error al desactivar notificaciones.');
  }
}

// ─── Enviar notificación de prueba ───────────────────────────────────────────
async function niaPushSendTest() {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) {
    showMsg('⚠️ Primero activá las notificaciones.');
    return;
  }
  try {
    const token = localStorage.getItem('niaSaasToken') || '';
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const resp = await fetch(getBackendUrl('/api/push/test'), {
      method: 'POST',
      headers,
      body: JSON.stringify({ subscription: sub.toJSON() })
    });
    const data = await resp.json();
    if (data.success) {
      showMsg('🧪 ¡Push de prueba enviado! Revisá las notificaciones de tu dispositivo.');
    } else {
      showMsg('❌ Error: ' + (data.error || 'desconocido'));
    }
  } catch (err) {
    showMsg('❌ Error al enviar push de prueba.');
  }
}

// ─── Actualizar preferencias de notificaciones ───────────────────────────────
async function niaPushUpdatePrefs(prefs) {
  window.niaPush.prefs = { ...window.niaPush.prefs, ...prefs };
  localStorage.setItem('niaPushPrefs', JSON.stringify(window.niaPush.prefs));

  // Si hay suscripción activa, re-suscribir con las nuevas preferencias
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    const token = localStorage.getItem('niaSaasToken') || '';
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch(getBackendUrl('/api/push/subscribe'), {
      method: 'POST',
      headers,
      body: JSON.stringify({ subscription: sub.toJSON(), prefs: window.niaPush.prefs })
    });
  }
}

// ─── Actualizar UI del panel de notificaciones ───────────────────────────────
function niaPushUpdateUI(isActive) {
  const btn      = document.getElementById('push-toggle-btn');
  const statusEl = document.getElementById('push-status-label');
  const testBtn  = document.getElementById('push-test-btn');
  const prefsDiv = document.getElementById('push-prefs-panel');

  if (btn) {
    btn.textContent = isActive ? '🔕 Desactivar notificaciones' : '🔔 Activar notificaciones';
    btn.className   = isActive
      ? 'nia-btn nia-btn-outline push-active'
      : 'nia-btn nia-btn-primary';
  }
  if (statusEl) {
    statusEl.textContent = isActive ? '✅ Notificaciones ACTIVAS' : '🔕 Notificaciones desactivadas';
    statusEl.style.color = isActive ? '#22c55e' : '#94a3b8';
  }
  if (testBtn)  testBtn.style.display  = isActive ? 'inline-flex' : 'none';
  if (prefsDiv) prefsDiv.style.display = isActive ? 'block' : 'none';
}

// ─── Toggle principal ─────────────────────────────────────────────────────────
async function niaPushToggle() {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    await niaPushUnsubscribe();
  } else {
    await niaPushSubscribe();
  }
}

// ─── Inicialización ───────────────────────────────────────────────────────────
async function niaPushInit() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  // Cargar prefs guardadas
  const savedPrefs = localStorage.getItem('niaPushPrefs');
  if (savedPrefs) {
    try { window.niaPush.prefs = JSON.parse(savedPrefs); } catch(e) {}
  }

  // Cargar VAPID key
  await niaPushGetVapidKey();

  // Verificar si ya hay suscripción activa
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  window.niaPush.subscription = sub;
  niaPushUpdateUI(!!sub);

  // Sincronizar checkboxes de prefs con estado guardado
  niaPushSyncPrefsUI();
}

// ─── Sincronizar checkboxes de preferencias con estado guardado ───────────────
function niaPushSyncPrefsUI() {
  const prefs = window.niaPush.prefs;
  Object.keys(prefs).forEach(key => {
    const checkbox = document.getElementById(`push-pref-${key}`);
    if (checkbox) checkbox.checked = prefs[key];
  });
}

// Exponer funciones globalmente
window.niaPushInit        = niaPushInit;
window.niaPushToggle      = niaPushToggle;
window.niaPushSendTest    = niaPushSendTest;
window.niaPushUpdatePrefs = niaPushUpdatePrefs;
window.niaPushSubscribe   = niaPushSubscribe;
window.niaPushUnsubscribe = niaPushUnsubscribe;
