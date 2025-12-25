import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core"; // 1. Імпортуємо провайдер
import "@mantine/core/styles.css"; // 2. Імпортуємо базові стилі (обов'язково!)
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import App from "./App.jsx";
import { ErrorPlaceholder } from "./components/ErrorPlaceholder.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* MantineProvider має бути ЗОВНІ App */}
    <MantineProvider defaultColorScheme="auto">
      <ErrorBoundary
        fallback={
          <ErrorPlaceholder
            message="Critical App Error"
            onRetry={() => window.location.reload()}
          />
        }
      >
        <Notifications position="top-right" zIndex={1000} />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </MantineProvider>
  </StrictMode>
);
