import React, { useEffect } from "react";
import { X, ExternalLink, Play } from "lucide-react";

export default function TrailerModal({ movie, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!movie) return null;

  const youtubeUrl = movie.trailerId
    ? `https://www.youtube.com/embed/${movie.trailerId}?autoplay=1&rel=0`
    : null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(12px)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        animation: "fadeIn 0.25s ease-out"
      }}
    >
      <div
        className="modal-content glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "960px",
          background: "#0c101a",
          border: "1px solid var(--border-glass-hover)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          boxShadow: "0 25px 60px -15px rgba(0,0,0,0.9)"
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1.5rem",
            borderBottom: "1px solid var(--border-glass)",
            background: "rgba(255, 255, 255, 0.02)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-full)",
                background: "rgba(225, 29, 72, 0.2)",
                color: "#e11d48",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Play size={16} fill="#e11d48" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem", margin: 0 }}>{movie.title}</h3>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Official Trailer &bull; {movie.year}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close trailer"
            className="btn-icon"
            style={{ width: 36, height: 36 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Video Player */}
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingBottom: "56.25%", // 16:9 aspect ratio
            background: "#000"
          }}
        >
          {youtubeUrl ? (
            <iframe
              src={youtubeUrl}
              title={`${movie.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: 0
              }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1.2rem",
                padding: "2rem",
                textAlign: "center"
              }}
            >
              <p style={{ color: "var(--text-secondary)", maxWidth: "460px" }}>
                Direct embed preview is not available for this title from the API. You can watch
                the official trailer directly on YouTube!
              </p>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                  `${movie.title} ${movie.year} official trailer`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-crimson"
              >
                <ExternalLink size={18} />
                Watch on YouTube
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
