import { Title, Text, Button, Stack, Center } from "@mantine/core";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";

export const ErrorPlaceholder = ({ message, onRetry }) => {
  return (
    <Center py={50}>
      <Stack align="center" gap="md">
        <HiOutlineExclamationTriangle
          size={50}
          color="var(--mantine-color-red-6)"
        />
        <Title order={3}>Ой! Щось пішло не так</Title>
        <Text c="dimmed" ta="center" maw={400}>
          {message ||
            "Не вдалося завантажити дані. Перевірте підключення до інтернету."}
        </Text>
        {onRetry && (
          <Button variant="light" color="blue" onClick={onRetry}>
            Спробувати знову
          </Button>
        )}
      </Stack>
    </Center>
  );
};
export default ErrorPlaceholder;
