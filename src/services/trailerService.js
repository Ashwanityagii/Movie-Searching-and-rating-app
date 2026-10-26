import { FEATURED_MOVIES } from "../data/featuredMovies";

const STORAGE_KEY = "cinemasathi_trailer_cache";

/**
 * Load persisted trailer cache from localStorage
 */
const loadCache = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveToCache = (key, trailerId) => {
  try {
    const cache = loadCache();
    cache[key] = trailerId;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage quota errors
  }
};

/**
 * Curated high-definition trailer IDs for top blockbusters, classics, and franchise hits
 */
export const KNOWN_TRAILERS = {
  // Nolan & Sci-Fi
  inception: "YoHD9XEInc0",
  interstellar: "zSWdZVtXT7E",
  "the dark knight": "EXeTwQWrcwY",
  "the dark knight rises": "g8evyE9TuYg",
  "batman begins": "neY2xVmOfUM",
  oppenheimer: "uYPbbksJxIg",
  tenet: "LdOM0x0WVSc",
  dunkirk: "F-eMt3SrfFU",
  memento: "0vS0E9bBSL0",
  "dune: part two": "Way9Dexny3w",
  "dune: part 2": "Way9Dexny3w",
  dune: "8g18jFHCLXk",
  "blade runner 2049": "gCcx85zbxz4",
  "blade runner": "eogpIG53Cis",
  "the matrix": "vKQi3bBA1y8",
  "the matrix reloaded": "kYzz0FSgpSU",
  "the matrix resurrections": "9ix7TUGVYIo",

  // Marvel & DC & Superheroes
  "the avengers": "eOrNdBpGMv8",
  "avengers: endgame": "TcMBFSGVi1c",
  "avengers: infinity war": "6ZfuNTqbHE8",
  "avengers: age of ultron": "tmeOjFno6Do",
  "iron man": "8ugaeA-nMTc",
  "iron man 2": "BoohRoVA9WQ",
  "iron man 3": "f_uhWz5gfCc",
  "spider-man": "TYMMOjB329Y",
  "spider-man 2": "1s9Yln0Yscw",
  "spider-man: into the spider-verse": "g4Hbz2jLxvQ",
  "spider-man: across the spider-verse": "cqGjhVJWtEg",
  "spider-man: no way home": "JfVOs4VSpmA",
  "spider-man: homecoming": "n9DwoQ7HWvI",
  "spider-man: far from home": "DYYtuKyMtY8",
  "the batman": "mqqft2x_Aa4",
  batman: "EXeTwQWrcwY",
  joker: "zAGVQLHvwOY",
  "joker: folie à deux": "_OKAwz2NiOI",
  deadpool: "ONHBaC-pfsk",
  "deadpool 2": "20vznt_U6b4",
  "deadpool 3": "73_1biulkYk",
  "deadpool & wolverine": "73_1biulkYk",
  "guardians of the galaxy": "d96cjJhvlMA",
  "guardians of the galaxy vol. 3": "u3V5KDHRQvk",
  "black panther": "xjDjIWPwcPU",
  "black panther: wakanda forever": "_Z3QKkl1WyM",
  "captain america: civil war": "dKrVegVI0Us",
  "captain america: the winter soldier": "7SlILk2WMTI",
  "thor: ragnarok": "ue80QwXMRHg",
  logan: "Div0iP65aZo",

  // Classics & Modern Masterpieces
  "pulp fiction": "s7EdQ4FqbhY",
  "fight club": "ByXuk9QqQkk",
  parasite: "5xH0R_uie1U",
  whiplash: "7d_jQycdQGo",
  gladiator: "owK1qxDselE",
  "gladiator ii": "4rgYUipGJNo",
  "gladiator 2": "4rgYUipGJNo",
  "the shawshank redemption": "PLl99DlL6b4",
  "the godfather": "sY1S34973zA",
  "the godfather part ii": "9O1Iy9od7-A",
  "forrest gump": "bLvqoHBptjg",
  goodfellas: "2ilzidi_J8Q",
  se7en: "znmZoVkCjpI",
  "the silence of the lambs": "W6Mm8Sbe__o",
  titanic: "2e-eXJ6HgkQ",
  "schindler's list": "gG22XNhtnoY",
  "the prestige": "o4gHCmTQDVI",
  "the wolf of wall street": "iszwuX1AK6A",
  "inglourious basterds": "KnrRy6kSFF0",
  "django unchained": "0fUCuvNlOCg",
  "no country for old men": "38A__WT3-o0",
  "la la land": "0pdqf4P9MB8",
  "grand budapest hotel": "1Fg5iWmQjwk",

  // Action, Adventure, Fantasy & Franchises
  avatar: "5PSNL1qE6VY",
  "avatar: the way of water": "d9MyW72ELq0",
  "top gun: maverick": "qSqVVswa420",
  barbie: "pBk4NYhWNMM",
  "john wick": "2AUmvWm5ZDQ",
  "john wick: chapter 2": "XGk2E77EAuo",
  "john wick: chapter 3 - parabellum": "M7XM597XO94",
  "john wick: chapter 4": "qEVUtrk8_B4",
  "jurassic park": "QWBKEmWWL38",
  "jurassic world": "RFinNxS5KN4",
  "star wars: episode iv - a new hope": "vZ734NWnAHA",
  "star wars: episode v - the empire strikes back": "JNwNXF9Y668",
  "the lord of the rings: the fellowship of the ring": "V75dMMIW2B4",
  "the lord of the rings: the two towers": "LbfMDwc4azU",
  "the lord of the rings: the return of the king": "r5X-hFf6Bwo",
  "mission: impossible - dead reckoning part one": "2m1drlOZSDw",
  "mission: impossible - fallout": "wb49-oV0F78",
  "mad max: fury road": "hEJnMQG938g",
  furiosa: "XJMuhwVlca4",
  "furiosa: a mad max saga": "XJMuhwVlca4",
  "the substance": "LNlrGhBpYjc",
  "alien: romulus": "x0XDEhP4MQs",
  alien: "LjLamj-b0I8",
  aliens: "oSeQQlaCZgU",

  // Animation & Family
  "inside out 2": "LEjhY15eCx0",
  "inside out": "yRUAzGQ3nSY",
  "moana 2": "hDZ7y8RP5HE",
  moana: "LKFuXETZUsI",
  "wicked": "6COmYeLsz4c",
  coco: "Rvr68u6k5sI",
  "spirited away": "ByXuk9QqQkk",
  shrek: "CwXOrWvPBPk",
  "shrek 2": "V6X5ti4YlG8",
  "toy story": "v-PjgYDrg70",
  "toy story 4": "wmiIUN-7qhE",
  frozen: "TbQm5doF_Uc",
  "frozen ii": "Zi4LMpSD3nk"
};

/**
 * Normalizes movie title for dictionary lookup
 */
export const cleanTitle = (title = "") => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s:]/gi, "")
    .trim();
};

/**
 * Synchronous instant check for known trailer ID
 */
export const getStaticTrailerId = (movie) => {
  if (!movie) return null;

  // 1. Direct trailerId on movie object
  if (movie.trailerId) return movie.trailerId;

  // 2. Check localStorage cache
  const cacheKey = cleanTitle(movie.title);
  const cache = loadCache();
  if (cache[cacheKey]) return cache[cacheKey];

  // 3. Featured movies list
  const featured = FEATURED_MOVIES.find(
    (m) =>
      m.imdbID === movie.imdbID ||
      m.title.toLowerCase() === (movie.title || "").toLowerCase()
  );
  if (featured?.trailerId) return featured.trailerId;

  // 4. Exact dictionary match
  if (KNOWN_TRAILERS[cacheKey]) return KNOWN_TRAILERS[cacheKey];

  // 5. Partial dictionary match
  for (const [key, id] of Object.entries(KNOWN_TRAILERS)) {
    if (cacheKey.startsWith(key) || key.startsWith(cacheKey)) {
      return id;
    }
  }

  return null;
};

/**
 * Asynchronously fetch or dynamically resolve official trailer ID for ANY movie
 */
export const fetchTrailerId = async (movie) => {
  if (!movie) return null;

  // Check static lookup first
  const staticId = getStaticTrailerId(movie);
  if (staticId) return staticId;

  const titleQuery = `${movie.title} ${movie.year && movie.year !== "N/A" ? movie.year : ""}`.trim();
  const cacheKey = cleanTitle(movie.title);

  // Call Vite dev server trailer API plugin endpoint
  try {
    const res = await fetch(`/api/trailer?q=${encodeURIComponent(titleQuery)}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.trailerId) {
        saveToCache(cacheKey, data.trailerId);
        return data.trailerId;
      }
    }
  } catch (err) {
    console.warn("Dynamic trailer lookup failed:", err);
  }

  return null;
};

/**
 * Formats YouTube embed URL with optimal player parameters
 */
export const buildEmbedUrl = (trailerId) => {
  if (!trailerId) return null;
  return `https://www.youtube.com/embed/${trailerId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
};

/**
 * Formats direct YouTube watch or search URL
 */
export const buildWatchUrl = (movie, trailerId = null) => {
  if (trailerId) {
    return `https://www.youtube.com/watch?v=${trailerId}`;
  }
  const query = `${movie?.title || "Movie"} ${movie?.year && movie.year !== "N/A" ? movie.year : ""} official trailer`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
};

/**
 * Synchronous resolver for initial render
 */
export const resolveTrailerInfo = (movie) => {
  if (!movie) {
    return {
      trailerId: null,
      embedUrl: null,
      watchUrl: null,
      isDirectId: false,
      title: ""
    };
  }

  const trailerId = getStaticTrailerId(movie);

  return {
    trailerId,
    embedUrl: buildEmbedUrl(trailerId),
    watchUrl: buildWatchUrl(movie, trailerId),
    isDirectId: Boolean(trailerId),
    title: movie.title
  };
};
