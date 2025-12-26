// src/api/tmdb-api.js
import axios from "axios";
import { formatMovieData, formatCastData, formatReviewData } from "./formatTmdbData.js";

// Тепер звертаємося до власного сервера
const tmdbInstance = axios.create({
  baseURL: "/api", 
});

// Допоміжна функція для запитів до нашої серверної функції
const fetchFromProxy = async (path, params = {}) => {
  const response = await tmdbInstance.get("/movies", {
    params: {
      path,
      ...params,
    },
  });
  return response.data;
};

export const getTrendingMovies = async (timeWindow = "day") => {
  const data = await fetchFromProxy(`trending/movie/${timeWindow}`);
  return data.results.map(formatMovieData);
};

export const getMovieDetails = async (movieId) => {
  const data = await fetchFromProxy(`movie/${movieId}`);
  return formatMovieData(data);
};

export const getMovieCast = async (movieId) => {
  const data = await fetchFromProxy(`movie/${movieId}/credits`);
  return data.cast.map(formatCastData);
};

export const getMovieReviews = async (movieId) => {
  const data = await fetchFromProxy(`movie/${movieId}/reviews`);
  return data.results.map(formatReviewData);
};

export const searchMovies = async (query, page = 1) => {
  const data = await fetchFromProxy("search/movie", { query, page, include_adult: false });
  return {
    ...data,
    results: data.results.map(formatMovieData),
  };
};