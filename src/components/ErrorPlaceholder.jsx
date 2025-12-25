import { Title, Text, Button, Stack, Center } from "@mantine/core";
import { HiOutlineCloud, HiOutlineExclamationTriangle } from "react-icons/hi2";

export const ErrorPlaceholder = ({ message, onRetry }) => {
  const isNetworkError = message.toLowerCase().includes("network");

  return (
    <Center py={50}>
      <Stack align="center" gap="md">
        {isNetworkError ? (
          <HiOutlineCloud size={50} color="var(--mantine-color-gray-5)" />
        ) : (
          <HiOutlineExclamationTriangle
            size={50}
            color="var(--mantine-color-red-6)"
          />
        )}
        <Title order={3}>{isNetworkError ? "Connection Issue" : "Oops!"}</Title>
        <Text c="dimmed" ta="center" maw={400}>
          {message}
        </Text>
        {onRetry && <Button onClick={onRetry}>Try again</Button>}
      </Stack>
    </Center>
  );
};

export default ErrorPlaceholder;
