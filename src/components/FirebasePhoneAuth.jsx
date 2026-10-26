import React, { useState, useEffect, useRef } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { Phone, ArrowRight, ShieldCheck, CheckCircle2, RotateCw, AlertCircle, ChevronLeft } from "lucide-react";
import { getFirebaseAuth } from "../services/firebaseService";

const COUNTRY_CODES = [
  { code: "+91", label: "🇮🇳 India (+91)", digits: 10 },
  { code: "+1", label: "🇺🇸 USA / Canada (+1)", digits: 10 },
  { code: "+44", label: "🇬🇧 UK (+44)", digits: 10 },
  { code: "+971", label: "🇦🇪 UAE (+971)", digits: 9 },
  { code: "+65", label: "🇸🇬 Singapore (+65)", digits: 8 },
  { code: "+61", label: "🇦🇺 Australia (+61)", digits: 9 },
  { code: "+49", label: "🇩🇪 Germany (+49)", digits: 10 }
];

export default function FirebasePhoneAuth({ onComplete, onBack }) {
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [stage, setStage] = useState("input"); // "input" | "otp"
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [resendNotice, setResendNotice] = useState("");
  const [recaptchaKey, setRecaptchaKey] = useState(0);

  const recaptchaContainerRef = useRef(null);
  const recaptchaVerifierRef = useRef(null);
  const otpInputRef = useRef(null);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Focus OTP input when entering OTP stage
  useEffect(() => {
    if (stage === "otp" && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [stage]);

  // Helper to replace the container DOM element so Google reCAPTCHA receives a fresh node
  const recreateContainer = () => {
    const oldContainer =
      document.getElementById("recaptcha-container") ||
      document.getElementById("firebase-recaptcha-container") ||
      recaptchaContainerRef.current;

    if (oldContainer && oldContainer.parentNode) {
      const newContainer = document.createElement("div");
      newContainer.id = "recaptcha-container";
      oldContainer.parentNode.replaceChild(newContainer, oldContainer);
      recaptchaContainerRef.current = newContainer;
      return newContainer;
    }
    return oldContainer;
  };

  // Helper to safely clean up any existing reCAPTCHA instances and DOM widgets
  const cleanupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.warn("Could not clear window.recaptchaVerifier:", e);
      }
      window.recaptchaVerifier = null;
    }

    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch (e) {
        console.warn("Could not clear recaptchaVerifierRef:", e);
      }
      recaptchaVerifierRef.current = null;
    }

    // Replace the DOM container with a fresh element so grecaptcha never encounters an already-used element
    recreateContainer();
    setRecaptchaKey((prev) => prev + 1);
  };

  // Cleanup recaptcha on unmount
  useEffect(() => {
    return () => {
      cleanupRecaptcha();
    };
  }, []);

  const cleanDigits = phoneNumber.replace(/\D/g, "");
  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];
  const fullPhoneNumber = `${countryCode}${cleanDigits}`;

  // Helper to get or create invisible reCAPTCHA verifier
  const getOrCreateRecaptcha = (auth) => {
    // 1. REUSE existing verifier if already initialized
    if (window.recaptchaVerifier) {
      return window.recaptchaVerifier;
    }
    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current;
    }

    // 2. Ensure container is present and fresh
    let container =
      document.getElementById("recaptcha-container") ||
      recaptchaContainerRef.current;

    if (!container) return null;

    try {
      const verifier = new RecaptchaVerifier(auth, container, {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved automatically by invisible badge
        },
        "expired-callback": () => {
          setError("reCAPTCHA expired. Please try sending the SMS code again.");
          cleanupRecaptcha();
        }
      });

      window.recaptchaVerifier = verifier;
      recaptchaVerifierRef.current = verifier;
      return verifier;
    } catch (err) {
      console.warn("RecaptchaVerifier creation threw error, replacing container and retrying:", err);

      // If already rendered on this node, replace with a virgin DOM element and retry
      const freshContainer = recreateContainer();
      if (!freshContainer) throw err;

      const verifier = new RecaptchaVerifier(auth, freshContainer, {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => {
          setError("reCAPTCHA expired. Please try sending the SMS code again.");
          cleanupRecaptcha();
        }
      });

      window.recaptchaVerifier = verifier;
      recaptchaVerifierRef.current = verifier;
      return verifier;
    }
  };

  // Step 1: Send Real Cellular SMS OTP via Firebase
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const auth = getFirebaseAuth();
    if (!auth) {
      setError("Firebase Authentication is not configured yet. Please configure your Firebase keys.");
      return;
    }

    if (cleanDigits.length < (selectedCountry.digits - 1)) {
      setError(`Please enter a valid ${selectedCountry.digits}-digit mobile number.`);
      return;
    }

    setError("");
    setResendNotice("");
    setIsSubmitting(true);

    try {
      const verifier = getOrCreateRecaptcha(auth);
      if (!verifier) {
        throw new Error("Could not initialize reCAPTCHA security verifier.");
      }

      const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, verifier);
      setConfirmationResult(confirmation);
      setStage("otp");
      setCountdown(60);
    } catch (err) {
      console.error("Firebase SMS send error:", err);

      // Clean up on failure so user can retry without "already rendered" error
      cleanupRecaptcha();

      let userMsg = "Failed to send SMS OTP. Please check your number and try again.";
      if (err.code === "auth/invalid-phone-number") {
        userMsg = "The mobile number format is invalid. Please check the number and country code.";
      } else if (err.code === "auth/too-many-requests") {
        userMsg = "Too many SMS requests. Please wait a few minutes before trying again.";
      } else if (err.code === "auth/operation-not-allowed") {
        userMsg = "Phone authentication is not enabled in Firebase. Please enable it in Firebase Console > Authentication > Sign-in method.";
      } else if (err.message && err.message.toLowerCase().includes("already been rendered")) {
        userMsg = "Verification security refreshed. Please tap 'Send Real SMS OTP' again.";
      } else if (err.message) {
        userMsg = err.message;
      }
      setError(userMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify Real SMS OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otpCode.trim();
    if (!code || code.length < 6) {
      setError("Please enter the complete 6-digit verification code received on your phone.");
      return;
    }

    if (!confirmationResult) {
      setError("Session expired. Please request a new SMS verification code.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const credential = await confirmationResult.confirm(code);
      const user = credential.user;
      cleanupRecaptcha();
      onComplete(user.phoneNumber || fullPhoneNumber);
    } catch (err) {
      console.error("Firebase OTP verification error:", err);
      let userMsg = "Invalid verification code. Please check your SMS and try again.";
      if (err.code === "auth/invalid-verification-code") {
        userMsg = "Incorrect 6-digit code. Please verify the code received in your SMS.";
      } else if (err.code === "auth/code-expired") {
        userMsg = "This SMS code has expired. Please click Resend SMS to get a new code.";
      } else if (err.message) {
        userMsg = err.message;
      }
      setError(userMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend SMS OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || isSubmitting) return;
    const auth = getFirebaseAuth();
    if (!auth) return;

    setError("");
    setResendNotice("");
    setIsSubmitting(true);

    try {
      const verifier = getOrCreateRecaptcha(auth);
      if (!verifier) {
        throw new Error("Could not initialize reCAPTCHA security verifier.");
      }
      const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, verifier);
      setConfirmationResult(confirmation);
      setCountdown(60);
      setResendNotice("A fresh SMS verification code has been dispatched!");
    } catch (err) {
      console.error("Firebase resend error:", err);
      // Clean up on failure so user can retry without error
      cleanupRecaptcha();
      setError("Could not resend SMS. Please wait a moment and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Invisible reCAPTCHA container for Firebase security */}
      <div key={recaptchaKey} ref={recaptchaContainerRef} id="recaptcha-container" />

      {/* Header controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <button
          type="button"
          onClick={() => {
            cleanupRecaptcha();
            if (stage === "otp") {
              setStage("input");
              setOtpCode("");
              setError("");
              setResendNotice("");
            } else if (onBack) {
              onBack();
            }
          }}
          className="btn-icon"
          style={{ width: "32px", height: "32px" }}
          title="Go back"
        >
          <ChevronLeft size={18} />
        </button>

        <span
          style={{
            fontSize: "0.76rem",
            fontWeight: 700,
            color: "#10b981",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            background: "rgba(16, 185, 129, 0.12)",
            padding: "0.25rem 0.65rem",
            borderRadius: "var(--radius-full)",
            border: "1px solid rgba(16, 185, 129, 0.25)"
          }}
        >
          <ShieldCheck size={13} />
          Real Firebase SMS Active
        </span>
      </div>

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
            gap: "0.5rem",
            marginBottom: "1rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>{error}</span>
          </div>

          {error.includes("Firebase Console") && (
            <a
              href="https://console.firebase.google.com/project/cinemasathi-ce326/authentication/providers"
              target="_blank"
              rel="noreferrer"
              style={{
                alignSelf: "flex-start",
                marginLeft: "1.5rem",
                padding: "0.3rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                background: "rgba(239, 68, 68, 0.25)",
                color: "#ffffff",
                fontSize: "0.78rem",
                fontWeight: 700,
                textDecoration: "none",
                border: "1px solid rgba(239, 68, 68, 0.4)"
              }}
            >
              Open Firebase Console & Enable Phone &rarr;
            </a>
          )}
        </div>
      )}

      {resendNotice && (
        <div
          style={{
            padding: "0.65rem 0.85rem",
            borderRadius: "var(--radius-md)",
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#34d399",
            fontSize: "0.82rem",
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            marginBottom: "1rem"
          }}
        >
          <CheckCircle2 size={15} />
          <span>{resendNotice}</span>
        </div>
      )}

      {/* ================= STEP 1: ENTER PHONE NUMBER ================= */}
      {stage === "input" && (
        <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
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
              Enter Mobile Number
            </label>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              {/* Country Code Selector */}
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                style={{
                  width: "140px",
                  padding: "0.75rem 0.5rem",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid var(--border-glass-hover)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: "0.86rem",
                  fontWeight: 600,
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code} style={{ background: "#0c101a", color: "#fff" }}>
                    {c.label}
                  </option>
                ))}
              </select>

              {/* Number Input */}
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  type="tel"
                  id="firebase-phone-input"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="98765 43210"
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem 0.75rem 2.4rem",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid var(--border-glass-hover)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    outline: "none"
                  }}
                />
                <Phone
                  size={16}
                  style={{
                    position: "absolute",
                    left: "0.85rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)"
                  }}
                />
              </div>
            </div>

            <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "0.45rem", margin: "0.45rem 0 0 0" }}>
              A real cellular SMS verification code will be sent to your mobile phone via Firebase.
            </p>
          </div>

          <button
            type="submit"
            id="firebase-send-otp-btn"
            disabled={isSubmitting || cleanDigits.length < 8}
            className="btn btn-primary"
            style={{
              padding: "0.85rem",
              fontSize: "0.95rem",
              fontWeight: 700,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              opacity: cleanDigits.length < 8 || isSubmitting ? 0.6 : 1,
              cursor: cleanDigits.length < 8 || isSubmitting ? "not-allowed" : "pointer"
            }}
          >
            {isSubmitting ? (
              <>
                <RotateCw size={17} className="spin" />
                <span>Sending Real SMS OTP...</span>
              </>
            ) : (
              <>
                <span>Send Real SMS OTP</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>
      )}

      {/* ================= STEP 2: VERIFY REAL OTP ================= */}
      {stage === "otp" && (
        <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
            <span style={{ fontSize: "0.86rem", color: "var(--text-secondary)", display: "block" }}>
              SMS OTP sent to
            </span>
            <span
              style={{
                fontSize: "1.05rem",
                fontWeight: 800,
                color: "var(--accent-gold)",
                letterSpacing: "0.03em"
              }}
            >
              {fullPhoneNumber}
            </span>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.84rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: "0.45rem",
                textAlign: "center"
              }}
            >
              Enter 6-Digit SMS Verification Code
            </label>

            <input
              ref={otpInputRef}
              type="text"
              id="firebase-otp-input"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;"
              maxLength={6}
              style={{
                width: "100%",
                padding: "0.85rem 1rem",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid var(--accent-gold)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontSize: "1.5rem",
                fontWeight: 800,
                letterSpacing: "0.45em",
                textAlign: "center",
                outline: "none",
                boxShadow: "0 0 15px rgba(245, 158, 11, 0.2)"
              }}
            />
          </div>

          <button
            type="submit"
            id="firebase-verify-btn"
            disabled={isSubmitting || otpCode.trim().length < 6}
            className="btn btn-primary"
            style={{
              padding: "0.85rem",
              fontSize: "0.95rem",
              fontWeight: 700,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              opacity: otpCode.trim().length < 6 || isSubmitting ? 0.6 : 1,
              cursor: otpCode.trim().length < 6 || isSubmitting ? "not-allowed" : "pointer"
            }}
          >
            {isSubmitting ? (
              <>
                <RotateCw size={17} className="spin" />
                <span>Verifying SMS Code...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                <span>Verify & Login</span>
              </>
            )}
          </button>

          {/* Resend and change number */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.82rem",
              color: "var(--text-muted)",
              paddingTop: "0.5rem",
              borderTop: "1px solid var(--border-glass)"
            }}
          >
            <button
              type="button"
              onClick={() => {
                cleanupRecaptcha();
                setStage("input");
                setOtpCode("");
                setError("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "0.82rem"
              }}
            >
              Change number
            </button>

            <button
              type="button"
              disabled={countdown > 0 || isSubmitting}
              onClick={handleResendOtp}
              style={{
                background: "none",
                border: "none",
                color: countdown > 0 ? "var(--text-muted)" : "var(--accent-gold)",
                cursor: countdown > 0 ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: "0.82rem"
              }}
            >
              {countdown > 0 ? `Resend SMS in ${countdown}s` : "Resend Real SMS"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
