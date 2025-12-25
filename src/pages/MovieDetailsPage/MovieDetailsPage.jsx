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
  Anchor,
} from "@mantine/core";

import { HiArrowLeft, HiExternalLink } from "react-icons/hi";
import { getMovieDetails } from "../../api/tmdb-api";
import { ErrorPlaceholder } from "../../components/ErrorPlaceholder";
import classes from "./MovieDetailsPage.module.css";

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
        console.log(data);
      } catch (error) {
        setError(error.message || "Network error");
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
          Movie not found
        </Text>
      </Container>
    );
  }

  const {
    title,
    poster_path,
    overview,
    vote_average,
    genres,
    release_date,
    homepage,
    runtime,
    tagline,
    production_countries,
    production_companies,
    budget,
    revenue,
    status,
  } = movie;

  const formattedDate = release_date
    ? new Date(release_date).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Date unknown";

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
        Back
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
            <div>
              <Title order={1}>
                {title} ({release_date?.slice(0, 4)})
              </Title>
              {tagline && (
                <Text c="dimmed" fs="italic" size="lg">
                  "{tagline}"
                </Text>
              )}
            </div>

            <Group gap="xs">
              <Badge
                size="lg"
                variant="gradient"
                gradient={{ from: "orange", to: "red" }}
              >
                Рейтинг: {vote_average.toFixed(1)}
              </Badge>
              <Badge size="lg" color="gray" variant="outline">
                {runtime} хв.
              </Badge>
              <Badge size="lg" color="blue" variant="light">
                {status === "Released" ? "Released" : "Expected"}
              </Badge>

              {homepage && (
                <Anchor
                  href={homepage}
                  target="_blank"
                  size="sm"
                  fw={500}
                  underline="hover"
                >
                  Official site{" "}
                  <HiExternalLink
                    size={14}
                    style={{ verticalAlign: "middle" }}
                  />
                </Anchor>
              )}
            </Group>
            <Group>
              {genres?.map((genre) => (
                <Badge key={genre.id} size="lg" variant="default" fw={500}>
                  {genre.name}
                </Badge>
              ))}
            </Group>

            {/* Блок з деталями */}
            <Grid gutter="xs" mt="sm">
              <Grid.Col span={6}>
                <Text size="sm" fw={700}>
                  Premiere:
                </Text>
                <Text size="sm">{formattedDate}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text size="sm" fw={700}>
                  Country:
                </Text>
                <Text size="sm">
                  {production_countries?.map((c) => c.name).join(", ") || "N/A"}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" fw={700}>
                  Budget:
                </Text>
                <Text size="sm">${budget?.toLocaleString() || "0"}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" fw={700}>
                  Total Revenue:
                </Text>
                <Text size="sm">${revenue?.toLocaleString() || "0"}</Text>
              </Grid.Col>
            </Grid>

            <Divider />

            <Title order={3}>Review</Title>
            <Text size="lg" lh={1.6}>
              {overview || "There is no description of the movie."}
            </Text>
          </Stack>
          {/* Блок кінокомпаній */}
          <Stack gap="xs" mt="xl">
            <Title
              order={4}
              size="h5"
              c="dimmed"
              style={{ textTransform: "uppercase", letterSpacing: "1px" }}
            >
              Production
            </Title>
            <Group gap="xl" wrap="wrap">
              {production_companies?.map((company) => (
                <Group key={company.id} gap="xs">
                  {company.logo_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                      h={30}
                      w="auto"
                      fit="contain"
                      alt={company.name}
                      title={company.name}
                      className={classes.productionLogo} // Додамо клас із CSS-модуля
                    />
                  ) : (
                    <Text size="sm" fw={500} c="dimmed">
                      {company.name}
                    </Text>
                  )}
                </Group>
              ))}
            </Group>
          </Stack>
        </Grid.Col>
      </Grid>

      <Divider my="xl" label="Additional information" labelPosition="center" />

      {/* Навігація всередині сторінки через Tabs */}
      <Tabs
        defaultValue="cast"
        variant="outline"
        onChange={(value) => navigate(value)}
      >
        <Tabs.List mb="md">
          <Tabs.Tab value="cast" component={Link} to="cast">
            Cast
          </Tabs.Tab>
          <Tabs.Tab value="reviews" component={Link} to="reviews">
            Reviews
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
