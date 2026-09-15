import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Navbar from "./components/Navbar";
import HeroBanner from "./components/HeroBanner";
import FilterBar from "./components/FilterBar";
import MovieCard from "./components/MovieCard";
import MovieModal from "./components/MovieModal";
import TrailerModal from "./components/TrailerModal";
import SettingsModal from "./components/SettingsModal";
import WatchlistView from "./components/WatchlistView";
import Toast from "./components/Toast";
import { FEATURED_MOVIES } from "./data/featuredMovies";
import { fetchEndlessMovies } from "./services/movieApi";
import {
  getStoredRatings,
  saveUserRating,
  getStoredReviews,
  addReview,
  getStoredWatchlist,
  toggleWatchlist,
  getStoredFavorites,
  toggleFavorite
} from "./services/storage";
import { Film, Sparkles, RefreshCw, Loader2, ArrowDown, Check } from "lucide-react";

export default function App() {
  // Navigation & View Tabs
  const [activeTab, setActiveTab] = useState("explore");

  // Endless Movies State
  const [movies, setMovies] = useState(FEATURED_MOVIES);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [apiSource, setApiSource] = useState("api");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("rating_desc");
  const [minRating, setMinRating] = useState(0);

  // User Interactive State (Persisted)
  const [userRatings, setUserRatings] = useState(() => getStoredRatings());
  const [reviews, setReviews] = useState(() => getStoredReviews());
  const [watchlist, setWatchlist] = useState(() => getStoredWatchlist());
  const [favorites, setFavorites] = useState(() => getStoredFavorites());

  // Modals
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerMovie, setTrailerMovie] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState(null);

  // Debounce & Observer refs
  const debounceTimerRef = useRef(null);
  const sentinelRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  /**
   * Loads movies for a given page, query, and genre
   */
  const loadMovies = useCallback(
    async (pageNum, query, genre, isNewSearch = false) => {
      if (isNewSearch) {
        setIsLoadingInitial(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const result = await fetchEndlessMovies({
          query,
          genre,
          page: pageNum
        });

        if (result && Array.isArray(result.movies)) {
          setMovies((prev) => {
            if (isNewSearch) {
              // Combine with featured if on page 1 with no query
              if (!query.trim() && pageNum === 1 && genre === "All") {
                const combined = [...FEATURED_MOVIES, ...result.movies];
                return combined.filter(
                  (m, idx, arr) => arr.findIndex((x) => x.imdbID === m.imdbID) === idx
                );
              }
              return result.movies;
            } else {
              // Append and deduplicate by imdbID
              const combined = [...prev, ...result.movies];
              return combined.filter(
                (m, idx, arr) => arr.findIndex((x) => x.imdbID === m.imdbID) === idx
              );
            }
          });

          setHasMore(result.hasMore);
          setApiSource(result.source);
        }
      } catch (err) {
        console.error("Failed to load endless movies:", err);
      } finally {
        setIsLoadingInitial(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  // Handle Query & Genre Changes with debounce
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      loadMovies(1, searchQuery, selectedGenre, true);
    }, 450);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery, selectedGenre, loadMovies]);

  // Load next page of endless movies
  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !hasMore || isLoadingInitial) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadMovies(nextPage, searchQuery, selectedGenre, false);
  }, [isLoadingMore, hasMore, isLoadingInitial, page, searchQuery, selectedGenre, loadMovies]);

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMore && !isLoadingMore && !isLoadingInitial) {
          handleLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "300px", // Trigger before reaching absolute bottom
        threshold: 0.1
      }
    );

    observer.observe(sentinel);
    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [handleLoadMore, hasMore, isLoadingMore, isLoadingInitial]);

  // Handle Tab Switch Actions
  useEffect(() => {
    if (activeTab === "topRated") {
      setMinRating(8.5);
      setSelectedGenre("All");
    } else if (activeTab === "trending") {
      setMinRating(0);
      setSelectedGenre("All");
      setSortBy("rating_desc");
    }
  }, [activeTab]);

  // Filtering & Sorting on the currently loaded stream
  const filteredMovies = useMemo(() => {
    let result = [...movies];

    // Filter by Minimum Rating
    if (minRating > 0) {
      result = result.filter((m) => {
        const rating = parseFloat(m.imdbRating) || 0;
        return rating >= minRating;
      });
    }

    // Sort
    result.sort((a, b) => {
      const ratingA = parseFloat(a.imdbRating) || 0;
      const ratingB = parseFloat(b.imdbRating) || 0;
      const yearA = parseInt(a.year, 10) || 0;
      const yearB = parseInt(b.year, 10) || 0;

      switch (sortBy) {
        case "rating_desc":
          return ratingB - ratingA;
        case "rating_asc":
          return ratingA - ratingB;
        case "year_desc":
          return yearB - yearA;
        case "year_asc":
          return yearA - yearB;
        case "title_asc":
          return (a.title || "").localeCompare(b.title || "");
        default:
          return 0;
      }
    });

    return result;
  }, [movies, minRating, sortBy]);

  // User Actions
  const handleRateMovie = (imdbID, score) => {
    const updated = saveUserRating(imdbID, score);
    setUserRatings({ ...updated });
    showToast(`Rated ${score}/10! Thank you for your verdict.`, "star");
  };

  const handleToggleWatchlist = (imdbID) => {
    const updated = toggleWatchlist(imdbID);
    setWatchlist([...updated]);
    const added = updated.includes(imdbID);
    showToast(
      added ? "Added to your Watchlist!" : "Removed from your Watchlist.",
      "watchlist"
    );
  };

  const handleToggleFavorite = (imdbID) => {
    const updated = toggleFavorite(imdbID);
    setFavorites([...updated]);
    const added = updated.includes(imdbID);
    showToast(
      added ? "Saved to your Favorites!" : "Removed from your Favorites.",
      "success"
    );
  };

  const handleAddReview = (newReview) => {
    const updated = addReview(newReview);
    setReviews([...updated]);
    showToast("Your review has been published to the community!", "success");
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedGenre("All");
    setMinRating(0);
    setSortBy("rating_desc");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Toast notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        watchlistCount={watchlist.length}
        ratedCount={Object.keys(userRatings).length}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main View Router */}
      <main style={{ flexGrow: 1 }}>
        {activeTab === "watchlist" ? (
          <WatchlistView
            type="watchlist"
            movies={FEATURED_MOVIES.concat(movies).filter(
              (m, idx, arr) => arr.findIndex((x) => x.imdbID === m.imdbID) === idx
            )}
            userRatings={userRatings}
            watchlist={watchlist}
            favorites={favorites}
            onSelectMovie={setSelectedMovie}
            onToggleWatchlist={handleToggleWatchlist}
            onToggleFavorite={handleToggleFavorite}
            onWatchTrailer={setTrailerMovie}
            onExploreClick={() => setActiveTab("explore")}
          />
        ) : activeTab === "myRatings" ? (
          <WatchlistView
            type="myRatings"
            movies={FEATURED_MOVIES.concat(movies).filter(
              (m, idx, arr) => arr.findIndex((x) => x.imdbID === m.imdbID) === idx
            )}
            userRatings={userRatings}
            watchlist={watchlist}
            favorites={favorites}
            onSelectMovie={setSelectedMovie}
            onToggleWatchlist={handleToggleWatchlist}
            onToggleFavorite={handleToggleFavorite}
            onWatchTrailer={setTrailerMovie}
            onExploreClick={() => setActiveTab("explore")}
          />
        ) : (
          <>
            {/* Hero Spotlight (shown on Explore and Trending when not searching) */}
            {!searchQuery && activeTab !== "topRated" && (
              <HeroBanner
                movies={FEATURED_MOVIES}
                onSelectMovie={setSelectedMovie}
                onWatchTrailer={setTrailerMovie}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
              />
            )}

            {/* Catalog & Search Section */}
            <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "5rem" }}>
              {/* Filter and Search Bar */}
              <FilterBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedGenre={selectedGenre}
                setSelectedGenre={setSelectedGenre}
                sortBy={sortBy}
                setSortBy={setSortBy}
                minRating={minRating}
                setMinRating={setMinRating}
                onResetFilters={handleResetFilters}
                isLiveApiSearching={isLoadingInitial}
                source={apiSource}
              />

              {/* Section Title & Live Endless Counter */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  marginBottom: "1.5rem"
                }}
              >
                <div>
                  <h2 style={{ fontSize: "1.5rem", margin: 0 }}>
                    {searchQuery
                      ? `Live Results for "${searchQuery}"`
                      : activeTab === "topRated"
                      ? "Top Rated Cinema Classics"
                      : activeTab === "trending"
                      ? "Trending Blockbusters"
                      : "Endless Cinema Feed"}
                  </h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    Loaded {filteredMovies.length} movies from live movie web API &bull; Scroll down for more
                  </p>
                </div>

                <div
                  className="badge badge-cyan"
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.78rem" }}
                >
                  <Sparkles size={13} />
                  <span>Endless Streaming Active</span>
                </div>
              </div>

              {/* Movies Grid */}
              {isLoadingInitial && movies.length === 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
                    gap: "1.75rem"
                  }}
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="skeleton"
                      style={{
                        paddingTop: "148%",
                        borderRadius: "var(--radius-md)"
                      }}
                    />
                  ))}
                </div>
              ) : filteredMovies.length === 0 ? (
                <div
                  className="glass-panel"
                  style={{
                    padding: "4rem 2rem",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1rem"
                  }}
                >
                  <Film size={48} color="var(--text-muted)" />
                  <h3 style={{ fontSize: "1.3rem", margin: 0 }}>No movies found</h3>
                  <p style={{ maxWidth: "420px", color: "var(--text-secondary)", margin: 0 }}>
                    We couldn't find matches for your current search or filter criteria. Try clearing
                    filters or searching another title.
                  </p>
                  <button onClick={handleResetFilters} className="btn btn-secondary">
                    <RefreshCw size={15} />
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
                      gap: "1.75rem"
                    }}
                  >
                    {filteredMovies.map((movie) => (
                      <MovieCard
                        key={movie.imdbID}
                        movie={movie}
                        userRating={userRatings[movie.imdbID]?.rating}
                        inWatchlist={watchlist.includes(movie.imdbID)}
                        isFavorite={favorites.includes(movie.imdbID)}
                        onSelectMovie={setSelectedMovie}
                        onToggleWatchlist={handleToggleWatchlist}
                        onToggleFavorite={handleToggleFavorite}
                        onWatchTrailer={setTrailerMovie}
                      />
                    ))}
                  </div>

                  {/* Endless Scroll Sentinel & Loading Indicator */}
                  <div
                    ref={sentinelRef}
                    style={{
                      padding: "3rem 1rem",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "1rem",
                      marginTop: "1.5rem"
                    }}
                  >
                    {isLoadingMore ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          color: "var(--accent-gold)",
                          fontWeight: 600,
                          fontSize: "0.95rem"
                        }}
                      >
                        <Loader2 size={24} className="animate-spin" />
                        <span>Streaming next batch of movies from web API...</span>
                      </div>
                    ) : hasMore ? (
                      <button
                        onClick={handleLoadMore}
                        className="btn btn-secondary"
                        style={{
                          padding: "0.75rem 2rem",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.95rem",
                          gap: "0.6rem"
                        }}
                      >
                        <ArrowDown size={18} />
                        Load More Movies
                      </button>
                    ) : (
                      <div
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.85rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem"
                        }}
                      >
                        <Check size={16} color="var(--accent-emerald)" />
                        <span>All available movie titles loaded</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border-glass)",
          background: "rgba(6, 9, 14, 0.95)",
          padding: "3rem 0 2rem 0",
          marginTop: "auto"
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.5rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #e11d48, #f59e0b)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Film size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.15rem" }}>
                Cinema<span style={{ color: "var(--accent-gold)" }}>Sathi</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                सिनेमा साथी &bull; Endless Movie Stream & Rating Portal
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              textAlign: "center"
            }}
          >
            Endless live movie feed powered by OMDb API &bull; Built with React
          </div>

          <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            <button
              onClick={() => setIsSettingsOpen(true)}
              style={{ color: "var(--text-secondary)", cursor: "pointer", background: "none", border: "none" }}
            >
              API Settings
            </button>
            <span>&bull;</span>
            <button
              onClick={() => {
                setActiveTab("explore");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              style={{ color: "var(--text-secondary)", cursor: "pointer", background: "none", border: "none" }}
            >
              Back to Top
            </button>
          </div>
        </div>
      </footer>

      {/* Movie Details & Rating Modal */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          userRating={userRatings[selectedMovie.imdbID]?.rating}
          inWatchlist={watchlist.includes(selectedMovie.imdbID)}
          isFavorite={favorites.includes(selectedMovie.imdbID)}
          reviews={reviews}
          onClose={() => setSelectedMovie(null)}
          onRate={handleRateMovie}
          onToggleWatchlist={handleToggleWatchlist}
          onToggleFavorite={handleToggleFavorite}
          onWatchTrailer={setTrailerMovie}
          onAddReview={handleAddReview}
        />
      )}

      {/* Trailer Player Modal */}
      {trailerMovie && (
        <TrailerModal movie={trailerMovie} onClose={() => setTrailerMovie(null)} />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          onSaveApiKey={() => {
            showToast("API key updated successfully!", "success");
            setPage(1);
            loadMovies(1, searchQuery, selectedGenre, true);
          }}
        />
      )}
    </div>
  );
}
