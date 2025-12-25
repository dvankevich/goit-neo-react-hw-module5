// src/api/tmdb-api.js
import axios from "axios";
import { formatMovieData, formatCastData } from "../utils/formatTmdbData";

const apiBearer = import.meta.env.VITE_API_BEARER;
//const apiBearer = ""; // for testing purposes

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
  (response) => response,
  (error) => {
    let message = "An unexpected error occurred.";

    // 1. Помилки з'єднання / Таймаути / Мережа
    if (error.code === "ECONNABORTED") {
      message = "Request timed out. Please try again.";
    } else if (error.code === "ERR_NETWORK") {
      message = "Network error. Check your connection.";
    }
    // 2. Запит було зроблено, але сервер відповів помилкою (4xx, 5xx)
    else if (error.response) {
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
          message = error.response.data.status_message || message;
      }
    }
    // 3. Запит було зроблено, але відповіді немає (Server down)
    else if (error.request) {
      message = "Server is not responding. Please try again later.";
    }

    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.code = error.code; // Передаємо код далі для глибшої логіки

    return Promise.reject(customError);
  }
);

export const getTrendingMovies = async (timeWindow = "day") => {
  const response = await tmdbInstance.get(`trending/movie/${timeWindow}`);
  return response.data.results.map(formatMovieData);
};

export const getMovieDetails = async (movieId) => {
  const response = await tmdbInstance.get(`movie/${movieId}`);
  return formatMovieData(response.data);
};

export const getMovieCast = async (movieId) => {
  const response = await tmdbInstance.get(`movie/${movieId}/credits`);
  return response.data.cast.map(formatCastData);
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
  return {
    ...response.data,
    results: response.data.results.map(formatMovieData),
  };
};
