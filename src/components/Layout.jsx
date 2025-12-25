import { AppShell, Container, Group, Text, Anchor } from "@mantine/core";
import { Link, Outlet } from "react-router-dom";
import { ColorSchemeToggle } from "./ColorSchemeToggle";

export const Layout = () => {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Container size="lg" h="100%">
          <Group h="100%" px="md" justify="space-between">
            <Text
              fw={900}
              size="xl"
              variant="gradient"
              gradient={{ from: "blue", to: "cyan" }}
              component={Link}
              to="/"
              style={{ textDecoration: "none" }}
            >
              MOVIE-SEARCH
            </Text>

            <Group gap="xl">
              <Group gap="md">
                <Anchor component={Link} to="/" fw={500}>
                  Home
                </Anchor>
                <Anchor component={Link} to="/movies" fw={500}>
                  Search
                </Anchor>
              </Group>

              <ColorSchemeToggle />
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};
export default Layout;
