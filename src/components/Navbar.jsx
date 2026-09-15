import React from "react";
import { Film, Bookmark, Star, Flame, Settings, Menu, X, Clapperboard } from "lucide-react";

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

      {/* Voltage Animated SVG Border Sparks */}
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 234.6 61.3"
        preserveAspectRatio="none"
      >
        <filter id={`glow-${item.id}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <path
          className="line-1"
          d="m216.3 5.2c-0.1-0.1-0.2-0.2-0.4-0.2h-197.3c-10 0-18.2 8.1-18.2 18.2v15c0 10 8.2 18.2 18.2 18.2h197.3c10 0 18.2-8.1 18.2-18.2v-15c0-10-8.2-18.2-18.2-18.2z"
          fill="none"
          strokeWidth="3.5"
          style={{ filter: `url(#glow-${item.id})` }}
        />
        <path
          className="line-2"
          d="m216.3 5.2c-0.1-0.1-0.2-0.2-0.4-0.2h-197.3c-10 0-18.2 8.1-18.2 18.2v15c0 10 8.2 18.2 18.2 18.2h197.3c10 0 18.2-8.1 18.2-18.2v-15c0-10-8.2-18.2-18.2-18.2z"
          fill="none"
          strokeWidth="3.5"
          style={{ filter: `url(#glow-${item.id})` }}
        />
      </svg>

      {/* Floating Spark Dots */}
      <div className="dots">
        <div className="dot dot-1" />
        <div className="dot dot-2" />
        <div className="dot dot-3" />
        <div className="dot dot-4" />
        <div className="dot dot-5" />
      </div>
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

  const navItems = [
    { id: "explore", label: "Explore", icon: Film },
    { id: "trending", label: "Trending", icon: Flame },
    { id: "topRated", label: "Top Rated", icon: Star },
    {
      id: "watchlist",
      label: "Watchlist",
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
        {/* Brand Logo */}
        <div
          onClick={() => {
            setActiveTab("explore");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            cursor: "pointer",
            userSelect: "none"
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #e11d48, #f59e0b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 15px rgba(225, 29, 72, 0.4)"
            }}
          >
            <Film size={22} color="#ffffff" strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "1.45rem",
                  letterSpacing: "-0.03em",
                  color: "#ffffff"
                }}
              >
                Cinema<span style={{ color: "var(--accent-gold)" }}>Sathi</span>
              </span>
            </div>
            <div
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                marginTop: "-2px"
              }}
            >
              सिनेमा साथी &bull; Movie Companion
            </div>
          </div>
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
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </nav>

        {/* Right Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* API Voltage Button */}
          <div className="voltage-button">
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
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 234.6 61.3"
              preserveAspectRatio="none"
            >
              <filter id="glow-api">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <path
                className="line-1"
                d="m216.3 5.2c-0.1-0.1-0.2-0.2-0.4-0.2h-197.3c-10 0-18.2 8.1-18.2 18.2v15c0 10 8.2 18.2 18.2 18.2h197.3c10 0 18.2-8.1 18.2-18.2v-15c0-10-8.2-18.2-18.2-18.2z"
                fill="none"
                strokeWidth="3.5"
                style={{ filter: "url(#glow-api)" }}
              />
              <path
                className="line-2"
                d="m216.3 5.2c-0.1-0.1-0.2-0.2-0.4-0.2h-197.3c-10 0-18.2 8.1-18.2 18.2v15c0 10 8.2 18.2 18.2 18.2h197.3c10 0 18.2-8.1 18.2-18.2v-15c0-10-8.2-18.2-18.2-18.2z"
                fill="none"
                strokeWidth="3.5"
                style={{ filter: "url(#glow-api)" }}
              />
            </svg>
            <div className="dots">
              <div className="dot dot-1" />
              <div className="dot dot-2" />
              <div className="dot dot-3" />
            </div>
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
