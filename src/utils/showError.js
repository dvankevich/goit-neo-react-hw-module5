import { notifications } from "@mantine/notifications";

export const showError = (title, message) => {
  notifications.show({
    title: title || "Помилка",
    message: message || "Щось пішло не так. Спробуйте пізніше.",
    color: "red",
    autoClose: 5000,
    withCloseButton: true,
  });
};
