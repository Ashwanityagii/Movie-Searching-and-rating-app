import React, { useState } from "react";
import { X, Key, CheckCircle, RefreshCw, Database, Sparkles } from "lucide-react";
import { getApiKey, setApiKey } from "../services/movieApi";

export default function SettingsModal({ onClose, onSaveApiKey }) {
  const currentKey = getApiKey();
  const [apiKeyInput, setApiKeyInput] = useState(currentKey);
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
          message: "Connection Successful! Live movie API is active."
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

  const handleSave = () => {
    setApiKey(apiKeyInput);
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
          maxWidth: "520px",
          background: "#0f1422",
          border: "1px solid var(--border-glass-hover)",
          borderRadius: "var(--radius-lg)",
          padding: "1.75rem",
          boxShadow: "0 20px 50px rgba(0,0,0,0.8)"
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
              <h3 style={{ fontSize: "1.2rem", margin: 0 }}>Movie API Configuration</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
                Live movie data powered by OMDb API
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: 32, height: 32 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
              OMDb API Key
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
              marginTop: "0.5rem"
            }}
          >
            <button
              type="button"
              onClick={handleResetDefault}
              className="btn btn-secondary"
              style={{ fontSize: "0.8rem", padding: "0.5rem 0.85rem" }}
            >
              <RefreshCw size={14} />
              Reset Default Key
            </button>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="btn btn-secondary"
              style={{ fontSize: "0.8rem", padding: "0.5rem 0.85rem" }}
            >
              <Sparkles size={14} />
              {isTesting ? "Testing..." : "Test Connection"}
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
