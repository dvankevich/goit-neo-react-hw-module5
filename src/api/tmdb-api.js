// src/api/tmdb-api.js
import axios from "axios";

//const apiBearer = import.meta.env.VITE_API_BEARER;
const apiBearer = ""; // for testing purposes

if (!apiBearer) {
  console.error("VITE_API_BEARER is missing in your .env file!");
}

// Створюємо екземпляр з базовими налаштуваннями
const tmdbInstance = axios.create({
  baseURL: "https://api.themoviedb.org/3/",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${apiBearer || ""}`, // Захист від undefined,
  },
  params: {
    language: "en-US",
  },
});

// Додаємо перехоплювач (Interceptor) для обробки відповідей
tmdbInstance.interceptors.response.use(
  (response) => response, // Якщо все добре, просто повертаємо відповідь
  (error) => {
    let message = "An unexpected error occurred.";

    if (!error.response) {
      // Помилка мережі (наприклад, немає інтернету)
      message = "Network error. Please check your internet connection.";
    } else {
      // Помилки від сервера (401, 404, 500 тощо)
      switch (error.response.status) {
        case 401:
          message = "Unauthorized: Check your API key.";
          break;
        case 404:
          message = "The requested content was not found.";
          break;
        case 500:
          message = "Server error. Please try again later.";
          break;
        default:
          // Спроба взяти текст помилки прямо від TMDB
          message = error.response.data.status_message || message;
      }
    }

    // Створюємо об'єкт помилки, який ми "прокинемо" далі в компонент
    const customError = new Error(message);
    customError.status = error.response?.status;

    return Promise.reject(customError);
  }
);

export const getTrendingMovies = async (timeWindow = "day") => {
  const response = await tmdbInstance.get(`trending/movie/${timeWindow}`);
  return response.data.results;
};

export const getMovieDetails = async (movieId) => {
  const response = await tmdbInstance.get(`movie/${movieId}`);
  return response.data;
};

export const getMovieCast = async (movieId) => {
  const response = await tmdbInstance.get(`movie/${movieId}/credits`);
  return response.data.cast;
};

export const getMovieReviews = async (movieId) => {
  const response = await tmdbInstance.get(`movie/${movieId}/reviews`);
  return response.data.results;
};

export const searchMovies = async (query, page = 1) => {
  const response = await tmdbInstance.get("search/movie", {
    params: {
      query,
      page,
      include_adult: false,
    },
  });
  return response.data;
};
