import React, { useState, useEffect } from "react";
import {
  X,
  Star,
  Play,
  Bookmark,
  Heart,
  Calendar,
  Clock,
  Award,
  Users,
  Film,
  Send,
  MessageSquare,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import StarRating from "./StarRating";
import { fetchMovieDetails } from "../services/movieApi";

export default function MovieModal({
  movie,
  userRating,
  inWatchlist,
  isFavorite,
  reviews = [],
  onClose,
  onRate,
  onToggleWatchlist,
  onToggleFavorite,
  onWatchTrailer,
  onAddReview
}) {
  const [fullMovie, setFullMovie] = useState(movie);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Review form state
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewScore, setReviewScore] = useState(userRating || 8);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [hasSpoilers, setHasSpoilers] = useState(false);
  const [showSpoilerReviews, setShowSpoilerReviews] = useState({});

  useEffect(() => {
    if (!movie) return;
    setFullMovie(movie);

    // If plot or actors is missing or standard short summary, fetch live full details
    if (movie.imdbID && (!movie.actors || movie.actors === "N/A" || !movie.director)) {
      setIsLoadingDetails(true);
      fetchMovieDetails(movie.imdbID)
        .then((details) => {
          if (details) {
            setFullMovie((prev) => ({ ...prev, ...details }));
          }
        })
        .finally(() => {
          setIsLoadingDetails(false);
        });
    }
  }, [movie]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!fullMovie) return null;

  const movieReviews = reviews.filter((r) => r.imdbID === fullMovie.imdbID);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewText.trim() || !reviewTitle.trim()) return;

    onAddReview({
      imdbID: fullMovie.imdbID,
      movieTitle: fullMovie.title,
      author: reviewAuthor.trim() || "Cinema Enthusiast",
      rating: Number(reviewScore),
      title: reviewTitle.trim(),
      text: reviewText.trim(),
      hasSpoilers
    });

    // Also register rating if not already done
    onRate(fullMovie.imdbID, reviewScore);

    // Reset form
    setReviewTitle("");
    setReviewText("");
  };

  const toggleSpoilerReveal = (id) => {
    setShowSpoilerReviews((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 900,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        overflowY: "auto",
        animation: "fadeIn 0.25s ease-out"
      }}
    >
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "920px",
          maxHeight: "92vh",
          overflowY: "auto",
          background: "#0c101a",
          border: "1px solid var(--border-glass-hover)",
          borderRadius: "var(--radius-lg)",
          position: "relative",
          boxShadow: "0 30px 70px rgba(0,0,0,0.9)"
        }}
      >
        {/* Backdrop Banner Header */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "280px",
            backgroundColor: "#070a10",
            overflow: "hidden"
          }}
        >
          <img
            src={fullMovie.backdrop || fullMovie.poster}
            alt={fullMovie.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 30%",
              filter: "brightness(0.55)"
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, #0c101a 0%, rgba(12, 16, 26, 0.6) 60%, rgba(12, 16, 26, 0.3) 100%)"
            }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="btn-icon"
            style={{
              position: "absolute",
              top: "1.25rem",
              right: "1.25rem",
              zIndex: 10,
              background: "rgba(0, 0, 0, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.2)"
            }}
          >
            <X size={20} />
          </button>

          {/* Trailer quick button inside backdrop */}
          <div
            style={{
              position: "absolute",
              bottom: "1.25rem",
              right: "1.5rem",
              display: "flex",
              gap: "0.75rem",
              zIndex: 10
            }}
          >
            <button
              onClick={() => onWatchTrailer(fullMovie)}
              className="btn btn-crimson"
              style={{ padding: "0.65rem 1.25rem" }}
            >
              <Play size={16} fill="#ffffff" />
              Watch Trailer
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div style={{ padding: "1.5rem 2rem 2.5rem 2rem" }}>
          {/* Top layout: Poster + Movie Details */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "2rem",
              marginTop: "-80px",
              position: "relative",
              zIndex: 20,
              marginBottom: "2rem"
            }}
            className="modal-top-section"
          >
            {/* Poster Thumbnail */}
            <div
              style={{
                width: "180px",
                flexShrink: 0,
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                border: "2px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 15px 35px rgba(0,0,0,0.8)",
                background: "#080b11"
              }}
            >
              <img
                src={
                  fullMovie.poster && fullMovie.poster !== "N/A"
                    ? fullMovie.poster
                    : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80"
                }
                alt={fullMovie.title}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>

            {/* Title & Metadata */}
            <div style={{ flexGrow: 1, paddingTop: "1rem" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", flexWrap: "wrap" }}>
                <h2
                  style={{
                    fontSize: "2.1rem",
                    fontWeight: 800,
                    margin: 0,
                    lineHeight: 1.2
                  }}
                >
                  {fullMovie.title}
                </h2>
                <span style={{ fontSize: "1.2rem", color: "var(--text-muted)" }}>
                  ({fullMovie.year})
                </span>
              </div>

              {fullMovie.tagline && (
                <p
                  style={{
                    fontSize: "0.95rem",
                    fontStyle: "italic",
                    color: "var(--accent-gold)",
                    marginTop: "0.25rem",
                    marginBottom: "0.75rem"
                  }}
                >
                  "{fullMovie.tagline}"
                </p>
              )}

              {/* Chips row */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "0.5rem",
                  margin: "0.75rem 0 1.25rem 0"
                }}
              >
                <div className="badge badge-gold">
                  <Star size={14} fill="#fbbf24" strokeWidth={0} />
                  <span>IMDb {fullMovie.imdbRating || "7.5"}/10</span>
                </div>

                {fullMovie.rated && <span className="badge badge-dark">{fullMovie.rated}</span>}
                {fullMovie.runtime && (
                  <span className="badge badge-dark">
                    <Clock size={12} />
                    {fullMovie.runtime}
                  </span>
                )}
                {fullMovie.released && (
                  <span className="badge badge-dark">
                    <Calendar size={12} />
                    {fullMovie.released}
                  </span>
                )}

                {fullMovie.genre &&
                  fullMovie.genre.split(",").map((g) => (
                    <span key={g.trim()} className="badge badge-cyan">
                      {g.trim()}
                    </span>
                  ))}
              </div>

              {/* Action toggles */}
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => onToggleWatchlist(fullMovie.imdbID)}
                  className="btn btn-secondary"
                  style={{
                    color: inWatchlist ? "var(--accent-cyan)" : "var(--text-primary)",
                    borderColor: inWatchlist ? "var(--accent-cyan)" : "var(--border-glass)"
                  }}
                >
                  <Bookmark
                    size={16}
                    fill={inWatchlist ? "var(--accent-cyan)" : "none"}
                    color={inWatchlist ? "var(--accent-cyan)" : "currentColor"}
                  />
                  <span>{inWatchlist ? "Saved in Watchlist" : "Add to Watchlist"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleFavorite(fullMovie.imdbID)}
                  className="btn btn-secondary"
                  style={{
                    color: isFavorite ? "#f43f5e" : "var(--text-primary)",
                    borderColor: isFavorite ? "#f43f5e" : "var(--border-glass)"
                  }}
                >
                  <Heart
                    size={16}
                    fill={isFavorite ? "#f43f5e" : "none"}
                    color={isFavorite ? "#f43f5e" : "currentColor"}
                  />
                  <span>{isFavorite ? "Favorited" : "Favorite"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Rating Section */}
          <div
            className="glass-panel"
            style={{
              padding: "1.25rem 1.5rem",
              marginBottom: "2rem",
              background: "linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(225, 29, 72, 0.08))",
              border: "1px solid rgba(245, 158, 11, 0.25)"
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Sparkles size={18} color="var(--accent-gold)" />
                  <h4 style={{ fontSize: "1.1rem", margin: 0 }}>Your Rating</h4>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  Click the stars to rate this film on a scale of 1 to 10
                </p>
              </div>

              <div>
                <StarRating
                  rating={userRating || 0}
                  onRate={(val) => onRate(fullMovie.imdbID, val)}
                  size={24}
                  showLabel={true}
                />
              </div>
            </div>
          </div>

          {/* Overview / Synopsis */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>Synopsis</h3>
            <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "var(--text-primary)" }}>
              {fullMovie.plot}
            </p>
          </div>

          {/* Cast & Crew Info */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.25rem",
              marginBottom: "2.5rem",
              padding: "1.25rem",
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-glass)"
            }}
          >
            {fullMovie.director && fullMovie.director !== "N/A" && (
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>
                  Director
                </span>
                <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  {fullMovie.director}
                </span>
              </div>
            )}

            {fullMovie.writer && fullMovie.writer !== "N/A" && (
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>
                  Writer(s)
                </span>
                <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  {fullMovie.writer}
                </span>
              </div>
            )}

            {fullMovie.actors && fullMovie.actors !== "N/A" && (
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>
                  Main Cast
                </span>
                <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  {fullMovie.actors}
                </span>
              </div>
            )}

            {fullMovie.awards && fullMovie.awards !== "N/A" && (
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>
                  Awards & Honors
                </span>
                <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#fbbf24" }}>
                  {fullMovie.awards}
                </span>
              </div>
            )}
          </div>

          {/* User Reviews Section */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.25rem"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <MessageSquare size={20} color="var(--accent-gold)" />
                <h3 style={{ fontSize: "1.3rem", margin: 0 }}>
                  Community Reviews & Ratings ({movieReviews.length})
                </h3>
              </div>
            </div>

            {/* Write a review form */}
            <form
              onSubmit={handleSubmitReview}
              className="glass-panel"
              style={{
                padding: "1.5rem",
                marginBottom: "2rem",
                background: "rgba(18, 24, 38, 0.6)",
                border: "1px solid var(--border-glass)"
              }}
            >
              <h4 style={{ fontSize: "1.05rem", marginBottom: "1rem", color: "var(--accent-gold)" }}>
                Share Your Review
              </h4>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1rem"
                }}
                className="review-inputs-grid"
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      marginBottom: "0.3rem"
                    }}
                  >
                    Your Name / Alias
                  </label>
                  <input
                    type="text"
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder="e.g. Suman Karki"
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      background: "rgba(10, 13, 20, 0.7)",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.9rem"
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      marginBottom: "0.3rem"
                    }}
                  >
                    Rating Score: {reviewScore}/10
                  </label>
                  <div style={{ paddingTop: "4px" }}>
                    <StarRating
                      rating={reviewScore}
                      onRate={setReviewScore}
                      size={18}
                      showLabel={false}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    marginBottom: "0.3rem"
                  }}
                >
                  Headline / One-line summary
                </label>
                <input
                  type="text"
                  required
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Cinematic excellence at its highest level!"
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    background: "rgba(10, 13, 20, 0.7)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.9rem"
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    marginBottom: "0.3rem"
                  }}
                >
                  Your Thoughts & Experience
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="What did you love? How was the acting, direction, and background score?"
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    background: "rgba(10, 13, 20, 0.7)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.9rem",
                    resize: "vertical"
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.75rem"
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={hasSpoilers}
                    onChange={(e) => setHasSpoilers(e.target.checked)}
                    style={{ accentColor: "var(--accent-crimson)" }}
                  />
                  <span>Contains Spoilers</span>
                </label>

                <button type="submit" className="btn btn-primary" style={{ padding: "0.6rem 1.4rem" }}>
                  <Send size={15} />
                  Submit Review
                </button>
              </div>
            </form>

            {/* List of reviews */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {movieReviews.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    background: "rgba(255, 255, 255, 0.02)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-muted)"
                  }}
                >
                  No community reviews for this title yet. Be the first to share your verdict!
                </div>
              ) : (
                movieReviews.map((rev) => {
                  const isSpoilerHidden = rev.hasSpoilers && !showSpoilerReviews[rev.id];

                  return (
                    <div
                      key={rev.id}
                      style={{
                        padding: "1.2rem",
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid var(--border-glass)",
                        borderRadius: "var(--radius-md)"
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "0.5rem"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                          <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                            {rev.author}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            &bull; {rev.date}
                          </span>
                        </div>

                        <div className="badge badge-gold" style={{ fontSize: "0.78rem" }}>
                          <Star size={12} fill="#f59e0b" strokeWidth={0} />
                          <span>{rev.rating}/10</span>
                        </div>
                      </div>

                      <h5
                        style={{
                          fontSize: "1rem",
                          fontWeight: 600,
                          marginBottom: "0.4rem",
                          color: "var(--text-primary)"
                        }}
                      >
                        {rev.title}
                      </h5>

                      {isSpoilerHidden ? (
                        <div
                          style={{
                            padding: "0.75rem",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(225, 29, 72, 0.1)",
                            border: "1px solid rgba(225, 29, 72, 0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.85rem",
                              color: "#fb7185",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px"
                            }}
                          >
                            <AlertTriangle size={15} />
                            This review contains spoilers
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleSpoilerReveal(rev.id)}
                            style={{
                              fontSize: "0.8rem",
                              color: "#fff",
                              textDecoration: "underline",
                              background: "none",
                              border: "none",
                              cursor: "pointer"
                            }}
                          >
                            Reveal Spoiler
                          </button>
                        </div>
                      ) : (
                        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", margin: 0 }}>
                          {rev.text}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .modal-top-section {
            flex-direction: column !important;
            align-items: center;
            text-align: center;
            margin-top: -60px !important;
          }
          .review-inputs-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
