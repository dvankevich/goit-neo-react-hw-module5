// HomePage.jsx
import { useEffect, useState } from "react";
import MovieList from "../components/MovieList/MovieList";
import { getTrendingMovies } from "../api/tmdb-api";
import { Loader, Center, SimpleGrid, Title } from "@mantine/core";

const HomePage = () => {
  const [trendingMoviesList, setTrendingMoviesList] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTrendingMovies = async () => {
      setError(false);
      try {
        const movies = await getTrendingMovies();
        setTrendingMoviesList(movies);
        console.log(movies);
      } catch (error) {
        setError(error);
        console.error("Error fetching trending movies:", error);
      }
    };
    fetchTrendingMovies();
  }, []);
  if (error) {
    return <div>Something went wrong: {error.message}</div>;
  }
  if (!trendingMoviesList) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader size="xl" variant="dots" />
      </Center>
    );
  }

  return (
    <>
      <Title order={1} mb="xl">
        Trending today
      </Title>
      <MovieList moviesList={trendingMoviesList} />
    </>
  );
};

export default HomePage;
