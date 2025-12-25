import {
  Card,
  Image,
  Text,
  Badge,
  Group,
  Stack,
  Transition,
} from "@mantine/core";
import { Link } from "react-router-dom";
import classes from "./MovieCard.module.css";

const MovieCard = ({ movie, location }) => {
  const { id, title, poster_path, vote_average, release_date } = movie;


  // TMDB постер або заглушка, якщо фото немає
  const imageUrl = poster_path
    // ? `https://image.tmdb.org/t/p/w400${poster_path}`
    // : "https://placehold.co/400x600?text=No+Poster";

  const releaseYear = release_date ? release_date.slice(0, 4) : "N/A";

  // Визначаємо колір бейджа залежно від рейтингу
  const ratingColor =
    vote_average >= 7 ? "green" : vote_average >= 5 ? "yellow" : "red";

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      component={Link}
      to={`/movies/${id}`}
      state={{ from: location }} // Передаємо локацію для кнопки "Go back"
      className={classes.card}
    >
      <Card.Section>
        <Image
          src={imageUrl}
          style={{ aspectRatio: "2 / 3", objectPosition: "top" }}
          fit="cover"
          alt={title}
          fallbackSrc="https://placehold.co/400x600?text=No+Poster"
        />
      </Card.Section>

      <Stack mt="md" gap="xs">
        <Text fw={700} size="lg" lineClamp={1} title={title}>
          {title}
        </Text>

        <Group gap="xs">
          <Text size="sm" c="dimmed">
            {releaseYear}
          </Text>

          <Badge color={ratingColor} variant="light" size="sm">
            {vote_average.toFixed(1)}
          </Badge>
        </Group>
      </Stack>
    </Card>
  );
};

export default MovieCard;
