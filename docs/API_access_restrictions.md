Версія серверної функції з вбудованим захистом. Ми використаємо комбінацію перевірки **Referer** (звідки прийшов запит) та **Custom Secret Header** (спеціальний "пароль" між вашим фронтендом і бекендом).

### 1. Оновіть серверну функцію `api/movies.js`

Цей код автоматично дозволяє запити з `localhost` під час розробки, але на сервері перевіряє ваш реальний домен.

```javascript
// api/movies.js
import axios from "axios";

export default async function handler(req, res) {
  const { path, ...queryParams } = req.query;
  const API_KEY = process.env.TMDB_TOKEN;

  // 1. ПЕРЕВІРКА СЕКРЕТНОГО ЗАГОЛОВКА
  // Ви можете придумати будь-яку строку. Вона має бути однаковою тут і на фронтенді.
  const APP_SECRET = "my_internal_app_secret_123";
  if (req.headers["x-app-usage-token"] !== APP_SECRET) {
    return res.status(403).json({ error: "Forbidden: Direct API access is not allowed" });
  }

  // 2. ПЕРЕВІРКА REFERER (Тільки для Production)
  if (process.env.NODE_ENV === "production") {
    const referer = req.headers.referer || "";
    // Замініть 'your-app-name.vercel.app' на вашу реальну адресу після деплою
    if (!referer.includes("your-app-name.vercel.app")) {
      return res.status(403).json({ error: "Access denied: Unauthorized origin" });
    }
  }

  if (!API_KEY) return res.status(500).json({ error: "Server configuration error" });

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
#### Генерація випадкового рядка
```bash
openssl rand -base64 32
```

---

### 2. Оновіть клієнтський `src/api/tmdb-api.js`

Тепер ваш фронтенд буде "представлятися" серверу, надсилаючи секретний заголовок.

```javascript
// src/api/tmdb-api.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    // Цей заголовок має збігатися з APP_SECRET у файлі api/movies.js
    "x-app-usage-token": "my_internal_app_secret_123"
  }
});

// Універсальна функція запиту залишається такою ж
const fetchFromProxy = async (tmdbPath, params = {}) => {
  const response = await api.get("/movies", {
    params: { path: tmdbPath, ...params },
  });
  return response.data;
};

// ... ваші функції (getTrendingMovies і т.д.)

```

---

### 3. Чому це працює?

1. **Захист від прямих запитів**: Якщо хтось спробує відкрити `https://ваш-сайт.vercel.app/api/movies?path=...` просто в браузері, він отримає помилку `403 Forbidden`, бо браузер не надіслав заголовок `x-app-usage-token`.
2. **Захист від копіювання**: Навіть якщо хтось побачить цей заголовок у вашому коді, перевірка `Referer` на сервері не дозволить йому робити запити зі свого власного сайту (наприклад, з `localhost` іншої людини або іншого домену).
3. **Локальна розробка**: Завдяки умові `process.env.NODE_ENV === "production"`, ви зможете спокійно працювати на `localhost`, не блокуючи самого себе.

### Як перевірити:

1. Запустіть `vercel dev`.
2. Відкрийте додаток — він має працювати як зазвичай.
3. Спробуйте відкрити адресу API в новій вкладці браузера: `http://localhost:3000/api/movies?path=trending/movie/day`.
4. **Ви маєте побачити помилку** `{"error": "Forbidden: Direct API access is not allowed"}`.

Це означає, що захист працює! Тепер ваші дані доступні **тільки через ваш інтерфейс**.