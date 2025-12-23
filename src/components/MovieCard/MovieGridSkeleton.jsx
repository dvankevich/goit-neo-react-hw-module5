// src/components/MovieCard/MovieGridSkeleton.jsx
import { SimpleGrid } from "@mantine/core";
import { MovieCardSkeleton } from "./MovieCardSkeleton";

export const MovieGridSkeleton = ({ count = 8 }) => {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
      {Array.from({ length: count }).map((_, index) => (
        <MovieCardSkeleton key={index} />
      ))}
    </SimpleGrid>
  );
};
export default MovieGridSkeleton;
