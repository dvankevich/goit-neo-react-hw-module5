import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  TextInput,
  Button,
  Group,
  Title,
  Stack,
  Text,
  CloseButton,
} from "@mantine/core";
import { useForm } from "@mantine/form"; // Хук для валідації
import { notifications } from "@mantine/notifications"; // Спливаючі вікна
import { HiSearch } from "react-icons/hi";
import { searchMovies } from "../api/tmdb-api";
import MovieList from "../components/MovieList/MovieList";
import { MovieGridSkeleton } from "../components/MovieCard/MovieGridSkeleton";

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query") || "";

  // 1. Налаштування валідації форми
  const form = useForm({
    initialValues: {
      search: query,
    },
    validate: {
      search: (value) => {
        if (value.trim().length === 0) return "Запит не може бути порожнім";
        if (value.trim().length < 2) return "Введіть хоча б 2 символи";
        return null;
      },
    },
  });

  useEffect(() => {
    if (!query) {
      setMovies([]);
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        const results = await searchMovies(query);
        setMovies(results);
      } catch (err) {
        notifications.show({
          title: "Помилка",
          message: "Не вдалося завантажити дані",
          color: "red",
        });
        console.error("Error fetching search results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  // 2. Обробка відправки форми
  const handleSearch = (values) => {
    setSearchParams({ query: values.search.trim() });
  };

  // Функція для повного очищення
  const handleClear = () => {
    form.setFieldValue("search", ""); // Очищаємо поле у формі
    setSearchParams({}); // Очищаємо URL-параметри
    setMovies([]); // Прибираємо результати пошуку
  };

  return (
    <Stack gap="xl">
      <Title order={2}>Пошук фільмів</Title>

      {/* 3. Використання form.onSubmit */}
      <form onSubmit={form.onSubmit(handleSearch)}>
        <Group align="flex-start">
          <TextInput
            placeholder="Введіть назву фільму..."
            style={{ flex: 1 }}
            leftSection={<HiSearch size={18} />}
            // Додаємо кнопку очищення в праву частину інпута
            rightSectionPointerEvents="all"
            rightSection={
              form.values.search ? (
                <CloseButton
                  aria-label="Очистити пошук"
                  onClick={handleClear}
                />
              ) : null
            }
            {...form.getInputProps("search")} // Зв'язує інпут з валідацією
          />
          <Button type="submit" loading={loading}>
            Пошук
          </Button>
        </Group>
      </form>

      {loading ? (
        <MovieGridSkeleton count={8} />
      ) : movies.length > 0 ? (
        <MovieList moviesList={movies} />
      ) : (
        query && (
          <Text c="dimmed" textAlign="center">
            Нічого не знайдено
          </Text>
        )
      )}
    </Stack>
  );
};

export default MoviesPage;
