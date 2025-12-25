import { Container, Title, Text, Button, Group, Stack } from "@mantine/core";
import { Link } from "react-router-dom";
import classes from "./NotFoundPage.module.css";

const NotFoundPage = () => {
  return (
    <Container className={classes.root}>
      {/* Великий фоновий напис 404 */}
      <div className={classes.label}>404</div>

      <Stack align="center" gap="md" className={classes.inner}>
        <Title className={classes.title}>You have found a secret place.</Title>

        <Text c="dimmed" size="lg" ta="center" className={classes.description}>
          Sorry, this page does not exist. You may have entered the wrong
          address or the page has moved to a different URL.
        </Text>

        <Group justify="center">
          <Button
            component={Link}
            to="/"
            variant="gradient"
            gradient={{ from: "blue", to: "cyan" }}
            size="md"
          >
            Return to the main page
          </Button>
        </Group>
      </Stack>
    </Container>
  );
};

export default NotFoundPage;
