import React, { useState, useEffect } from "react";
import { X, ExternalLink, Play, Film, Loader2 } from "lucide-react";
import {
  getStaticTrailerId,
  fetchTrailerId,
  buildEmbedUrl,
  buildWatchUrl
} from "../services/trailerService";

export default function TrailerModal({ movie, onClose }) {
  const staticId = getStaticTrailerId(movie);
  const [dynamicTrailerId, setDynamicTrailerId] = useState(null);
  const [isLoading, setIsLoading] = useState(!staticId);
  const [hasFailed, setHasFailed] = useState(false);

  const trailerId = movie?.trailerId || staticId || dynamicTrailerId;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!movie || trailerId) return;

    let isMounted = true;
    fetchTrailerId(movie)
      .then((id) => {
        if (!isMounted) return;
        if (id) {
          setDynamicTrailerId(id);
        } else {
          setHasFailed(true);
        }
      })
      .catch(() => {
        if (isMounted) setHasFailed(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [movie, trailerId]);

  if (!movie) return null;

  const embedUrl = buildEmbedUrl(trailerId);
  const watchUrl = buildWatchUrl(movie, trailerId);

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.88)",
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
          maxWidth: "960px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-glass-hover)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          boxShadow: "0 25px 60px -15px rgba(0,0,0,0.9)",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.85rem 1.25rem",
            borderBottom: "1px solid var(--border-glass)",
            background: "rgba(255, 255, 255, 0.02)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
            <div
              style={{
                width: 34,
                height: 34,
                flexShrink: 0,
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
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  fontSize: "1.05rem",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: "var(--text-primary)"
                }}
              >
                {movie.title}
              </h3>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Official Trailer &bull; {movie.year || "Cinema"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
            {watchUrl && (
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{
                  padding: "0.45rem 0.85rem",
                  fontSize: "0.82rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem"
                }}
                title="Watch directly on YouTube"
              >
                <ExternalLink size={14} />
                <span>Open in YouTube</span>
              </a>
            )}

            <button
              onClick={onClose}
              aria-label="Close trailer"
              className="btn-icon"
              style={{ width: 34, height: 34 }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Video Player Container (16:9) */}
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingBottom: "56.25%", // 16:9 aspect ratio
            background: "#000"
          }}
        >
          {isLoading ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
                padding: "2rem",
                textAlign: "center"
              }}
            >
              <Loader2 size={36} color="var(--accent-crimson)" className="spin" />
              <div>
                <p style={{ color: "#ffffff", fontWeight: 600, fontSize: "1rem", margin: "0 0 0.35rem 0" }}>
                  Finding official trailer for {movie.title}...
                </p>
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  Resolving high definition YouTube player
                </span>
              </div>
            </div>
          ) : embedUrl && !hasFailed ? (
            <iframe
              src={embedUrl}
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
              <Film size={44} color="var(--accent-crimson)" />
              <div>
                <p style={{ color: "#ffffff", fontWeight: 600, fontSize: "1.1rem", margin: "0 0 0.35rem 0" }}>
                  Watch {movie.title} Trailer
                </p>
                <p style={{ color: "var(--text-secondary)", maxWidth: "440px", margin: 0, fontSize: "0.9rem" }}>
                  The publisher restricts playback inside third-party embeds. Click below to stream the official trailer directly on YouTube in HD/4K!
                </p>
              </div>
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-crimson"
                style={{ padding: "0.65rem 1.4rem", fontSize: "0.95rem" }}
              >
                <ExternalLink size={16} />
                <span>Watch on YouTube.com</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer info & YouTube direct link */}
        <div
          style={{
            padding: "0.75rem 1.25rem",
            background: "rgba(0, 0, 0, 0.4)",
            borderTop: "1px solid var(--border-glass)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
            fontSize: "0.82rem",
            color: "var(--text-muted)"
          }}
        >
          <span>
            {trailerId
              ? "Official HD Trailer &bull; YouTube Player"
              : `Trailer for "${movie.title}"`}
          </span>

          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--accent-crimson)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem"
            }}
          >
            <span>Having playback issues? Watch on YouTube.com</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
