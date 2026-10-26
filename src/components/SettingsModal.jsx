import React, { useState } from "react";
import { X, Key, CheckCircle, RefreshCw, Database, Sparkles, Flame, ShieldCheck } from "lucide-react";
import { getApiKey, setApiKey } from "../services/movieApi";
import {
  getFirebaseConfig,
  saveFirebaseConfig,
  isFirebaseConfigValid,
  resetFirebaseAuthCache
} from "../services/firebaseService";

export default function SettingsModal({ onClose, onSaveApiKey }) {
  const currentMovieKey = getApiKey();
  const [apiKeyInput, setApiKeyInput] = useState(currentMovieKey);

  // Firebase state
  const initialFb = getFirebaseConfig();
  const [fbApiKey, setFbApiKey] = useState(initialFb.apiKey || "");
  const [fbProjectId, setFbProjectId] = useState(initialFb.projectId || "");
  const [fbAuthDomain, setFbAuthDomain] = useState(initialFb.authDomain || "");
  const [fbAppId, setFbAppId] = useState(initialFb.appId || "");
  const [rawConfigJson, setRawConfigJson] = useState("");
  const [showJsonPaste, setShowJsonPaste] = useState(false);

  const [testStatus, setTestStatus] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus(null);
    try {
      const testKey = apiKeyInput.trim();
      const res = await fetch(`https://www.omdbapi.com/?s=Matrix&apikey=${testKey}`);
      const data = await res.json();
      if (data.Response === "True") {
        setTestStatus({
          success: true,
          message: "Connection Successful! Live movie database is active."
        });
      } else {
        setTestStatus({
          success: false,
          message: data.Error || "API key rejected."
        });
      }
    } catch (err) {
      setTestStatus({
        success: false,
        message: "Network error connecting to movie database."
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleParseJson = () => {
    if (!rawConfigJson.trim()) return;
    try {
      let clean = rawConfigJson.trim();
      if (clean.includes("=")) {
        clean = clean.substring(clean.indexOf("=") + 1).trim();
      }
      if (clean.endsWith(";")) {
        clean = clean.slice(0, -1).trim();
      }
      const parsed = JSON.parse(
        clean.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":').replace(/'/g, '"')
      );
      if (parsed.apiKey) setFbApiKey(parsed.apiKey);
      if (parsed.projectId) setFbProjectId(parsed.projectId);
      if (parsed.authDomain) setFbAuthDomain(parsed.authDomain);
      if (parsed.appId) setFbAppId(parsed.appId);
      setShowJsonPaste(false);
      setRawConfigJson("");
    } catch (e) {
      alert("Invalid JSON format. Please copy and paste the firebaseConfig object from Firebase console.");
    }
  };

  const handleSave = () => {
    setApiKey(apiKeyInput);

    if (fbApiKey.trim() && fbProjectId.trim()) {
      const config = {
        apiKey: fbApiKey.trim(),
        projectId: fbProjectId.trim(),
        authDomain: fbAuthDomain.trim() || `${fbProjectId.trim()}.firebaseapp.com`,
        appId: fbAppId.trim()
      };
      resetFirebaseAuthCache();
      saveFirebaseConfig(config);
    }

    if (onSaveApiKey) onSaveApiKey(apiKeyInput);
    onClose();
  };

  const handleResetDefault = () => {
    setApiKey("b9bd48a6");
    setApiKeyInput("b9bd48a6");
    setTestStatus({
      success: true,
      message: "Reset to default working public key (b9bd48a6)."
    });
  };

  const currentFbConfig = {
    apiKey: fbApiKey,
    projectId: fbProjectId
  };
  const isFbValid = isFirebaseConfigValid(currentFbConfig);

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(10px)",
        zIndex: 1000,
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
          maxWidth: "540px",
          background: "#0f1422",
          border: "1px solid var(--border-glass-hover)",
          borderRadius: "var(--radius-lg)",
          padding: "1.75rem",
          boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
          maxHeight: "90vh",
          overflowY: "auto"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-md)",
                background: "rgba(245, 158, 11, 0.15)",
                color: "var(--accent-gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Database size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.2rem", margin: 0 }}>API & Auth Settings</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
                Configure live movie database & Firebase Authentication
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: 32, height: 32 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* SECTION 1: FIREBASE AUTH */}
          <div
            style={{
              padding: "1.1rem",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border-glass)",
              borderRadius: "var(--radius-md)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  color: "var(--text-primary)"
                }}
              >
                <Flame size={17} color="#f59e0b" fill="#e11d48" />
                <span>Firebase Authentication</span>
              </label>

              {fbApiKey.trim() && (
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "0.15rem 0.5rem",
                    borderRadius: "var(--radius-full)",
                    background: isFbValid ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                    color: isFbValid ? "#34d399" : "#f87171",
                    border: `1px solid ${isFbValid ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)"}`
                  }}
                >
                  {isFbValid ? "Config Valid" : "Incomplete"}
                </span>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.76rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>
                  Firebase Web API Key
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    id="settings-firebase-key-input"
                    value={fbApiKey}
                    onChange={(e) => setFbApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem 0.65rem 2.2rem",
                      background: "rgba(0, 0, 0, 0.4)",
                      border: "1px solid var(--border-glass-hover)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-primary)",
                      fontSize: "0.86rem"
                    }}
                  />
                  <Key
                    size={14}
                    style={{
                      position: "absolute",
                      left: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--accent-gold)"
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.76rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>
                  Firebase Project ID
                </label>
                <input
                  type="text"
                  id="settings-firebase-project-input"
                  value={fbProjectId}
                  onChange={(e) => setFbProjectId(e.target.value)}
                  placeholder="e.g. cinemasathi-movies"
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid var(--border-glass-hover)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.86rem"
                  }}
                />
              </div>

              {/* Paste JSON toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowJsonPaste(!showJsonPaste)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--accent-gold)",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0
                  }}
                >
                  {showJsonPaste ? "Hide JSON paste" : "Or paste full firebaseConfig object"}
                </button>

                {showJsonPaste && (
                  <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <textarea
                      rows={4}
                      value={rawConfigJson}
                      onChange={(e) => setRawConfigJson(e.target.value)}
                      placeholder='const firebaseConfig = { apiKey: "AIza...", projectId: "..." };'
                      style={{
                        width: "100%",
                        padding: "0.6rem",
                        background: "rgba(0, 0, 0, 0.6)",
                        border: "1px solid var(--border-glass)",
                        borderRadius: "var(--radius-md)",
                        color: "#fff",
                        fontSize: "0.78rem",
                        fontFamily: "monospace"
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleParseJson}
                      className="btn btn-secondary"
                      style={{ padding: "0.4rem 0.75rem", fontSize: "0.78rem", alignSelf: "flex-end" }}
                    >
                      Auto-fill Fields
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.6rem", lineHeight: 1.4 }}>
              Setup in 1 minute: Go to{" "}
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--accent-gold)", textDecoration: "underline" }}
              >
                console.firebase.google.com
              </a>
              , create a free project, enable <strong>Phone</strong> under <em>Authentication &gt; Sign-in method</em>, and copy the config.
            </p>
          </div>

          {/* SECTION 2: OMDB MOVIE API */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                marginBottom: "0.4rem",
                color: "var(--text-primary)"
              }}
            >
              OMDb Movie API Key
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Enter OMDb API Key (e.g. b9bd48a6)"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem 0.75rem 2.5rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem"
                }}
              />
              <Key
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
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
              A working API key is already configured by default. You can also get a free key from{" "}
              <a
                href="https://www.omdbapi.com/apikey.aspx"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--accent-gold)", textDecoration: "underline" }}
              >
                omdbapi.com
              </a>
              .
            </p>
          </div>

          {testStatus && (
            <div
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: testStatus.success
                  ? "rgba(16, 185, 129, 0.15)"
                  : "rgba(239, 68, 68, 0.15)",
                color: testStatus.success ? "#34d399" : "#f87171",
                border: `1px solid ${
                  testStatus.success ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"
                }`
              }}
            >
              {testStatus.success ? <CheckCircle size={16} /> : <X size={16} />}
              <span>{testStatus.message}</span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.5rem",
              marginTop: "0.2rem"
            }}
          >
            <button
              type="button"
              onClick={handleResetDefault}
              className="btn btn-secondary"
              style={{ fontSize: "0.8rem", padding: "0.5rem 0.85rem" }}
            >
              <RefreshCw size={14} />
              Reset Default Movie Key
            </button>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="btn btn-secondary"
              style={{ fontSize: "0.8rem", padding: "0.5rem 0.85rem" }}
            >
              <Sparkles size={14} />
              {isTesting ? "Testing..." : "Test Movie API"}
            </button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              marginTop: "1.25rem",
              borderTop: "1px solid var(--border-glass)",
              paddingTop: "1rem"
            }}
          >
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
