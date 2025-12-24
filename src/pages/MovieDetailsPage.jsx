import { useEffect, useState, useRef } from "react";
import {
  useParams,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Container,
  Grid,
  Image,
  Title,
  Text,
  Badge,
  Group,
  Stack,
  Button,
  Loader,
  Center,
  Divider,
  Tabs,
} from "@mantine/core";
import { HiArrowLeft } from "react-icons/hi";
import { getMovieDetails } from "../api/tmdb-api";
import { ErrorPlaceholder } from "../components/ErrorPlaceholder";

const MovieDetailsPage = () => {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Зберігаємо місце, звідки прийшов користувач, щоб повернутися назад
  const backLinkHref = useRef(location.state?.from ?? "/movies");

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMovieDetails(movieId);
        setMovie(data);
      } catch (error) {
        setError(error.message || "Помилка завантаження");
        //console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovieData();
  }, [movieId, retry]);

  if (loading) {
    return (
      <Center h="50vh">
        <Loader size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container py="xl">
        <ErrorPlaceholder
          message={error}
          onRetry={() => setRetry((prev) => prev + 1)}
        />
      </Container>
    );
  }

  if (!movie) {
    return (
      <Container py="xl">
        <Text ta="center" size="lg" c="dimmed">
          Фільм не знайдено
        </Text>
      </Container>
    );
  }

  const { title, poster_path, overview, vote_average, genres, release_date } =
    movie;

  return (
    <Container size="lg" py="xl">
      {/* Кнопка назад */}
      <Button
        component={Link}
        to={backLinkHref.current}
        variant="subtle"
        leftSection={<HiArrowLeft />}
        mb="xl"
      >
        Назад до списку
      </Button>

      <Grid gutter="xl">
        {/* Постер фільму */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Image
            src={
              poster_path
                ? `https://image.tmdb.org/t/p/w500${poster_path}`
                : "https://placehold.co/500x750?text=No+Poster"
            }
            radius="md"
            alt={title}
            shadow="lg"
          />
        </Grid.Col>

        {/* Інформація про фільм */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="md">
            <Title order={1}>
              {title} ({release_date?.slice(0, 4)})
            </Title>

            <Group gap="xs">
              <Badge
                size="lg"
                variant="gradient"
                gradient={{ from: "orange", to: "red" }}
              >
                Рейтинг: {vote_average.toFixed(1)}
              </Badge>
              {genres?.map((genre) => (
                <Badge key={genre.id} variant="outline" color="blue">
                  {genre.name}
                </Badge>
              ))}
            </Group>

            <Title order={3} mt="md">
              Огляд
            </Title>
            <Text size="lg" lh={1.6}>
              {overview || "Опис фільму відсутній."}
            </Text>
          </Stack>
        </Grid.Col>
      </Grid>

      <Divider my="xl" label="Додаткова інформація" labelPosition="center" />

      {/* Навігація всередині сторінки через Tabs */}
      <Tabs
        defaultValue="cast"
        variant="outline"
        onChange={(value) => navigate(value)}
      >
        <Tabs.List mb="md">
          <Tabs.Tab value="cast" component={Link} to="cast">
            Акторський склад
          </Tabs.Tab>
          <Tabs.Tab value="reviews" component={Link} to="reviews">
            Відгуки
          </Tabs.Tab>
        </Tabs.List>

        {/* Тут рендериться Cast або Reviews */}
        <div style={{ paddingTop: "20px" }}>
          <Outlet />
        </div>
      </Tabs>
    </Container>
  );
};

export default MovieDetailsPage;
