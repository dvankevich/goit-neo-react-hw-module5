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
  Center,
  Pagination,
} from "@mantine/core";
import { useForm } from "@mantine/form"; // Хук для валідації
//import { notifications } from "@mantine/notifications"; // Спливаючі вікна
import { HiSearch } from "react-icons/hi";
import { searchMovies } from "../api/tmdb-api";
import MovieList from "../components/MovieList/MovieList";
import { MovieGridSkeleton } from "../components/MovieCard/MovieGridSkeleton";
import { showError } from "../utils/showError";
import { ErrorPlaceholder } from "../components/ErrorPlaceholder";

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const page = parseInt(searchParams.get("page") || "1", 10); // get current page from URL or default to 1

  // 1. Налаштування валідації форми
  const form = useForm({
    initialValues: {
      search: query,
    },
    validate: {
      search: (value) => {
        if (value.trim().length === 0) return "Request cannot be empty.";
        if (value.trim().length < 2) return "Enter at least 2 characters";
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
        setError(null); // Скидаємо помилку перед новим запитом
        const data = await searchMovies(query, page);
        setMovies(data.results);
        setTotalPages(data.total_pages > 500 ? 500 : data.total_pages);
      } catch (err) {
        if (page === 1) {
          // Якщо впала перша сторінка — показуємо великий ErrorPlaceholder
          setError(err.message);
        } else {
          // Якщо впала пагінація — показуємо лише нотифікацію
          // Ми НЕ викликаємо setError, тому список фільмів не зникає
          showError("Unable to load next page", err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, retry, page]);

  // 2. Обробка відправки форми
  const handleSearch = (values) => {
    setSearchParams({ query: values.search.trim(), page: "1" });
  };

  // Функція для повного очищення
  const handleClear = () => {
    form.setFieldValue("search", ""); // Очищаємо поле у формі
    setSearchParams({}); // Очищаємо URL-параметри
    setMovies([]); // Прибираємо результати пошуку
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ query, page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" }); // scroll to top on page change
  };

  return (
    <Stack gap="xl">
      <Title order={2}>Movies search</Title>

      {/* 3. Використання form.onSubmit */}
      <form onSubmit={form.onSubmit(handleSearch)}>
        <Group align="flex-start">
          <TextInput
            placeholder="Enter movie title..."
            style={{ flex: 1 }}
            leftSection={<HiSearch size={18} />}
            // Додаємо кнопку очищення в праву частину інпута
            rightSectionPointerEvents="all"
            rightSection={
              form.values.search ? (
                <CloseButton aria-label="Clear search" onClick={handleClear} />
              ) : null
            }
            {...form.getInputProps("search")} // Зв'язує інпут з валідацією
          />
          <Button type="submit" loading={loading}>
            Search
          </Button>
        </Group>
      </form>

      {/* 1. Стан завантаження (пріоритет №1) */}
      {loading ? (
        <MovieGridSkeleton count={8} />
      ) : /* 2. Стан помилки (пріоритет №2) */
      error ? (
        <ErrorPlaceholder
          message={error}
          onRetry={() => setRetry((prev) => prev + 1)}
        />
      ) : /* 3. Перевірка на порожній результат (якщо завантаження завершено і помилок немає) */
      movies.length === 0 && query ? (
        <Center py={50}>
          <Stack align="center" gap="xs">
            <Text size="xl" fw={500}>
              Nothing found 🔍
            </Text>
            <Text c="dimmed">
              Nothing found for "{query}". Try another title.
            </Text>
          </Stack>
        </Center>
      ) : (
        /* 4. Відображення списку (якщо дані є) */
        <>
          <MovieList moviesList={movies} />

          {/* Додаємо компонент пагінації */}
          {totalPages > 1 && (
            <Center mt="xl" mb="xl">
              <Pagination
                value={page}
                onChange={handlePageChange}
                total={totalPages}
                color="blue"
                withEdges
              />
            </Center>
          )}
        </>
      )}
    </Stack>
  );
};

export default MoviesPage;
