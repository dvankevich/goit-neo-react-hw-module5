// HomePage.jsx
import { useEffect, useState } from "react";
import MovieList from "../components/MovieList/MovieList";
import { getTrendingMovies } from "../api/tmdb-api";
import { Loader, Center, SimpleGrid, Title } from "@mantine/core";
//import MovieCard from "../components/MovieCard/MovieCard";

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
  // можливо треба перенести цей useEffect в компонент App і передавати значення trendingMoviesList пропсом.
  // дані не так часто змінюються і достатньо їх отримувати один раз при монтуванні головної сторінки.

  return (
    // <div>
    //   <h2>Trending Today</h2>
    //   {error && <p>Error loading data.</p>}
    //   <MovieList moviesList={trendingMoviesList} />
    // </div>
    <>
      <Title order={1} mb="xl">
        Trending today
      </Title>
      <MovieList moviesList={trendingMoviesList} />
    </>
  );
};

export default HomePage;
