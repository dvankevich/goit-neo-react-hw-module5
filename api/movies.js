// api/movies.js
import axios from "axios";

export default async function handler(req, res) {
  // Отримуємо параметри з URL запиту
  // Наприклад: /api/movies?path=movie/550&query=...
  const { path, ...queryParams } = req.query;

  // Отримуємо ключ із змінних оточення (налаштовується у Vercel або .env.local)
  const API_KEY = process.env.TMDB_TOKEN;

  // 1. ПЕРЕВІРКА СЕКРЕТНОГО ЗАГОЛОВКА
  // Ви можете придумати будь-яку строку. Вона має бути однаковою тут і на фронтенді.
  const EXPECTED_SECRET = process.env.INTERNAL_APP_SECRET;
  if (req.headers["x-app-usage-token"] !== EXPECTED_SECRET) {
    return res
      .status(403)
      .json({ error: "Forbidden: Direct API access is not allowed" });
  }

  // 2. ПЕРЕВІРКА REFERER (Тільки для Production)
  if (process.env.NODE_ENV === "production") {
    const referer = req.headers.referer || "";

    // Дозволяємо будь-який субдомен на vercel.app, що належить вашому акаунту
    // (зазвичай назва проєкту є частиною URL)
    const isVercel =
      referer.includes("goit-neo-react-hw-module5") &&
      referer.includes(".vercel.app");
    const isLocal = referer.includes("localhost");

    if (!isVercel && !isLocal) {
      return res.status(403).json({ error: "Access denied" });
    }
  }

  if (!API_KEY) {
    return res
      .status(500)
      .json({ error: "Server configuration error: TMDB_TOKEN is missing" });
  }

  if (!path) {
    return res.status(400).json({ error: "Path parameter is required" });
  }

  try {
    const response = await axios.get(`https://api.themoviedb.org/3/${path}`, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      params: {
        language: "en-US",
        ...queryParams, // Передаємо query, page тощо, якщо вони є
      },
    });

    // Повертаємо дані клієнту
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      message:
        error.response?.data?.status_message || "Error fetching data from TMDB",
    });
  }
}
