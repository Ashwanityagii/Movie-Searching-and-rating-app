import React, { useState, useCallback } from "react";
import { X, Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, AlertCircle, CheckCircle2, RotateCw, ArrowRight, ChevronLeft } from "lucide-react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useAuthContext } from "../context/useAuthContext";
import { getFirebaseAuth } from "../services/firebaseService";
import CinemaLogo from "./CinemaLogo";

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, loginWithEmail } = useAuthContext();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetState = useCallback(() => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setError("");
    setSuccessMsg("");
    setIsSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    closeLoginModal();
  }, [resetState, closeLoginModal]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setSuccessMsg("");
    setPassword("");
    setConfirmPassword("");
  };

  if (!isLoginModalOpen) return null;

  // Handle Sign In for registered users
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setError("");
    setSuccessMsg("");
    setIsSubmitting(true);

    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error("Authentication service is unavailable. Please check your network.");
      }

      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const firebaseUser = userCredential.user;
      const displayName = firebaseUser.displayName || cleanEmail.split("@")[0];

      loginWithEmail({
        id: firebaseUser.uid,
        name: displayName,
        email: firebaseUser.email || cleanEmail,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=e11d48&color=fff`,
        method: "email"
      });
      handleClose();
    } catch (err) {
      console.error("Firebase Sign In Error:", err);
      let msg = "Failed to sign in. Please verify your email and password.";
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        msg = "Account not found or password incorrect. If you haven't registered yet, please click 'Register' first.";
      } else if (err.code === "auth/wrong-password") {
        msg = "Incorrect password. Please verify your password and try again.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Please enter a valid email address.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Too many failed sign in attempts. Please wait a few minutes before trying again.";
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Registration for new users
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }
    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (confirmPassword && password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setError("");
    setSuccessMsg("");
    setIsSubmitting(true);

    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error("Authentication service is unavailable. Please check your network.");
      }

      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const firebaseUser = userCredential.user;

      try {
        await updateProfile(firebaseUser, { displayName: cleanName });
      } catch (profileErr) {
        console.warn("Could not save displayName to profile:", profileErr);
      }

      loginWithEmail({
        id: firebaseUser.uid,
        name: cleanName,
        email: firebaseUser.email || cleanEmail,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=e11d48&color=fff`,
        method: "email"
      });
      handleClose();
    } catch (err) {
      console.error("Firebase Registration Error:", err);
      let msg = "Failed to register. Please check your details and try again.";
      if (err.code === "auth/email-already-in-use") {
        msg = "This email is already registered! Please switch to 'Sign In' to log in with your password.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Please enter a valid email address.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password is too weak. Please use at least 6 characters.";
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem"
      }}
    >
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#0c101a",
          border: "1px solid var(--border-glass-hover)",
          borderRadius: "var(--radius-lg)",
          padding: "2rem",
          boxShadow: "0 25px 60px rgba(0,0,0,0.9)",
          position: "relative",
          maxHeight: "92vh",
          overflowY: "auto"
        }}
      >
        {/* Back Button (only in register mode) */}
        {mode === "register" && (
          <button
            onClick={() => switchMode("login")}
            className="btn-icon"
            style={{ position: "absolute", top: "1.25rem", left: "1.25rem", width: "36px", height: "36px" }}
            aria-label="Back to Sign In"
            title="Back to Sign In"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="btn-icon"
          style={{ position: "absolute", top: "1.25rem", right: "1.25rem", width: "36px", height: "36px" }}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
            <CinemaLogo size={56} />
          </div>
          <h3 style={{ fontSize: "1.45rem", margin: "0 0 0.3rem 0", fontWeight: 800 }}>
            {mode === "login" ? "Sign In to CinemaSathi" : "Create Your Account"}
          </h3>
          <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", margin: 0 }}>
            {mode === "login"
              ? "Enter your email & password to access your ratings and watchlist"
              : "Register once with your email & password to start rating movies"}
          </p>
        </div>


        {/* Error Notification Banner */}
        {error && (
          <div
            style={{
              padding: "0.85rem 1rem",
              borderRadius: "var(--radius-md)",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              color: "#f87171",
              fontSize: "0.85rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.45rem",
              marginBottom: "1.2rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>{error}</span>
            </div>

            {/* Quick Switch Helper inside Error Banner */}
            {mode === "login" && error.includes("haven't registered yet") && (
              <button
                type="button"
                onClick={() => switchMode("register")}
                style={{
                  alignSelf: "flex-start",
                  marginLeft: "1.5rem",
                  padding: "0.3rem 0.75rem",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(239, 68, 68, 0.25)",
                  color: "#ffffff",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  cursor: "pointer"
                }}
              >
                Switch to Register Now &rarr;
              </button>
            )}

            {mode === "register" && error.includes("already registered") && (
              <button
                type="button"
                onClick={() => switchMode("login")}
                style={{
                  alignSelf: "flex-start",
                  marginLeft: "1.5rem",
                  padding: "0.3rem 0.75rem",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(239, 68, 68, 0.25)",
                  color: "#ffffff",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  cursor: "pointer"
                }}
              >
                Switch to Sign In &rarr;
              </button>
            )}
          </div>
        )}

        {/* Success Message Banner */}
        {successMsg && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#34d399",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1.2rem"
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= MODE 1: SIGN IN ================= */}
        {mode === "login" && (
          <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {/* Email Input */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: "0.45rem"
                }}
              >
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  id="login-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "0.8rem 1rem 0.8rem 2.5rem",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid var(--border-glass-hover)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.95rem",
                    outline: "none"
                  }}
                />
                <Mail
                  size={16}
                  style={{
                    position: "absolute",
                    left: "0.9rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)"
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: "0.45rem"
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: "100%",
                    padding: "0.8rem 2.8rem 0.8rem 2.5rem",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid var(--border-glass-hover)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.95rem",
                    outline: "none"
                  }}
                />
                <Lock
                  size={16}
                  style={{
                    position: "absolute",
                    left: "0.9rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "0.85rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: 0
                  }}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Sign In Button */}
            <button
              type="submit"
              id="signin-submit-btn"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                marginTop: "0.4rem",
                padding: "0.85rem",
                fontSize: "0.95rem",
                fontWeight: 700,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? (
                <>
                  <RotateCw size={17} className="spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn size={17} />
                  <span>Sign In</span>
                </>
              )}
            </button>

            {/* Switch to Register link */}
            <div style={{ textAlign: "center", marginTop: "0.6rem" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Not registered yet?{" "}
              </span>
              <button
                type="button"
                onClick={() => switchMode("register")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--accent-gold)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  textDecoration: "underline"
                }}
              >
                Register here &rarr;
              </button>
            </div>
          </form>
        )}

        {/* ================= MODE 2: REGISTER ================= */}
        {mode === "register" && (
          <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {/* Full Name Input */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: "0.45rem"
                }}
              >
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  id="register-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ashwani Tyagi"
                  required
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "0.8rem 1rem 0.8rem 2.5rem",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid var(--border-glass-hover)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.95rem",
                    outline: "none"
                  }}
                />
                <User
                  size={16}
                  style={{
                    position: "absolute",
                    left: "0.9rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)"
                  }}
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: "0.45rem"
                }}
              >
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  id="register-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{
                    width: "100%",
                    padding: "0.8rem 1rem 0.8rem 2.5rem",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid var(--border-glass-hover)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.95rem",
                    outline: "none"
                  }}
                />
                <Mail
                  size={16}
                  style={{
                    position: "absolute",
                    left: "0.9rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)"
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: "0.45rem"
                }}
              >
                Password <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>(min 6 characters)</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="register-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  style={{
                    width: "100%",
                    padding: "0.8rem 2.8rem 0.8rem 2.5rem",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid var(--border-glass-hover)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.95rem",
                    outline: "none"
                  }}
                />
                <Lock
                  size={16}
                  style={{
                    position: "absolute",
                    left: "0.9rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "0.85rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: 0
                  }}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: "0.45rem"
                }}
              >
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="register-confirm-password-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  style={{
                    width: "100%",
                    padding: "0.8rem 1rem 0.8rem 2.5rem",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid var(--border-glass-hover)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.95rem",
                    outline: "none"
                  }}
                />
                <Lock
                  size={16}
                  style={{
                    position: "absolute",
                    left: "0.9rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)"
                  }}
                />
              </div>
            </div>

            {/* Submit Register Button */}
            <button
              type="submit"
              id="register-submit-btn"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                marginTop: "0.4rem",
                padding: "0.85rem",
                fontSize: "0.95rem",
                fontWeight: 700,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? (
                <>
                  <RotateCw size={17} className="spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus size={17} />
                  <span>Create Account & Sign In</span>
                </>
              )}
            </button>

            {/* Switch to Sign In link */}
            <div style={{ textAlign: "center", marginTop: "0.6rem" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Already registered?{" "}
              </span>
              <button
                type="button"
                onClick={() => switchMode("login")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--accent-gold)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  textDecoration: "underline"
                }}
              >
                Sign In here &rarr;
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
