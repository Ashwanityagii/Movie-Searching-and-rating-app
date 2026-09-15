import { FEATURED_MOVIES } from "../data/featuredMovies";

const DEFAULT_OMDB_KEY = "b9bd48a6";
const DETAILS_CACHE = new Map();
const SEARCH_CACHE = new Map();

// Helper to get active API key
export const getApiKey = () => {
  return localStorage.getItem("cinemasathi_omdb_key") || DEFAULT_OMDB_KEY;
};

export const setApiKey = (key) => {
  if (key) {
    localStorage.setItem("cinemasathi_omdb_key", key.trim());
  } else {
    localStorage.removeItem("cinemasathi_omdb_key");
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
    trailerId: localMatch?.trailerId || null,
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

  const apiKey = getApiKey();
  const url = `https://www.omdbapi.com/?i=${imdbId}&plot=full&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch movie details");
    const data = await response.json();

    if (data.Response === "True") {
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
 * Fetches live details for an array of movies in parallel (up to 8 concurrent)
 * to ensure all cards have real IMDb ratings, genres, and plots from the API.
 */
export const enrichMoviesWithDetails = async (movies) => {
  if (!movies || movies.length === 0) return [];

  const enriched = await Promise.all(
    movies.map(async (movie) => {
      // If already cached or has complete details
      if (DETAILS_CACHE.has(movie.imdbID)) {
        return { ...movie, ...DETAILS_CACHE.get(movie.imdbID) };
      }

      try {
        const apiKey = getApiKey();
        const res = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&plot=short&apikey=${apiKey}`);
        const data = await res.json();
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
        // Silently preserve base movie on error
      }
      return movie;
    })
  );

  return enriched;
};

// Endless keyword pools for genre discovery when no search query is active
const GENRE_KEYWORD_POOLS = {
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

/**
 * Fetches an endless stream of movies from the web API with pagination support
 * Automatically gets live details (IMDb ratings, genre, runtime, plot)
 */
export const fetchEndlessMovies = async ({ query = "", genre = "All", page = 1 }) => {
  const apiKey = getApiKey();
  let searchWord = query.trim();

  // If no search query, select a discovery topic based on genre and page
  if (!searchWord) {
    const pool = GENRE_KEYWORD_POOLS[genre] || GENRE_KEYWORD_POOLS.All;
    const poolIndex = (page - 1) % pool.length;
    searchWord = pool[poolIndex];
  }

  // Calculate actual API page
  // Since we cycle search words if no query, each cycle runs page 1 or 2
  const apiPage = query.trim() ? page : Math.floor((page - 1) / (GENRE_KEYWORD_POOLS[genre]?.length || 20)) + 1;

  const cacheKey = `endless_${searchWord}_page_${apiPage}`;
  if (SEARCH_CACHE.has(cacheKey)) {
    const cached = SEARCH_CACHE.get(cacheKey);
    return cached;
  }

  const url = `https://www.omdbapi.com/?s=${encodeURIComponent(
    searchWord
  )}&type=movie&page=${apiPage}&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`OMDb API error: ${response.status}`);
    const data = await response.json();

    if (data.Response === "True" && Array.isArray(data.Search)) {
      // Normalize base items
      const rawMovies = data.Search.map((item) => normalizeOmdbMovie(item));

      // Fetch live details (IMDb rating, genre, runtime, plot) from API
      const enrichedMovies = await enrichMoviesWithDetails(rawMovies);

      const totalResults = parseInt(data.totalResults, 10) || 100;
      const hasMore = query.trim() ? page * 10 < totalResults : true; // Endless discovery

      const result = {
        movies: enrichedMovies,
        totalResults,
        hasMore,
        source: "api"
      };

      SEARCH_CACHE.set(cacheKey, result);
      return result;
    } else {
      // If keyword yielded no items, return fallback or featured
      const filtered = FEATURED_MOVIES.filter((m) =>
        genre === "All" ? true : m.genre.toLowerCase().includes(genre.toLowerCase())
      );
      return {
        movies: filtered,
        totalResults: filtered.length,
        hasMore: false,
        source: "fallback"
      };
    }
  } catch (err) {
    console.warn("Endless fetch error:", err);
    return {
      movies: FEATURED_MOVIES,
      totalResults: FEATURED_MOVIES.length,
      hasMore: false,
      source: "offline"
    };
  }
};
