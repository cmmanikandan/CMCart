/**
 * Cloud Sync Service for CMCart
 * Enables seamless live data persistence across devices.
 * Syncs user profile, delivery addresses, and order history to cloud
 * so logging in on any device immediately restores full profile state
 * without repeatedly triggering onboarding/profile wizard.
 */

import { auth } from '../firebase/firebaseConfig.js';
import { updateProfile as updateFirebaseProfile } from 'firebase/auth';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dughdt8sf';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'qubink_uploads';

/**
 * Sanitizes UID for safe Cloudinary public_id
 */
export function sanitizeCloudId(uid) {
  if (!uid) return 'anon';
  return String(uid).replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Extracts clean image URL and encoded metadata from photoURL hash if present
 */
export function parseProfileHash(photoURL) {
  if (!photoURL || typeof photoURL !== 'string') {
    return { cleanUrl: '', meta: null };
  }

  const hashIndex = photoURL.indexOf('#cm=');
  if (hashIndex === -1) {
    return { cleanUrl: photoURL, meta: null };
  }

  const cleanUrl = photoURL.slice(0, hashIndex);
  const hashVal = photoURL.slice(hashIndex + 4);

  try {
    const meta = JSON.parse(decodeURIComponent(hashVal));
    return { cleanUrl, meta };
  } catch (e) {
    return { cleanUrl, meta: null };
  }
}

/**
 * Encodes core profile metadata into photoURL fragment
 */
export function buildProfileHash(cleanUrl, meta) {
  const base = (cleanUrl || '').split('#cm=')[0];
  if (!meta) return base;
  try {
    const json = JSON.stringify({
      g: meta.gender || '',
      a: meta.age || null,
      p: meta.phone || '',
      c: meta.isProfileCompleted ? 1 : 0
    });
    return `${base}#cm=${encodeURIComponent(json)}`;
  } catch (e) {
    return base;
  }
}

/**
 * Fetches user profile, addresses, and orders from the live cloud database
 */
export async function fetchUserFromCloud(uid, fbUser = null) {
  if (!uid && !fbUser?.uid) return null;
  const activeUid = uid || fbUser?.uid;
  const cleanId = sanitizeCloudId(activeUid);

  let fastMeta = null;
  let cleanPhoto = fbUser?.photoURL || '';

  // 1. Fast path: Decode instant metadata from Firebase Auth photoURL if present
  if (fbUser?.photoURL) {
    const parsed = parseProfileHash(fbUser.photoURL);
    cleanPhoto = parsed.cleanUrl;
    if (parsed.meta) {
      fastMeta = {
        gender: parsed.meta.g || '',
        age: parsed.meta.a || null,
        phone: parsed.meta.p || '',
        isProfileCompleted: parsed.meta.c === 1
      };
    }
  }

  // 2. Fetch full user document from Cloudinary raw JSON cloud
  try {
    const cloudUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/raw/upload/cmcart_cloud_user_${cleanId}.json?t=${Date.now()}`;
    const res = await fetch(cloudUrl, { cache: 'no-store' });

    if (res.ok) {
      const data = await res.json();
      return {
        uid: data.uid || activeUid,
        email: data.email || fbUser?.email || '',
        displayName: data.displayName || fbUser?.displayName || '',
        photoURL: data.photoURL || cleanPhoto,
        phone: data.phone || fastMeta?.phone || '',
        gender: data.gender || fastMeta?.gender || '',
        age: data.age || fastMeta?.age || null,
        isProfileCompleted: data.isProfileCompleted ?? (fastMeta?.isProfileCompleted ?? false),
        role: data.role || 'customer',
        addresses: Array.isArray(data.addresses) ? data.addresses : [],
        orders: Array.isArray(data.orders) ? data.orders : [],
        updated_at: data.updated_at || new Date().toISOString()
      };
    }
  } catch (err) {
    console.warn('Cloud sync fetch note:', err?.message);
  }

  // 3. Fallback to fastMeta if network/document missing
  if (fastMeta) {
    return {
      uid: activeUid,
      email: fbUser?.email || '',
      displayName: fbUser?.displayName || '',
      photoURL: cleanPhoto,
      phone: fastMeta.phone || '',
      gender: fastMeta.gender || '',
      age: fastMeta.age || null,
      isProfileCompleted: fastMeta.isProfileCompleted,
      addresses: [],
      orders: [],
      updated_at: new Date().toISOString()
    };
  }

  return null;
}

/**
 * Saves user profile and optional extra data (addresses, orders) to cloud
 */
export async function saveUserToCloud(user, extra = {}) {
  if (!user || !user.uid) return null;
  const cleanId = sanitizeCloudId(user.uid);

  const cleanPhoto = parseProfileHash(user.photoURL).cleanUrl || user.photoURL || '';

  const payload = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    photoURL: cleanPhoto,
    phone: user.phone || '',
    gender: user.gender || '',
    age: user.age || null,
    isProfileCompleted: !!user.isProfileCompleted,
    role: user.role || 'customer',
    addresses: Array.isArray(extra.addresses) ? extra.addresses : undefined,
    orders: Array.isArray(extra.orders) ? extra.orders : undefined,
    updated_at: new Date().toISOString()
  };

  // If addresses or orders are not explicitly supplied, keep existing from localStorage store
  try {
    const rawStore = localStorage.getItem('cmcart_commerce_store_v3');
    if (rawStore) {
      const parsedStore = JSON.parse(rawStore);
      if (!payload.addresses && Array.isArray(parsedStore.addresses)) {
        payload.addresses = parsedStore.addresses.filter(
          (a) => a.user_id === user.uid || (a.user_email && a.user_email.toLowerCase() === (user.email || '').toLowerCase())
        );
      }
      if (!payload.orders && Array.isArray(parsedStore.orders)) {
        payload.orders = parsedStore.orders.filter(
          (o) => o.user_id === user.uid || (o.user_email && o.user_email.toLowerCase() === (user.email || '').toLowerCase())
        );
      }
    }
  } catch (e) { /* ignore */ }

  // 1. Upload JSON document to Cloudinary
  try {
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    const formData = new FormData();
    formData.append('file', blob, `cmcart_user_${cleanId}.json`);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('public_id', `cmcart_cloud_user_${cleanId}`);

    await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`, {
      method: 'POST',
      body: formData
    });
  } catch (uploadErr) {
    console.warn('Cloud persistence note:', uploadErr?.message);
  }

  // 2. Persist core metadata in Firebase Auth user profile
  try {
    if (auth?.currentUser) {
      const enrichedPhoto = buildProfileHash(cleanPhoto, {
        gender: payload.gender,
        age: payload.age,
        phone: payload.phone,
        isProfileCompleted: payload.isProfileCompleted
      });

      await updateFirebaseProfile(auth.currentUser, {
        displayName: payload.displayName || auth.currentUser.displayName,
        photoURL: enrichedPhoto
      });
    }
  } catch (fbErr) {
    console.warn('Firebase Auth profile update note:', fbErr?.message);
  }

  return payload;
}

/**
 * Saves product catalog (products, categories, banners) to cloud
 */
export async function saveCatalogToCloud(catalog = {}) {
  try {
    const payload = {
      products: Array.isArray(catalog.products) ? catalog.products : [],
      categories: Array.isArray(catalog.categories) ? catalog.categories : [],
      banners: Array.isArray(catalog.banners) ? catalog.banners : [],
      deals: Array.isArray(catalog.deals) ? catalog.deals : [],
      updated_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    const formData = new FormData();
    formData.append('file', blob, 'cmcart_catalog.json');
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('public_id', 'cmcart_cloud_catalog');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`, {
      method: 'POST',
      body: formData
    });
    return res.ok;
  } catch (err) {
    console.warn('Catalog cloud save note:', err?.message);
    return false;
  }
}

/**
 * Fetches product catalog from live cloud
 */
export async function fetchCatalogFromCloud() {
  try {
    const cloudUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/raw/upload/cmcart_cloud_catalog.json?t=${Date.now()}`;
    const res = await fetch(cloudUrl, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return {
        products: Array.isArray(data.products) ? data.products : [],
        categories: Array.isArray(data.categories) ? data.categories : [],
        banners: Array.isArray(data.banners) ? data.banners : [],
        deals: Array.isArray(data.deals) ? data.deals : []
      };
    }
  } catch (err) {
    console.warn('Catalog cloud fetch note:', err?.message);
  }
  return null;
}
