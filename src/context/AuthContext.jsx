import React, { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./authContextDef";
import {
  getStoredUser,
  saveUserSession,
  clearUserSession
} from "../services/authService";
import {
  getFirebaseConfig,
  saveFirebaseConfig,
  isFirebaseConfigValid,
  resetFirebaseAuthCache
} from "../services/firebaseService";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [firebaseConfig, setFirebaseConfig] = useState(() => getFirebaseConfig());

  useEffect(() => {
    const handleConfigUpdate = () => {
      setFirebaseConfig(getFirebaseConfig());
    };
    window.addEventListener("firebase_config_updated", handleConfigUpdate);
    return () => window.removeEventListener("firebase_config_updated", handleConfigUpdate);
  }, []);

  const hasFirebaseConfig = isFirebaseConfigValid(firebaseConfig);

  const updateFirebaseConfig = useCallback((newConfig) => {
    resetFirebaseAuthCache();
    saveFirebaseConfig(newConfig);
    setFirebaseConfig(newConfig);
  }, []);

  const loginWithGoogle = useCallback((customProfile = null) => {
    const profile = customProfile || {
      id: "usr_google_" + Date.now(),
      name: "Cinema Sathi Member",
      email: "user.cinemasathi@gmail.com",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
      method: "google"
    };
    saveUserSession(profile);
    setUser(profile);
    setIsLoginModalOpen(false);
  }, []);

  const loginWithEmail = useCallback((userProfile) => {
    saveUserSession(userProfile);
    setUser(userProfile);
    setIsLoginModalOpen(false);
  }, []);

  const loginWithPhone = useCallback((phoneNumber) => {
    const cleanPhone = (phoneNumber || "+91 98765 43210").trim();
    const lastDigits = cleanPhone.replace(/\D/g, "").slice(-4) || "8888";
    const profile = {
      id: "usr_phone_" + Date.now(),
      name: `Member (${lastDigits})`,
      phone: cleanPhone,
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80",
      method: "phone"
    };
    saveUserSession(profile);
    setUser(profile);
    setIsLoginModalOpen(false);
  }, []);

  const logout = useCallback(() => {
    clearUserSession();
    setUser(null);
  }, []);

  const contextValue = {
    user,
    isLoginModalOpen,
    openLoginModal: () => setIsLoginModalOpen(true),
    closeLoginModal: () => setIsLoginModalOpen(false),
    loginWithEmail,
    loginWithGoogle,
    loginWithPhone,
    logout,
    hasFirebaseConfig,
    firebaseConfig,
    updateFirebaseConfig
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
