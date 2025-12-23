// src/components/MovieCard/MovieCardSkeleton.jsx
import { Card, Skeleton, Stack, Group } from "@mantine/core";

export const MovieCardSkeleton = () => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      {/* Скелетон для зображення (постера) */}
      <Card.Section>
        <Skeleton height={320} />
      </Card.Section>

      <Stack mt="md" gap="xs">
        <Group justify="space-between">
          {/* Скелетон для назви фільму */}
          <Skeleton height={20} width="70%" radius="xl" />
          {/* Скелетон для бейджа з рейтингом */}
          <Skeleton height={20} width={40} radius="xl" />
        </Group>

        {/* Скелетон для року випуску */}
        <Skeleton height={15} width="40%" radius="xl" mt={5} />
      </Stack>
    </Card>
  );
};
export default MovieCardSkeleton;