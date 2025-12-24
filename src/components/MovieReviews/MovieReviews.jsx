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

const MovieReviews = () => {
  const { movieId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await getMovieReviews(movieId);
        setReviews(data);
      } catch (error) {
        console.error("Помилка при завантаженні відгуків:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [movieId]);

  if (loading) {
    return (
      <Center py="xl">
        <Loader variant="bars" />
      </Center>
    );
  }

  if (reviews.length === 0) {
    return (
      <Paper p="xl" withBorder radius="md" bg="var(--mantine-color-gray-0)">
        <Text c="dimmed" ta="center">
          Ми ще не маємо відгуків для цього фільму.
        </Text>
      </Paper>
    );
  }

  return (
    <Stack gap="lg">
      {reviews.map(({ id, author, content, author_details }) => (
        <Paper key={id} withBorder shadow="xs" p="lg" radius="md">
          <Group mb="md">
            <Avatar
              src={
                author_details?.avatar_path?.includes("http")
                  ? author_details.avatar_path.substring(1)
                  : `https://image.tmdb.org/t/p/w45${author_details?.avatar_path}`
              }
              alt={author}
              radius="xl"
            />
            <div>
              <Text size="sm" fw={700}>
                {author}
              </Text>
              <Text size="xs" c="dimmed">
                Author from TMDB
              </Text>
            </div>
          </Group>

          <Spoiler
            maxHeight={120}
            showLabel="Показати більше"
            hideLabel="Сховати"
          >
            <Text size="sm" style={{ lineHeight: 1.6 }}>
              {content}
            </Text>
          </Spoiler>
        </Paper>
      ))}
    </Stack>
  );
};

export default MovieReviews;
