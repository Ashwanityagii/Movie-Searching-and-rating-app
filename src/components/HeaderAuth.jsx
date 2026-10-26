import React, { useState } from "react";
import { LogIn, LogOut, User } from "lucide-react";
import { useAuthContext } from "../context/useAuthContext";

export default function HeaderAuth() {
  const { user, openLoginModal, logout } = useAuthContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (user) {
    return (
      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-label="User profile"
          className="btn-secondary"
          style={{
            padding: "0.35rem 0.75rem 0.35rem 0.45rem",
            fontSize: "0.82rem",
            borderRadius: "var(--radius-full)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            cursor: "pointer"
          }}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                objectFit: "cover"
              }}
            />
          ) : (
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "var(--accent-crimson)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 700
              }}
            >
              <User size={14} />
            </div>
          )}
          <span style={{ maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.name.split(" ")[0]}
          </span>
        </button>

        {dropdownOpen && (
          <div
            className="glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: "120%",
              right: 0,
              minWidth: "190px",
              padding: "0.75rem",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-glass-strong)",
              boxShadow: "0 10px 25px rgba(0,0,0,0.7)",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem"
            }}
          >
            <div style={{ padding: "0.25rem 0.5rem", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem" }}>
              <span style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {user.name}
              </span>
              <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {user.email || user.phone || "Logged in"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                openLoginModal();
              }}
              style={{
                width: "100%",
                padding: "0.5rem 0.6rem",
                background: "rgba(255, 255, 255, 0.06)",
                color: "var(--text-primary)",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.82rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                cursor: "pointer",
                border: "1px solid var(--border-glass)"
              }}
            >
              <LogIn size={14} color="#f59e0b" />
              <span>Switch Account / Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                logout();
              }}
              style={{
                width: "100%",
                padding: "0.5rem 0.6rem",
                background: "rgba(225, 29, 72, 0.1)",
                color: "#fb7185",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.82rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                cursor: "pointer",
                border: "1px solid rgba(225, 29, 72, 0.2)"
              }}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      id="header-login-btn"
      onClick={openLoginModal}
      className="btn btn-crimson"
      title="Login to CinemaSathi"
      style={{
        padding: "0.5rem 1.05rem",
        fontSize: "0.85rem",
        fontWeight: 600,
        borderRadius: "var(--radius-full)",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        cursor: "pointer"
      }}
    >
      <LogIn size={15} />
      <span>Login</span>
    </button>
  );
}
