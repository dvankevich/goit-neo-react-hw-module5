// HomePage.jsx
import { useEffect, useState } from "react";
import MovieList from "../components/MovieList/MovieList";
import { getTrendingMovies } from "../api/tmdb-api";
import { Title } from "@mantine/core";
import { MovieGridSkeleton } from "../components/MovieCard/MovieGridSkeleton";
import { ErrorPlaceholder } from "../components/ErrorPlaceholder";

const HomePage = () => {
  const [trendingMoviesList, setTrendingMoviesList] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const movies = await getTrendingMovies();
        setTrendingMoviesList(movies);
      } catch (error) {
        console.error("Error fetching trending movies:", error);
        setError(error.message || "Failed to load trending movies");
      } finally {
        setLoading(false);
      }
    };
    fetchTrendingMovies();
  }, []);

  if (error) {
    return (
      <ErrorPlaceholder
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <>
      <Title order={1} mb="xl">
        Trending today (Top 20)
      </Title>
      {loading ? (
        <MovieGridSkeleton count={8} />
      ) : (
        <MovieList moviesList={trendingMoviesList} />
      )}
    </>
  );
};

export default HomePage;
