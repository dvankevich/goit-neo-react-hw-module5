import { AppShell, Container, Group, Text, Anchor } from "@mantine/core";
import { Link, Outlet } from "react-router-dom";
import { ColorSchemeToggle } from "./ColorSchemeToggle";
import { useLocation } from "react-router-dom";

export const Layout = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

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
                <Anchor
                  component={Link}
                  to="/"
                  fw={isActive("/") ? 700 : 500} // Жирний шрифт для активного
                  c={isActive("/") ? "blue.6" : "dimmed"} // Синій для активного, сірий для інших
                  underline={isActive("/") ? "always" : "hover"} // Завжди підкреслено для активного
                >
                  Home
                </Anchor>
                <Anchor
                  component={Link}
                  to="/movies"
                  fw={isActive("/movies") ? 700 : 500}
                  c={isActive("/movies") ? "blue.6" : "dimmed"}
                  underline={isActive("/movies") ? "always" : "hover"}
                >
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
