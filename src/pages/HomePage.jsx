// HomePage.jsx
import { useEffect, useState } from "react";
import MovieList from "../components/MovieList/MovieList";
import { getTrendingMovies } from "../api/tmdb-api";
import { Loader, Center, SimpleGrid, Title } from "@mantine/core";
import { MovieGridSkeleton } from "../components/MovieCard/MovieGridSkeleton";

const HomePage = () => {
  const [trendingMoviesList, setTrendingMoviesList] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingMovies = async () => {
      setError(false);
      try {
        setLoading(true);
        const movies = await getTrendingMovies();
        setTrendingMoviesList(movies);
        console.log(movies);
      } catch (error) {
        setError(error);
        console.error("Error fetching trending movies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrendingMovies();
  }, []);
  if (error) {
    return <div>Something went wrong: {error.message}</div>;
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
