import { Container, Title, Text, Button, Group, Stack } from "@mantine/core";
import { Link } from "react-router-dom";
import classes from "./NotFoundPage.module.css";

const NotFoundPage = () => {
  return (
    <Container className={classes.root}>
      {/* Великий фоновий напис 404 */}
      <div className={classes.label}>404</div>

      <Stack align="center" gap="md" className={classes.inner}>
        <Title className={classes.title}>Ви знайшли секретне місце.</Title>

        <Text c="dimmed" size="lg" ta="center" className={classes.description}>
          На жаль, ця сторінка не існує. Можливо, ви помилилися адресою або
          сторінку було перенесено на інший URL.
        </Text>

        <Group justify="center">
          <Button
            component={Link}
            to="/"
            variant="gradient"
            gradient={{ from: "blue", to: "cyan" }}
            size="md"
          >
            Повернутися на головну сторінку
          </Button>
        </Group>
      </Stack>
    </Container>
  );
};

export default NotFoundPage;
