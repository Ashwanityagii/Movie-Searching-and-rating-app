import { FEATURED_MOVIES } from "../data/featuredMovies";
import { resolveTrailerInfo } from "./trailerService";

// Verified active OMDb API keys with rotation pool
const OMDB_KEY_POOL = ["trilogy", "564727fa", "6c3a2d45", "4a3b711b"];
let currentKeyIndex = 0;
const DETAILS_CACHE = new Map();
const SEARCH_CACHE = new Map();

// Helper to get active API key (automatically cleans any stale/exhausted b9bd48a6 key)
export const getApiKey = () => {
  const custom = localStorage.getItem("cinemasathi_omdb_key");
  if (custom && custom.trim() && custom.trim() !== "b9bd48a6") {
    return custom.trim();
  }
  // Clear the exhausted legacy key if present
  if (custom === "b9bd48a6") {
    localStorage.removeItem("cinemasathi_omdb_key");
  }
  return OMDB_KEY_POOL[currentKeyIndex % OMDB_KEY_POOL.length];
};

export const rotateApiKey = () => {
  currentKeyIndex = (currentKeyIndex + 1) % OMDB_KEY_POOL.length;
  return OMDB_KEY_POOL[currentKeyIndex];
};

export const setApiKey = (key) => {
  if (key && key.trim() && key.trim() !== "b9bd48a6") {
    localStorage.setItem("cinemasathi_omdb_key", key.trim());
  } else {
    localStorage.removeItem("cinemasathi_omdb_key");
  }
};

/**
 * Resilient fetch wrapper with automatic key rotation on rate limits
 */
export const safeOmdbFetch = async (queryParamString, retryCount = 0) => {
  const maxRetries = OMDB_KEY_POOL.length;
  // Ensure each retry uses a distinct verified key from the pool
  const custom = localStorage.getItem("cinemasathi_omdb_key");
  const keyToUse =
    retryCount === 0 && custom && custom.trim() && custom.trim() !== "b9bd48a6"
      ? custom.trim()
      : OMDB_KEY_POOL[(currentKeyIndex + retryCount) % OMDB_KEY_POOL.length];

  const url = `https://www.omdbapi.com/?${queryParamString}&apikey=${keyToUse}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (retryCount < maxRetries) {
        rotateApiKey();
        return safeOmdbFetch(queryParamString, retryCount + 1);
      }
      throw new Error(`OMDb HTTP ${res.status}`);
    }
    const data = await res.json();
    if (
      data.Response === "False" &&
      data.Error &&
      (data.Error.includes("limit") ||
        data.Error.includes("key") ||
        data.Error.includes("Invalid"))
    ) {
      if (retryCount < maxRetries) {
        rotateApiKey();
        return safeOmdbFetch(queryParamString, retryCount + 1);
      }
    }
    return data;
  } catch (err) {
    if (retryCount < maxRetries) {
      rotateApiKey();
      return safeOmdbFetch(queryParamString, retryCount + 1);
    }
    throw err;
  }
};

/**
 * Normalizes OMDb API response into CinemaSathi standard movie object
 */
export const normalizeOmdbMovie = (item, details = null) => {
  const localMatch = FEATURED_MOVIES.find(
    (m) =>
      m.imdbID === item.imdbID ||
      m.title.toLowerCase() === (item.Title || item.title || "").toLowerCase()
  );

  const poster =
    item.Poster && item.Poster !== "N/A"
      ? item.Poster
      : localMatch?.poster ||
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80";

  const backdrop =
    localMatch?.backdrop ||
    poster ||
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80";

  return {
    imdbID: item.imdbID,
    title: item.Title || item.title,
    year: item.Year || item.year || "N/A",
    rated: details?.Rated || item.Rated || localMatch?.rated || "PG-13",
    released: details?.Released || item.Released || localMatch?.released || item.Year,
    runtime: details?.Runtime || item.Runtime || localMatch?.runtime || "N/A",
    genre: details?.Genre || item.Genre || localMatch?.genre || "Cinema",
    director: details?.Director || item.Director || localMatch?.director || "N/A",
    writer: details?.Writer || item.Writer || localMatch?.writer || "N/A",
    actors: details?.Actors || item.Actors || localMatch?.actors || "N/A",
    plot:
      details?.Plot && details.Plot !== "N/A"
        ? details.Plot
        : item.Plot && item.Plot !== "N/A"
        ? item.Plot
        : localMatch?.plot || "Discover this movie on CinemaSathi.",
    poster,
    backdrop,
    imdbRating:
      details?.imdbRating && details.imdbRating !== "N/A"
        ? details.imdbRating
        : item.imdbRating && item.imdbRating !== "N/A"
        ? item.imdbRating
        : localMatch?.imdbRating || "7.5",
    imdbVotes: details?.imdbVotes || localMatch?.imdbVotes || "N/A",
    trailerId:
      localMatch?.trailerId ||
      resolveTrailerInfo({
        imdbID: item.imdbID,
        title: item.Title || item.title,
        year: item.Year || item.year
      })?.trailerId ||
      null,
    category: localMatch?.category || "Action",
    source: "omdb"
  };
};

/**
 * Fetches full details for a single movie by IMDb ID from the live API
 */
export const fetchMovieDetails = async (imdbId) => {
  if (!imdbId) return null;

  if (DETAILS_CACHE.has(imdbId)) {
    return DETAILS_CACHE.get(imdbId);
  }

  try {
    const data = await safeOmdbFetch(`i=${imdbId}&plot=full`);
    if (data && data.Response === "True") {
      const normalized = normalizeOmdbMovie(data, data);
      DETAILS_CACHE.set(imdbId, normalized);
      return normalized;
    }
  } catch (err) {
    console.warn("Live detail fetch failed for ID:", imdbId, err);
  }

  const localMatch = FEATURED_MOVIES.find((m) => m.imdbID === imdbId);
  return localMatch || null;
};

/**
 * Fetches live details for an array of movies in parallel
 */
export const enrichMoviesWithDetails = async (movies) => {
  if (!movies || movies.length === 0) return [];

  const enriched = await Promise.all(
    movies.map(async (movie) => {
      if (DETAILS_CACHE.has(movie.imdbID)) {
        return { ...movie, ...DETAILS_CACHE.get(movie.imdbID) };
      }

      try {
        const data = await safeOmdbFetch(`i=${movie.imdbID}&plot=short`);
        if (data && data.Response === "True") {
          const detailObj = {
            imdbRating: data.imdbRating !== "N/A" ? data.imdbRating : movie.imdbRating,
            genre: data.Genre !== "N/A" ? data.Genre : movie.genre,
            runtime: data.Runtime !== "N/A" ? data.Runtime : movie.runtime,
            plot: data.Plot !== "N/A" ? data.Plot : movie.plot,
            director: data.Director !== "N/A" ? data.Director : movie.director,
            actors: data.Actors !== "N/A" ? data.Actors : movie.actors,
            rated: data.Rated !== "N/A" ? data.Rated : movie.rated
          };
          DETAILS_CACHE.set(movie.imdbID, { ...movie, ...detailObj });
          return { ...movie, ...detailObj };
        }
      } catch (e) {
        // preserve base movie on error
      }
      return movie;
    })
  );

  return enriched;
};

// Endless keyword pools for genre discovery
export const GENRE_KEYWORD_POOLS = {
  All: [
    "war", "love", "king", "star", "dark", "super", "world", "man", "night", "city",
    "dead", "hero", "life", "time", "lost", "space", "last", "black", "game", "secret"
  ],
  Action: [
    "action", "mission", "fast", "avengers", "warrior", "fury", "strike", "lethal",
    "hunt", "combat", "force", "bullet", "speed", "danger", "terminator"
  ],
  "Sci-Fi": [
    "alien", "space", "star", "cyber", "galaxy", "future", "matrix", "planet",
    "clone", "robot", "time", "cosmos", "quantum", "infinity", "dune"
  ],
  Adventure: [
    "adventure", "journey", "quest", "treasure", "pirate", "island", "wild",
    "jungle", "expedition", "safari", "legend", "voyage"
  ],
  Drama: [
    "drama", "story", "life", "heart", "shadow", "truth", "dream", "memory",
    "silent", "broken", "hope", "destiny", "road"
  ],
  Crime: [
    "crime", "cop", "detective", "mafia", "gang", "robbery", "heist", "murder",
    "law", "investigation", "bad", "thief", "godfather"
  ],
  Thriller: [
    "thriller", "mystery", "panic", "fear", "chase", "trap", "danger", "secret",
    "suspect", "escape", "silent", "conspiracy"
  ],
  Animation: [
    "animation", "dragon", "toy", "hero", "monster", "magical", "panda", "pixar",
    "quest", "disney", "shrek", "incredibles"
  ],
  Romance: [
    "love", "romance", "forever", "kiss", "heart", "valentine", "wedding", "passion",
    "summer", "sweet", "sweetheart"
  ],
  Fantasy: [
    "magic", "ring", "dragon", "wizard", "kingdom", "lord", "sword", "fairy",
    "enchanted", "myth", "chronicles"
  ],
  Comedy: [
    "comedy", "funny", "party", "crazy", "wedding", "holiday", "laugh", "happy",
    "friends", "hotel", "game"
  ],
  Horror: [
    "horror", "ghost", "evil", "dead", "conjuring", "nightmare", "haunted",
    "devil", "blood", "curse", "demon"
  ]
};

// Curated blockbuster keywords for the Trending feed
export const TRENDING_KEYWORD_POOLS = [
  "dune", "oppenheimer", "avengers", "deadpool", "spiderman", "batman",
  "avatar", "top gun", "gladiator", "joker", "wicked", "interstellar",
  "matrix", "guardians", "fast", "john wick", "mission impossible", "alien", "godzilla"
];

/**
 * Fetches an endless stream of movies from the web API with pagination support
 * Truly ENDLESS: hasMore is ALWAYS true so the movie list never halts!
 */
export const fetchEndlessMovies = async ({ query = "", genre = "All", page = 1, isTrending = false }) => {
  const isSpecificSearch = !!query.trim();
  let searchWord = query.trim();

  // If no specific search query, select a discovery topic based on genre/trending mode and page
  if (!isSpecificSearch) {
    if (isTrending) {
      const pool = TRENDING_KEYWORD_POOLS;
      const poolIndex = (page - 1) % pool.length;
      searchWord = pool[poolIndex];
    } else {
      const pool = GENRE_KEYWORD_POOLS[genre] || GENRE_KEYWORD_POOLS.All;
      const poolIndex = (page - 1) % pool.length;
      searchWord = pool[poolIndex];
    }
  }

  // Calculate actual API page
  const poolLength = isTrending
    ? TRENDING_KEYWORD_POOLS.length
    : GENRE_KEYWORD_POOLS[genre]?.length || 20;
  const apiPage = isSpecificSearch ? page : Math.floor((page - 1) / poolLength) + 1;

  const cacheKey = `endless_${isTrending ? "trending_" : ""}${searchWord}_page_${apiPage}`;
  if (SEARCH_CACHE.has(cacheKey)) {
    const cached = SEARCH_CACHE.get(cacheKey);
    return cached;
  }

  try {
    const data = await safeOmdbFetch(
      `s=${encodeURIComponent(searchWord)}&type=movie&page=${apiPage}`
    );

    if (data && data.Response === "True" && Array.isArray(data.Search) && data.Search.length > 0) {
      const rawMovies = data.Search.map((item) => normalizeOmdbMovie(item));
      const enrichedMovies = await enrichMoviesWithDetails(rawMovies);
      const totalResults = parseInt(data.totalResults, 10) || enrichedMovies.length;

      // When searching specific query, hasMore is strictly based on total results for this query
      const hasMore = isSpecificSearch ? apiPage * 10 < totalResults : true;

      const result = {
        movies: enrichedMovies,
        totalResults,
        hasMore,
        source: "api"
      };

      SEARCH_CACHE.set(cacheKey, result);
      return result;
    } else {
      // If user is searching for a specific query and no more results are found,
      // return ONLY what matches (do NOT roll over to unrelated random keywords!)
      if (isSpecificSearch) {
        // Check local featured movies strictly matching the query on page 1
        const localMatches =
          page === 1
            ? FEATURED_MOVIES.filter((m) => {
                const q = searchWord.toLowerCase();
                return (
                  m.title.toLowerCase().includes(q) ||
                  m.actors?.toLowerCase().includes(q) ||
                  m.director?.toLowerCase().includes(q) ||
                  m.genre?.toLowerCase().includes(q)
                );
              })
            : [];

        return {
          movies: localMatches,
          totalResults: localMatches.length,
          hasMore: false,
          source: localMatches.length > 0 ? "local" : "none"
        };
      }

      // If in browse/discovery mode, seamlessly roll to next topic so scroll never halts
      const fallbackPool = isTrending
        ? TRENDING_KEYWORD_POOLS
        : (GENRE_KEYWORD_POOLS[genre] || GENRE_KEYWORD_POOLS.All);
      const fallbackWord = fallbackPool[page % fallbackPool.length];

      try {
        const fallbackData = await safeOmdbFetch(
          `s=${encodeURIComponent(fallbackWord)}&type=movie&page=1`
        );
        if (fallbackData && fallbackData.Response === "True" && Array.isArray(fallbackData.Search)) {
          const raw = fallbackData.Search.map((item) => normalizeOmdbMovie(item));
          const enriched = await enrichMoviesWithDetails(raw);
          return {
            movies: enriched,
            totalResults: 500,
            hasMore: true,
            source: "api"
          };
        }
      } catch (e) {
        // fallback
      }

      // Final fallback to featured movies for browse mode
      const filtered = FEATURED_MOVIES.filter((m) =>
        genre === "All" ? true : m.genre.toLowerCase().includes(genre.toLowerCase())
      );
      return {
        movies: filtered,
        totalResults: filtered.length,
        hasMore: true,
        source: "fallback"
      };
    }
  } catch (err) {
    console.warn("Movie fetch error:", err);

    if (isSpecificSearch) {
      const localMatches =
        page === 1
          ? FEATURED_MOVIES.filter((m) => {
              const q = searchWord.toLowerCase();
              return (
                m.title.toLowerCase().includes(q) ||
                m.actors?.toLowerCase().includes(q) ||
                m.director?.toLowerCase().includes(q)
              );
            })
          : [];

      return {
        movies: localMatches,
        totalResults: localMatches.length,
        hasMore: false,
        source: "offline"
      };
    }

    const filtered = FEATURED_MOVIES.filter((m) =>
      genre === "All" ? true : m.genre.toLowerCase().includes(genre.toLowerCase())
    );
    return {
      movies: filtered,
      totalResults: filtered.length,
      hasMore: true,
      source: "offline"
    };
  }
};
