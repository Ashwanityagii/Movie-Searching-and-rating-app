import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Navbar from "./components/Navbar";
import HeroBanner from "./components/HeroBanner";
import FilterBar from "./components/FilterBar";
import MovieCard from "./components/MovieCard";
import MovieModal from "./components/MovieModal";
import TrailerModal from "./components/TrailerModal";
import SettingsModal from "./components/SettingsModal";
import LoginModal from "./components/LoginModal";
import WatchlistView from "./components/WatchlistView";
import Toast from "./components/Toast";
import CinemaLogo from "./components/CinemaLogo";
import brandingImg from "./assets/branding.png";
import { FEATURED_MOVIES } from "./data/featuredMovies";
import { fetchEndlessMovies } from "./services/movieApi";
import {
  getStoredRatings,
  saveUserRating,
  getStoredReviews,
  addReview,
  getStoredWatchlist,
  getStoredWatchlistMovies,
  toggleWatchlist,
  getStoredFavorites,
  toggleFavorite
} from "./services/storage";
import { Film, Sparkles, RefreshCw, Loader2, ArrowDown, Flame } from "lucide-react";

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

  // State refs to prevent closure staleness during rapid endless scrolling
  const isLoadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);
  const isLoadingInitialRef = useRef(false);
  const pageRef = useRef(1);

  useEffect(() => {
    isLoadingMoreRef.current = isLoadingMore;
    hasMoreRef.current = hasMore;
    isLoadingInitialRef.current = isLoadingInitial;
    pageRef.current = page;
  }, [isLoadingMore, hasMore, isLoadingInitial, page]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  /**
   * Loads movies for a given page, query, genre, and tab
   */
  const loadMovies = useCallback(
    async (pageNum, query, genre, isNewSearch = false, tab = activeTab) => {
      if (isNewSearch) {
        setIsLoadingInitial(true);
      } else {
        setIsLoadingMore(true);
      }

      const isTrending = tab === "trending";

      try {
        const result = await fetchEndlessMovies({
          query,
          genre,
          page: pageNum,
          isTrending
        });

        if (result && Array.isArray(result.movies)) {
          setMovies((prev) => {
            if (isNewSearch) {
              // Combine with featured if on page 1 with no query
              if (!query.trim() && pageNum === 1 && genre === "All") {
                let baseList = [...FEATURED_MOVIES];
                if (isTrending) {
                  baseList.sort((a, b) => {
                    const yearA = parseInt(a.year, 10) || 0;
                    const yearB = parseInt(b.year, 10) || 0;
                    const votesA = parseInt((a.imdbVotes || "0").replace(/,/g, ""), 10) || 0;
                    const votesB = parseInt((b.imdbVotes || "0").replace(/,/g, ""), 10) || 0;
                    const scoreA = (yearA >= 2018 ? 2000000 : 0) + votesA;
                    const scoreB = (yearB >= 2018 ? 2000000 : 0) + votesB;
                    return scoreB - scoreA;
                  });
                }
                const combined = [...baseList, ...result.movies];
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

          const moreAvailable = result.hasMore ?? true;
          setHasMore(moreAvailable);
          hasMoreRef.current = moreAvailable;
          setApiSource(result.source);
        }
      } catch (err) {
        console.error("Failed to load endless movies:", err);
      } finally {
        setIsLoadingInitial(false);
        setIsLoadingMore(false);
      }
    },
    [activeTab]
  );

  // Handle Query & Genre Changes with debounce
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      pageRef.current = 1;
      hasMoreRef.current = true;
      loadMovies(1, searchQuery, selectedGenre, true);
    }, 450);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery, selectedGenre, loadMovies]);

  // Load next page of endless movies
  const handleLoadMore = useCallback(() => {
    if (isLoadingMoreRef.current || isLoadingInitialRef.current || !hasMoreRef.current) return;
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;
    setPage(nextPage);
    loadMovies(nextPage, searchQuery, selectedGenre, false, activeTab);
  }, [searchQuery, selectedGenre, loadMovies, activeTab]);

  // Infinite Scroll IntersectionObserver with 800px preloading margin
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (
          firstEntry.isIntersecting &&
          !isLoadingMoreRef.current &&
          !isLoadingInitialRef.current
        ) {
          handleLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "800px", // Preload smoothly well before reaching the bottom
        threshold: 0.05
      }
    );

    observer.observe(sentinel);
    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [handleLoadMore]);

  // Dual-trigger window scroll listener fallback for continuous endless browsing
  useEffect(() => {
    const handleWindowScroll = () => {
      if (isLoadingMoreRef.current || isLoadingInitialRef.current) return;
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 800;
      if (scrollPosition >= threshold) {
        handleLoadMore();
      }
    };

    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, [handleLoadMore]);

  // Handle Tab Switch Actions
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: "smooth" });

    pageRef.current = 1;
    hasMoreRef.current = true;
    setPage(1);
    setHasMore(true);
    setSearchQuery("");
    setSelectedGenre("All");

    if (tabId === "topRated") {
      setMinRating(8.5);
      setSortBy("rating_desc");
      loadMovies(1, "", "All", true, "topRated");
    } else if (tabId === "trending") {
      setMinRating(0);
      setSortBy("popular_desc");
      loadMovies(1, "", "All", true, "trending");
    } else if (tabId === "explore") {
      setMinRating(0);
      setSortBy("rating_desc");
      loadMovies(1, "", "All", true, "explore");
    }
  }, [loadMovies]);

  // Filtering & Sorting on the currently loaded stream
  const filteredMovies = useMemo(() => {
    let result = [...movies];

    // When searching for a specific query, guarantee only matching movies appear
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((m) =>
        (m.title && m.title.toLowerCase().includes(q)) ||
        (m.actors && m.actors.toLowerCase().includes(q)) ||
        (m.director && m.director.toLowerCase().includes(q)) ||
        (m.genre && m.genre.toLowerCase().includes(q))
      );
    }

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
        case "popular_desc": {
          const votesA = parseInt((a.imdbVotes || "0").replace(/,/g, ""), 10) || 0;
          const votesB = parseInt((b.imdbVotes || "0").replace(/,/g, ""), 10) || 0;
          const scoreA = (yearA >= 2018 ? 2000000 : 0) + votesA;
          const scoreB = (yearB >= 2018 ? 2000000 : 0) + votesB;
          return scoreB - scoreA;
        }
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
  }, [movies, minRating, sortBy, searchQuery]);

  // Auto-fill trigger ONLY in endless browse mode (never when searching for a specific title)
  useEffect(() => {
    if (
      !isLoadingInitial &&
      !isLoadingMore &&
      !searchQuery.trim() &&
      hasMore &&
      filteredMovies.length < 12 &&
      (activeTab === "explore" || activeTab === "trending" || activeTab === "topRated")
    ) {
      const timer = setTimeout(() => {
        handleLoadMore();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [filteredMovies.length, isLoadingInitial, isLoadingMore, activeTab, handleLoadMore, searchQuery, hasMore]);

  // User Actions
  const handleRateMovie = (imdbID, score) => {
    const updated = saveUserRating(imdbID, score);
    setUserRatings({ ...updated });
    showToast(`Rated ${score}/10! Thank you for your verdict.`, "star");
  };

  const handleToggleWatchlist = (movieOrId) => {
    let movieObj = typeof movieOrId === "object" ? movieOrId : null;
    const imdbID = typeof movieOrId === "string" ? movieOrId : movieOrId?.imdbID;

    if (!movieObj && imdbID) {
      movieObj =
        (selectedMovie?.imdbID === imdbID ? selectedMovie : null) ||
        movies.find((m) => m.imdbID === imdbID) ||
        FEATURED_MOVIES.find((m) => m.imdbID === imdbID);
    }

    const updated = toggleWatchlist(movieObj || imdbID);
    setWatchlist([...updated]);
    const added = updated.includes(imdbID);
    showToast(
      added ? "Added to your Watch Later list!" : "Removed from Watch Later.",
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
        setActiveTab={handleTabChange}
        watchlistCount={watchlist.length}
        ratedCount={Object.keys(userRatings).length}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main View Router */}
      <main style={{ flexGrow: 1 }}>
        {activeTab === "watchlist" ? (
          <WatchlistView
            type="watchlist"
            movies={(() => {
              const savedMoviesMap = getStoredWatchlistMovies();
              const savedList = Object.values(savedMoviesMap);
              const allMovies = [...savedList, ...FEATURED_MOVIES, ...movies];
              return allMovies.filter(
                (m, idx, arr) => arr.findIndex((x) => x.imdbID === m.imdbID) === idx
              );
            })()}
            userRatings={userRatings}
            watchlist={watchlist}
            favorites={favorites}
            onSelectMovie={setSelectedMovie}
            onToggleWatchlist={handleToggleWatchlist}
            onToggleFavorite={handleToggleFavorite}
            onWatchTrailer={setTrailerMovie}
            onExploreClick={() => handleTabChange("explore")}
          />
        ) : activeTab === "myRatings" ? (
          <WatchlistView
            type="myRatings"
            movies={(() => {
              const savedMoviesMap = getStoredWatchlistMovies();
              const savedList = Object.values(savedMoviesMap);
              const allMovies = [...savedList, ...FEATURED_MOVIES, ...movies];
              return allMovies.filter(
                (m, idx, arr) => arr.findIndex((x) => x.imdbID === m.imdbID) === idx
              );
            })()}
            userRatings={userRatings}
            watchlist={watchlist}
            favorites={favorites}
            onSelectMovie={setSelectedMovie}
            onToggleWatchlist={handleToggleWatchlist}
            onToggleFavorite={handleToggleFavorite}
            onWatchTrailer={setTrailerMovie}
            onExploreClick={() => handleTabChange("explore")}
          />
        ) : (
          <>
            {/* Hero Spotlight (shown on Explore and Trending when not searching) */}
            {!searchQuery && activeTab !== "topRated" && (
              <HeroBanner
                movies={activeTab === "trending" && filteredMovies.length > 0 ? filteredMovies.slice(0, 8) : FEATURED_MOVIES}
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
                activeTab={activeTab}
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
                  <h2 style={{ fontSize: "1.5rem", margin: 0, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                    {searchQuery ? (
                      `Live Results for "${searchQuery}"`
                    ) : activeTab === "topRated" ? (
                      "Top Rated Cinema Classics"
                    ) : activeTab === "trending" ? (
                      <>
                        <Flame size={22} color="#f59e0b" fill="#e11d48" />
                        <span>Trending Blockbusters</span>
                      </>
                    ) : (
                      "Endless Cinema Feed"
                    )}
                  </h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    {searchQuery.trim()
                      ? `Found ${filteredMovies.length} ${filteredMovies.length === 1 ? "movie" : "movies"} matching your search query`
                      : activeTab === "trending"
                      ? `Ranked by global popularity and viral momentum • Showing ${filteredMovies.length} blockbusters`
                      : `Loaded ${filteredMovies.length} movies from live movie web API • Scroll down for more`}
                  </p>
                </div>

                {/* Endless Streaming Tag (hidden per user request) */}
                <div
                  className="badge badge-cyan"
                  style={{ display: "none" }}
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
                    {filteredMovies.map((movie, idx) => (
                      <MovieCard
                        key={movie.imdbID}
                        movie={movie}
                        ranking={activeTab === "trending" && !searchQuery ? idx + 1 : undefined}
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
                  {hasMore ? (
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
                      ) : (
                        <button
                          onClick={handleLoadMore}
                          className="btn btn-secondary"
                          style={{
                            padding: "0.75rem 2.2rem",
                            borderRadius: "var(--radius-full)",
                            fontSize: "0.95rem",
                            gap: "0.6rem"
                          }}
                        >
                          <ArrowDown size={18} />
                          <span>Load More Movies</span>
                        </button>
                      )}
                    </div>
                  ) : searchQuery.trim() ? (
                    <div
                      style={{
                        padding: "2.5rem 1rem",
                        textAlign: "center",
                        color: "var(--text-muted)",
                        fontSize: "0.88rem",
                        borderTop: "1px solid var(--border-glass)",
                        marginTop: "2.5rem"
                      }}
                    >
                      Showing all {filteredMovies.length} results matching &ldquo;{searchQuery}&rdquo;
                    </div>
                  ) : null}
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
          <div
            onClick={() => {
              setActiveTab("explore");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="brand-lockup"
            style={{ display: "flex", alignItems: "center", gap: "0.85rem", cursor: "pointer", userSelect: "none" }}
          >
            <CinemaLogo size={42} />
            <img
              src={brandingImg}
              alt="Cinema साथी"
              className="brand-title-img"
              style={{
                height: "38px",
                width: "auto",
                objectFit: "contain",
                display: "block"
              }}
            />
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
              onClick={() => handleTabChange("explore")}
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

      {/* Login Modal with Google and Phone Number functionality */}
      <LoginModal />
    </div>
  );
}
