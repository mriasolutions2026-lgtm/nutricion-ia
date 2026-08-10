/**
 * pushService.js
 * Servicio de Web Push Notifications para NutricionLu
 * Usa la librería web-push con claves VAPID
 */

const webpush = require('web-push');
const { supabase } = require('./supabaseService');

// Configurar VAPID
const VAPID_PUBLIC_KEY  = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL       = process.env.VAPID_EMAIL || 'mailto:contacto@nutricionlu.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  console.log('🔔 [PushService] VAPID configurado correctamente.');
} else {
  console.warn('⚠️ [PushService] Claves VAPID no configuradas. Las notificaciones push no funcionarán.');
}

/**
 * Guarda o actualiza una suscripción push para un usuario.
 * @param {string} userId
 * @param {object} subscription - Objeto PushSubscription del navegador
 * @param {object} prefs - Preferencias de notificaciones { desayuno, almuerzo, merienda, cena, suplementos, hidratacion }
 */
async function saveSubscription(userId, subscription, prefs = {}) {
  const { endpoint, keys } = subscription;

  const record = {
    user_id:    userId,
    endpoint,
    p256dh:     keys?.p256dh,
    auth:       keys?.auth,
    pref_desayuno:    prefs.desayuno    ?? true,
    pref_almuerzo:    prefs.almuerzo    ?? true,
    pref_merienda:    prefs.merienda    ?? true,
    pref_cena:        prefs.cena        ?? true,
    pref_suplementos: prefs.suplementos ?? true,
    pref_hidratacion: prefs.hidratacion ?? true,
    updated_at: new Date().toISOString()
  };

  // Upsert por endpoint (un dispositivo puede cambiar de usuario)
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(record, { onConflict: 'endpoint' });

  if (error) throw error;
  return { success: true };
}

/**
 * Elimina una suscripción push por endpoint.
 */
async function deleteSubscription(endpoint) {
  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint);
  if (error) throw error;
  return { success: true };
}

/**
 * Envía una notificación push a todos los suscriptores que tengan activado un tipo de recordatorio.
 * @param {string} prefField - Nombre del campo de preferencia (ej: 'pref_desayuno')
 * @param {object} payload - { title, body, icon, url }
 */
async function sendPushToAll(prefField, payload) {
  if (!VAPID_PUBLIC_KEY) {
    console.warn('[PushService] VAPID no configurado, push omitido.');
    return;
  }

  // Obtener suscripciones activas con esa preferencia habilitada
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq(prefField, true);

  if (error) {
    console.error('[PushService] Error al obtener suscripciones:', error.message);
    return;
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.log(`[PushService] Sin suscriptores para ${prefField}`);
    return;
  }

  const notification = JSON.stringify({
    title: payload.title,
    body:  payload.body,
    icon:  payload.icon  || '/icons/icon-192.png',
    badge: payload.badge || '/icons/icon-72.png',
    url:   payload.url   || '/'
  });

  console.log(`[PushService] Enviando push a ${subscriptions.length} suscriptores (${prefField})`);

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      };
      try {
        await webpush.sendNotification(pushSub, notification);
      } catch (err) {
        // Suscripción expirada o inválida → eliminar
        if (err.statusCode === 404 || err.statusCode === 410) {
          console.log(`[PushService] Suscripción expirada, eliminando: ${sub.endpoint.substring(0, 60)}...`);
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        } else {
          throw err;
        }
      }
    })
  );

  const sent   = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  console.log(`[PushService] Enviados: ${sent}, Fallidos: ${failed}`);
}

module.exports = { saveSubscription, deleteSubscription, sendPushToAll, VAPID_PUBLIC_KEY };
