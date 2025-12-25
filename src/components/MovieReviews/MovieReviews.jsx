import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Stack,
  Paper,
  Text,
  Title,
  Loader,
  Center,
  Spoiler,
  Avatar,
  Group,
} from "@mantine/core";
import { getMovieReviews } from "../../api/tmdb-api";
import { ErrorPlaceholder } from "../ErrorPlaceholder";

const MovieReviews = () => {
  const { movieId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await getMovieReviews(movieId);
        setReviews(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [movieId, retry]);

  if (loading) {
    return (
      <Center py="xl">
        <Loader variant="bars" />
      </Center>
    );
  }

  if (error)
    return (
      <ErrorPlaceholder
        message={error}
        onRetry={() => setRetry((prev) => prev + 1)}
      />
    );

  if (reviews.length === 0) {
    return (
      <Text c="dimmed" ta="center">
        We don't have any reviews for this movie yet.
      </Text>
    );
  }

  return (
    <Stack gap="lg">
      {reviews.map(({ id, author, content, author_details }) => (
        <Paper key={id} withBorder shadow="xs" p="lg" radius="md">
          <Group mb="md">
            <Avatar
              // 1. Використовуємо наш новий хелпер або чисту логіку
              src={
                author_details?.avatar_path
                  ? author_details.avatar_path.startsWith("/http")
                    ? author_details.avatar_path.substring(1)
                    : author_details.avatar_path.startsWith("http")
                    ? author_details.avatar_path
                    : `https://image.tmdb.org/t/p/w45${author_details.avatar_path}`
                  : null // Якщо null, Mantine покаже ініціали або placeholder
              }
              alt={author}
              radius="xl"
              size="md"
            >
              {/* 2. Fallback: якщо src=null, Mantine відобразить текст всередині */}
              {author?.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <Text size="sm" fw={700}>
                {author}
              </Text>
              {/* <Text size="xs" c="dimmed">
                Author from TMDB
              </Text> */}
            </div>
          </Group>

          <Spoiler maxHeight={120} showLabel="Show more" hideLabel="Hide">
            <Text size="md" style={{ lineHeight: 1.6 }}>
              {content}
            </Text>
          </Spoiler>
        </Paper>
      ))}
    </Stack>
  );
};

export default MovieReviews;
