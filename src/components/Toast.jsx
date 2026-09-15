import React, { useEffect } from "react";
import { CheckCircle2, Bookmark, Star, AlertCircle, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case "star":
        return <Star size={20} color="#f59e0b" fill="#f59e0b" />;
      case "watchlist":
        return <Bookmark size={20} color="#06b6d4" fill="#06b6d4" />;
      case "error":
        return <AlertCircle size={20} color="#ef4444" />;
      default:
        return <CheckCircle2 size={20} color="#10b981" />;
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "0.85rem",
        padding: "0.85rem 1.25rem",
        background: "rgba(18, 24, 38, 0.95)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "var(--radius-md)",
        boxShadow: "0 12px 30px rgba(0,0,0,0.6)",
        animation: "fadeIn 0.25s ease-out forwards",
        maxWidth: "420px"
      }}
    >
      <div style={{ flexShrink: 0 }}>{getIcon()}</div>
      <div style={{ flexGrow: 1, fontSize: "0.9rem", color: "var(--text-primary)" }}>
        {toast.message}
      </div>
      <button
        onClick={onClose}
        aria-label="Close notification"
        style={{
          background: "transparent",
          border: "none",
          color: "var(--text-muted)",
          cursor: "pointer",
          display: "flex",
          padding: "4px"
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
