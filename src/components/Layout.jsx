import { AppShell, Container, Group, Anchor } from "@mantine/core";
import { Link, Outlet } from "react-router-dom";

export function Layout() {
    return (
        <AppShell header={{ height: 60 }} padding="md">
            <AppShell.Header>
                <Container size="lg" h="100%">
                    <Group h="100%" px="md">
                        {/* Замість звичайних посилань - Mantine Anchor або NavLink */}
                        <Anchor component={Link} to="/" fw={500}>
                            Home
                        </Anchor>
                        <Anchor component={Link} to="/movies" fw={500}>
                            Movies
                        </Anchor>
                    </Group>
                </Container>
            </AppShell.Header>

            <AppShell.Main>
                <Container size="lg">
                    <Outlet /> {/* Тут будуть рендеритися сторінки */}
                </Container>
            </AppShell.Main>
        </AppShell>
    );
}
