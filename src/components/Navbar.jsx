import React from "react";
import { Film, Bookmark, Star, Flame, Settings, Menu, X, Clapperboard, Sun, Moon } from "lucide-react";
import HeaderAuth from "./HeaderAuth";
import CinemaLogo from "./CinemaLogo";
import brandingImg from "../assets/branding.png";

function VoltageNavButton({ item, isActive, onClick }) {
  const Icon = item.icon;

  return (
    <div className={`voltage-button ${isActive ? "active" : ""}`}>
      <button onClick={onClick} aria-label={item.label}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", position: "relative", zIndex: 2 }}>
          <Icon size={15} color={isActive ? "#6bfeff" : "#f6de8d"} style={{ flexShrink: 0 }} />
          <span>{item.label}</span>
          {item.badge !== null && (
            <span className="voltage-badge">
              {item.badge}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}

export default function Navbar({
  activeTab,
  setActiveTab,
  watchlistCount = 0,
  ratedCount = 0,
  onOpenSettings
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [theme, setTheme] = React.useState(() => {
    return localStorage.getItem("cinemasathi_theme") || "dark";
  });

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("cinemasathi_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const navItems = [
    { id: "explore", label: "Explore", icon: Film },
    { id: "trending", label: "Trending", icon: Flame },
    { id: "topRated", label: "Top Rated", icon: Star },
    {
      id: "watchlist",
      label: "Watch Later",
      icon: Bookmark,
      badge: watchlistCount > 0 ? watchlistCount : null
    },
    {
      id: "myRatings",
      label: "My Ratings",
      icon: Clapperboard,
      badge: ratedCount > 0 ? ratedCount : null
    }
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(8, 11, 17, 0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border-glass)",
        transition: "all 0.3s ease"
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "76px"
        }}
      >
        {/* Brand Logo & Title Lockup */}
        <div
          onClick={() => {
            setActiveTab("explore");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="brand-lockup"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
            cursor: "pointer",
            userSelect: "none"
          }}
        >
          <CinemaLogo size={46} />
          <img
            src={brandingImg}
            alt="Cinema साथी"
            className="brand-title-img"
            style={{
              height: "42px",
              width: "auto",
              objectFit: "contain",
              display: "block"
            }}
          />
        </div>

        {/* Desktop Navigation with Uiverse.io Voltage Buttons */}
        <nav
          style={{
            display: "none",
            alignItems: "center",
            gap: "0.65rem"
          }}
          className="desktop-nav"
        >
          {navItems.map((item) => (
            <VoltageNavButton
              key={item.id}
              item={item}
              isActive={activeTab === item.id}
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          ))}
        </nav>

        {/* Right Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Clerk Authentication */}
          <HeaderAuth />

          {/* Light / Dark Theme Switch Button */}
          <button
            type="button"
            onClick={toggleTheme}
            id="theme-switch-btn"
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="btn-icon"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            }}
          >
            {theme === "dark" ? (
              <Sun size={19} color="#fbbf24" />
            ) : (
              <Moon size={19} color="#6366f1" />
            )}
          </button>

          {/* API Voltage Button (hidden) */}
          <div className="voltage-button" style={{ display: "none" }}>
            <button
              onClick={onOpenSettings}
              title="Configure Movie Database API"
              style={{
                padding: "0.5rem 0.95rem",
                fontSize: "0.82rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem"
              }}
            >
              <Settings size={15} color="#6bfeff" />
              <span>API</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn-icon mobile-menu-btn"
            style={{ width: "40px", height: "40px", display: "none" }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer with Voltage Buttons */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: "1px solid var(--border-glass)",
            background: "rgba(10, 13, 20, 0.98)",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem"
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div
                key={item.id}
                className={`voltage-button ${isActive ? "active" : ""}`}
                style={{ width: "100%" }}
              >
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1.25rem"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Icon size={18} color={isActive ? "#6bfeff" : "#f6de8d"} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span className="voltage-badge">
                      {item.badge}
                    </span>
                  )}
                </button>
              </div>
            );
          })}

          {/* Mobile Auth Action */}
          <div style={{ paddingTop: "0.5rem", borderTop: "1px solid var(--border-glass)", display: "flex", justifyContent: "center" }}>
            <HeaderAuth />
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 860px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
        @media (max-width: 859px) {
          .mobile-menu-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </header>
  );
}
