const STORAGE_KEYS = {
  RATINGS: "cinemasathi_user_ratings",
  REVIEWS: "cinemasathi_user_reviews",
  WATCHLIST: "cinemasathi_user_watchlist",
  FAVORITES: "cinemasathi_user_favorites"
};

// Default initial sample reviews so the review section looks lively and populated
const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    imdbID: "tt1375666",
    movieTitle: "Inception",
    author: "Aarav Sharma",
    rating: 10,
    title: "A masterpiece of cinematic storytelling",
    text: "Christopher Nolan delivers a mind-bending ride. The folding city sequence and the Hans Zimmer score in the finale give me goosebumps every single time.",
    date: "2025-08-14",
    hasSpoilers: false
  },
  {
    id: "rev-2",
    imdbID: "tt0816692",
    movieTitle: "Interstellar",
    author: "Pooja Thapa",
    rating: 10,
    title: "Emotional, scientific, breathtaking",
    text: "The docking scene with the spinning Endurance is peak tension. Not just science fiction, it's a love letter to humanity's spirit.",
    date: "2025-09-02",
    hasSpoilers: false
  },
  {
    id: "rev-3",
    imdbID: "tt0468569",
    movieTitle: "The Dark Knight",
    author: "Rohan Adhikari",
    rating: 10,
    title: "Heath Ledger's performance is legendary",
    text: "The finest comic book adaptation in history. Gritty, morally complex, and masterfully paced.",
    date: "2025-09-10",
    hasSpoilers: false
  }
];

export const getStoredRatings = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RATINGS);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Failed to read ratings from localStorage", e);
    return {};
  }
};

export const saveUserRating = (imdbID, rating) => {
  try {
    const ratings = getStoredRatings();
    ratings[imdbID] = {
      rating: Number(rating),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(ratings));
    return ratings;
  } catch (e) {
    console.error("Failed to save rating", e);
    return {};
  }
};

export const getStoredReviews = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return data ? JSON.parse(data) : INITIAL_REVIEWS;
  } catch (e) {
    console.error("Failed to read reviews from localStorage", e);
    return INITIAL_REVIEWS;
  }
};

export const addReview = (review) => {
  try {
    const reviews = getStoredReviews();
    const newReview = {
      id: "rev-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      ...review
    };
    const updated = [newReview, ...reviews];
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to add review", e);
    return [];
  }
};

export const getStoredWatchlist = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
    return data ? JSON.parse(data) : ["tt1375666", "tt15239678"];
  } catch (e) {
    console.error("Failed to read watchlist", e);
    return [];
  }
};

export const toggleWatchlist = (imdbID) => {
  try {
    const watchlist = getStoredWatchlist();
    const index = watchlist.indexOf(imdbID);
    let updated;
    if (index > -1) {
      updated = watchlist.filter((id) => id !== imdbID);
    } else {
      updated = [imdbID, ...watchlist];
    }
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to toggle watchlist", e);
    return [];
  }
};

export const getStoredFavorites = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return data ? JSON.parse(data) : ["tt0468569"];
  } catch (e) {
    console.error("Failed to read favorites", e);
    return [];
  }
};

export const toggleFavorite = (imdbID) => {
  try {
    const favs = getStoredFavorites();
    const index = favs.indexOf(imdbID);
    let updated;
    if (index > -1) {
      updated = favs.filter((id) => id !== imdbID);
    } else {
      updated = [imdbID, ...favs];
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to toggle favorite", e);
    return [];
  }
};
