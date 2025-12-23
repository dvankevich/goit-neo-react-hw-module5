import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  TextInput,
  Button,
  Group,
  Title,
  Stack,
  Center,
  Text,
} from "@mantine/core";
import { HiSearch } from "react-icons/hi"; // Або інша іконка
import { searchMovies } from "../api/tmdb-api";
import MovieList from "../components/MovieList/MovieList";
import { MovieGridSkeleton } from "../components/MovieCard/MovieGridSkeleton";

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Працюємо з URL-параметрами (?query=batman)
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query") || "";

  useEffect(() => {
    // Якщо в URL немає запиту, нічого не шукаємо
    if (!query) {
      setMovies([]);
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const results = await searchMovies(query);
        setMovies(results);
      } catch (err) {
        setError("Не вдалося завантажити фільми. Спробуйте пізніше.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]); // Спрацьовує кожного разу, коли змінюється query в URL

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const value = form.elements.searchInput.value.trim();

    if (value === "") return;

    // Оновлюємо URL-параметр
    setSearchParams({ query: value });
  };

  return (
    <Stack gap="xl">
      <Title order={2}>Пошук фільмів</Title>

      {/* Форма пошуку */}
      <form onSubmit={handleSubmit}>
        <Group align="flex-end">
          <TextInput
            label="Назва фільму"
            placeholder="Наприклад, Interstellar"
            name="searchInput"
            defaultValue={query} // Початкове значення з URL
            leftSection={<HiSearch size={18} />}
            style={{ flex: 1 }}
          />
          <Button type="submit" loading={loading}>
            Пошук
          </Button>
        </Group>
      </form>

      {/* Відображення результатів */}
      {loading ? (
        <MovieGridSkeleton count={8} />
      ) : error ? (
        <Text c="red" textAlign="center">
          {error}
        </Text>
      ) : movies.length > 0 ? (
        <MovieList moviesList={movies} />
      ) : query && !loading ? (
        <Center mt="xl">
          <Text size="lg" c="dimmed">
            За запитом "{query}" нічого не знайдено 🔍
          </Text>
        </Center>
      ) : null}
    </Stack>
  );
};

export default MoviesPage;
