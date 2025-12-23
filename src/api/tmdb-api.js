import axios from "axios";
const apiBearer = import.meta.env.VITE_API_BEARER;
axios.defaults.baseURL = "https://api.themoviedb.org/3/";

const options = {
    params: { language: "en-US" },
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${apiBearer}`,
    },
};

/**
 *
 * @param {string} timeWindow - day, week.
 * @returns - films Array
 */
export const getTrendingMovies = async (timeWindow = "day") => {
    const response = await axios.get(`trending/movie/${timeWindow}`, options);
    return response.data.results;
};

/**
 *
 * @param {movieId} movieId
 * @returns {*} movie details
 */
export const getMovieDetails = async (movieId) => {
    const response = await axios.get(`movie/${movieId}`, options);
    return response.data;
};

/**
 *
 * @param {*} movieId
 * @returns movie cast array
 */
export const getMovieCast = async (movieId) => {
    const response = await axios.get(`movie/${movieId}/credits`, options);
    return response.data.cast;
};

export const getMovieReviews = async (movieId) => {
    const response = await axios.get(`movie/${movieId}/reviews`, options);
    return response.data.results;
};

export const searchMovies = async (query) => {
    const searchOptions = {
        ...options,
        params: {
            ...options.params,
            query: query,
            include_adult: "false",
            page: "1",
        },
    };
    const response = await axios.get("search/movie", searchOptions);
    return response.data.results;
};
