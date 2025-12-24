import {
  ActionIcon,
  useMantineColorScheme,
  useComputedColorScheme,
} from "@mantine/core";
import { HiSun, HiMoon } from "react-icons/hi2";

export function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();

  const computedColorScheme = useComputedColorScheme("light");

  return (
    <ActionIcon
      onClick={() =>
        setColorScheme(computedColorScheme === "light" ? "dark" : "light")
      }
      variant="default"
      size="lg"
      aria-label="Toggle color scheme"
    >
      {computedColorScheme === "light" ? (
        <HiMoon size={20} color="var(--mantine-color-blue-6)" />
      ) : (
        <HiSun size={20} color="var(--mantine-color-yellow-4)" />
      )}
    </ActionIcon>
  );
}

export default ColorSchemeToggle;
