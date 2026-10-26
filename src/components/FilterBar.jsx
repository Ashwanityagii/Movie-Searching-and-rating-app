import React from "react";
import { Search, X, SlidersHorizontal, Star, Globe, Sparkles, Flame } from "lucide-react";
import { GENRES } from "../data/featuredMovies";

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  selectedGenre,
  setSelectedGenre,
  sortBy,
  setSortBy,
  minRating,
  setMinRating,
  onResetFilters,
  isLiveApiSearching,
  source,
  activeTab
}) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: "1.25rem 1.5rem",
        marginBottom: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem"
      }}
    >
      {/* Top row: Search input + Sorting + Rating Filter */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "1rem",
          justifyContent: "space-between"
        }}
      >
        {/* Search input container */}
        <div
          style={{
            position: "relative",
            flexGrow: 1,
            minWidth: "260px",
            maxWidth: "600px"
          }}
        >
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: isLiveApiSearching ? "var(--accent-gold)" : "var(--text-muted)",
              transition: "color 0.2s ease"
            }}
          />
          <input
            id="movie-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any movie across web (e.g. Batman, Avatar, Titanic, Oppenheimer)..."
            style={{
              width: "100%",
              padding: "0.8rem 2.75rem 0.8rem 2.85rem",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.95rem",
              color: "var(--text-primary)",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease"
            }}
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              style={{
                position: "absolute",
                right: "0.85rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}
            >
              <X size={16} />
            </button>
          )}

          {isLiveApiSearching && (
            <div
              style={{
                position: "absolute",
                right: "2.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.75rem",
                color: "var(--accent-gold)",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <Sparkles size={12} className="animate-spin" />
              <span>Searching web...</span>
            </div>
          )}
        </div>

        {/* Filters Group: Sort By and Min Rating */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "0.75rem"
          }}
        >
          {/* Live API Tag indicator (hidden per user request) */}
          <div
            className="badge badge-emerald"
            title="Live Web Movie Database connection active"
            style={{ display: "none" }}
          >
            <Globe size={13} />
            <span>Web API Connected</span>
          </div>

          {activeTab === "trending" && (
            <div
              className="badge badge-crimson"
              style={{
                padding: "0.45rem 0.75rem",
                fontSize: "0.78rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <Flame size={13} fill="#e11d48" />
              <span>Trending Blockbusters</span>
            </div>
          )}

          {/* Sort selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "0.55rem 0.85rem",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-glass)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
                fontSize: "0.85rem",
                cursor: "pointer"
              }}
            >
              <option value="popular_desc">Most Popular (Trending)</option>
              <option value="rating_desc">Highest Rated (Top)</option>
              <option value="rating_asc">Lowest Rated</option>
              <option value="year_desc">Newest Releases</option>
              <option value="year_asc">Oldest Classics</option>
              <option value="title_asc">Title (A - Z)</option>
            </select>
          </div>

          {/* Min Rating selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Star size={15} color="#f59e0b" fill="#f59e0b" />
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              style={{
                padding: "0.55rem 0.85rem",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-glass)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-primary)",
                fontSize: "0.85rem",
                cursor: "pointer"
              }}
            >
              <option value={0}>All Ratings</option>
              <option value={7}>7.0+ Stars</option>
              <option value={8}>8.0+ Stars</option>
              <option value={8.5}>8.5+ Masterpieces</option>
            </select>
          </div>

          {(searchQuery || selectedGenre !== "All" || minRating > 0 || sortBy !== "rating_desc") && (
            <button
              onClick={onResetFilters}
              className="btn btn-secondary"
              style={{ fontSize: "0.8rem", padding: "0.45rem 0.8rem" }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Genre Pills */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          overflowX: "auto",
          paddingBottom: "4px"
        }}
        className="genre-pills-container"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.8rem", marginRight: "0.5rem", flexShrink: 0 }}>
          <SlidersHorizontal size={14} />
          <span>Genres:</span>
        </div>
        {GENRES.map((genre) => {
          const isSelected = selectedGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              style={{
                flexShrink: 0,
                padding: "0.4rem 0.9rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.82rem",
                fontWeight: 600,
                background: isSelected
                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                  : "var(--bg-secondary)",
                color: isSelected ? "#000" : "var(--text-secondary)",
                border: isSelected
                  ? "1px solid rgba(245, 158, 11, 0.5)"
                  : "1px solid var(--border-glass)",
                transition: "all 0.2s ease"
              }}
            >
              {genre}
            </button>
          );
        })}
      </div>
    </div>
  );
}
