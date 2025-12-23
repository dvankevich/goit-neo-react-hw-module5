import { SimpleGrid } from "@mantine/core";
import { useLocation } from "react-router-dom";
import MovieCard from "../MovieCard/MovieCard";

const MovieList = ({ moviesList }) => {
  const location = useLocation();

  return (
    <SimpleGrid
      cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
      spacing="lg"
      verticalSpacing="xl"
    >
      {moviesList?.map((movie) => (
        <MovieCard key={movie.id} movie={movie} location={location} />
      ))}
    </SimpleGrid>
  );
};
export default MovieList;
