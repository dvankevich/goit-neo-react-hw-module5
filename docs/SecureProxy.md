# 🚀 Copy-Paste Інструкція: Secure TMDB Proxy

## 1. Конфігурація Vercel (`vercel.json`)

Створіть цей файл у **корені** проєкту. Він забезпечує правильну роботу маршрутів та усуває конфлікти з Vite.

```json
{
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/((?!api/|src/|node_modules/|@vite/|@react-refresh|index\\.html|.*\\.).*)",
      "destination": "/index.html"
    }
  ]
}

```

---

## 2. Серверна функція (`api/movies.js`)

Створіть папку `api` в **корені**, а в ній файл `movies.js`.

```javascript
import axios from "axios";

export default async function handler(req, res) {
  const { path, ...queryParams } = req.query;
  const API_KEY = process.env.TMDB_TOKEN;
  const EXPECTED_SECRET = process.env.INTERNAL_APP_SECRET;

  // 1. Перевірка секретного ключа (захист від прямих запитів)
  if (req.headers["x-app-usage-token"] !== EXPECTED_SECRET) {
    return res.status(403).json({ error: "Forbidden: Direct access denied" });
  }

  // 2. Універсальна перевірка домену (Referer)
  if (process.env.NODE_ENV === "production") {
    const referer = req.headers.referer || "";
    const isVercel = referer.includes("goit-neo-react-hw-module5") && referer.includes(".vercel.app");
    const isLocal = referer.includes("localhost");

    if (!isVercel && !isLocal) {
      return res.status(403).json({ error: "Access denied: Unauthorized origin" });
    }
  }

  if (!API_KEY) return res.status(500).json({ error: "Server error: Missing TMDB Token" });

  try {
    const response = await axios.get(`https://api.themoviedb.org/3/${path}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        accept: "application/json",
      },
      params: { language: "en-US", ...queryParams },
    });
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(error.response?.status || 500).json({ message: error.message });
  }
}

```

---

## 3. Налаштування API на фронтенді (`src/api/tmdb-api.js`)

Замініть ваш базовий Axios-інстанс та методи.

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    // Vite підтягне це з .env.local або налаштувань Vercel
    "x-app-usage-token": import.meta.env.VITE_INTERNAL_APP_SECRET
  }
});

const fetchFromProxy = async (tmdbPath, params = {}) => {
  const response = await api.get("/movies", {
    params: { path: tmdbPath, ...params },
  });
  return response.data;
};

// Приклад використання:
export const getTrendingMovies = async () => {
  const data = await fetchFromProxy("trending/movie/day");
  return data.results; 
};

export const searchMovies = async (query) => {
  return await fetchFromProxy("search/movie", { query });
};

```

---

## 4. Файл змінних оточення (`.env.local`)

Цей файл має бути у вашому `.gitignore`.

```text
# Секрет для TMDB (використовує тільки сервер)
TMDB_TOKEN=ваш_довгий_bearer_token

# Секрет для зв'язку фронтенд <-> бекенд
INTERNAL_APP_SECRET=будь_яка_складна_фраза_123
VITE_INTERNAL_APP_SECRET=будь_яка_складна_фраза_123

```

---

## 5. Шпаргалка команд CLI для деплою

| Дія | Команда |
| --- | --- |
| **Авторизація** | `vercel login` |
| **Зв'язати проєкт** | `vercel link` |
| **Стягнути змінні з хмари** | `vercel env pull .env.local` |
| **Запуск локально** | `vercel dev` |
| **Деплой у Preview** | `git push origin vercel-functions` |
| **Деплой у Production** | `vercel --prod` |

---

### Що перевірити, якщо не працює на Vercel?

1. Зайдіть у **Settings -> Environment Variables** на сайті Vercel.
2. Перевірте, чи додані всі **три** змінні: `TMDB_TOKEN`, `INTERNAL_APP_SECRET`, `VITE_INTERNAL_APP_SECRET`.
3. Переконайтеся, що для кожної з них стоїть галочка **Preview** (якщо ви тестуєте в гілці).
4. Якщо ви змінили змінні, обов'язково зробіть **Redeploy** останньої збірки у вкладці Deployments.

