import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  SimpleGrid,
  Card,
  Image,
  Text,
  Stack,
  Loader,
  Center,
  Badge,
} from "@mantine/core";
import { getMovieCast } from "../../api/tmdb-api";

const MovieCast = () => {
  const { movieId } = useParams();
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCast = async () => {
      try {
        setLoading(true);
        const data = await getMovieCast(movieId);
        setCast(data);
      } catch (error) {
        console.error("Помилка при завантаженні акторів:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCast();
  }, [movieId]);

  if (loading) {
    return (
      <Center py="xl">
        <Loader variant="dots" />
      </Center>
    );
  }

  if (cast.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        Інформація про акторів відсутня.
      </Text>
    );
  }

  return (
    <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="lg">
      {cast.map(({ id, name, character, profile_path }) => (
        <Card key={id} shadow="sm" padding="xs" radius="md" withBorder>
          <Card.Section>
            <Image
              src={
                profile_path
                  ? `https://image.tmdb.org/t/p/w200${profile_path}`
                  : "https://placehold.co/200x300?text=No+Photo"
              }
              height={220}
              alt={name}
            />
          </Card.Section>

          <Stack gap={2} mt="xs">
            <Text fw={600} size="sm" lineClamp={1}>
              {name}
            </Text>
            <Text size="xs" c="dimmed" fontStyle="italic" lineClamp={1}>
              as {character}
            </Text>
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  );
};

export default MovieCast;
