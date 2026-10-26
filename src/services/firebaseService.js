import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const STORAGE_KEY = "cinemasathi_firebase_config";

/**
 * Official CinemaSathi Firebase Project Configuration (cinemasathi-ce326)
 */
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyD9VXLL-RWqBX4bnY3-981YeNPjfI7UWwc",
  authDomain: "cinemasathi-ce326.firebaseapp.com",
  projectId: "cinemasathi-ce326",
  storageBucket: "cinemasathi-ce326.firebasestorage.app",
  messagingSenderId: "809257205414",
  appId: "1:809257205414:web:0788f57f145b3ac2987e67",
  measurementId: "G-CT5PJHJFXP"
};

/**
 * Retrieves the active Firebase configuration from environment, localStorage, or defaults
 */
export const getFirebaseConfig = () => {
  // Check environment variables first
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (envApiKey && envProjectId) {
    return {
      apiKey: envApiKey.trim(),
      authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain).trim(),
      projectId: envProjectId.trim(),
      storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket).trim(),
      messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId).trim(),
      appId: (import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId).trim(),
      measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CONFIG.measurementId).trim()
    };
  }

  // Check localStorage overrides
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not read stored Firebase config:", e);
  }

  // Return official default configuration
  return DEFAULT_FIREBASE_CONFIG;
};

/**
 * Persists user's Firebase config in localStorage and notifies app
 */
export const saveFirebaseConfig = (config) => {
  try {
    if (config && config.apiKey && config.projectId) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.warn("Could not save Firebase config to localStorage:", e);
  }
  window.dispatchEvent(new Event("firebase_config_updated"));
};

/**
 * Validates whether the Firebase configuration has necessary keys
 */
export const isFirebaseConfigValid = (config = null) => {
  const c = config || getFirebaseConfig();
  return Boolean(
    c &&
    typeof c.apiKey === "string" &&
    c.apiKey.trim().length > 15 &&
    typeof c.projectId === "string" &&
    c.projectId.trim().length > 2
  );
};

let cachedApp = null;
let cachedAuth = null;
let cachedAnalytics = null;

/**
 * Returns the initialized Firebase App instance
 */
export const getFirebaseApp = () => {
  if (cachedApp) return cachedApp;

  const config = getFirebaseConfig();
  if (!isFirebaseConfigValid(config)) return null;

  try {
    cachedApp = getApps().length > 0 ? getApp() : initializeApp(config);
    return cachedApp;
  } catch (err) {
    console.error("Firebase App initialization error:", err);
    return null;
  }
};

/**
 * Returns the initialized Firebase Auth instance
 */
export const getFirebaseAuth = () => {
  if (cachedAuth) return cachedAuth;

  const app = getFirebaseApp();
  if (!app) return null;

  try {
    cachedAuth = getAuth(app);
    return cachedAuth;
  } catch (err) {
    console.error("Firebase Auth initialization error:", err);
    return null;
  }
};

/**
 * Initializes and returns Firebase Analytics if supported in the current environment
 */
export const initFirebaseAnalytics = async () => {
  if (cachedAnalytics) return cachedAnalytics;

  const app = getFirebaseApp();
  if (!app) return null;

  try {
    const supported = await isSupported();
    if (supported) {
      cachedAnalytics = getAnalytics(app);
      return cachedAnalytics;
    }
  } catch (err) {
    console.warn("Firebase Analytics is not supported in this browser environment:", err);
  }
  return null;
};

/**
 * Resets cached instances (called when config changes)
 */
export const resetFirebaseAuthCache = () => {
  cachedApp = null;
  cachedAuth = null;
  cachedAnalytics = null;
};
