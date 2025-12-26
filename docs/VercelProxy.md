# Iнструкція: Безпечна робота з API у Vite + Vercel

Ця архітектура дозволяє повністю приховати ваш **TMDB Bearer Token** від кінцевого користувача, пропускаючи запити через серверні функції.

## 1. Налаштування для локальної розробки

Щоб розробляти проєкт на власному комп'ютері з робочим API:

1. **Встановіть Vercel CLI** (якщо ще не встановлено):
```bash
npm install -g vercel

```


2. Створіть файл `.env.local**` у корені проєкту:
```text
TMDB_TOKEN=ваш_секретний_bearer_token_тут

```


*(Важливо: не використовуйте префікс VITE_, щоб ключ не потрапив у клієнтський бандл).*
3. Підготуйте оточення (особливо для Linux/macOS):
Якщо при запуску ви бачите помилку "TMDB_TOKEN is missing", виконайте в терміналі:
```bash
export TMDB_TOKEN=ваш_секретний_token

```


4. Запустіть сервер розробки:
```bash
vercel dev

```


Проєкт буде доступний за адресою `http://localhost:3000`.

---

## 2. Деплоймент на Vercel (Production)

Коли код готовий до публікації:

1. Створіть/перевірте `vercel.json` у корені:
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


2. Запушіть код у ваш репозиторій** (GitHub/GitLab).
3. Налаштуйте змінні в панелі Vercel**:
* Зайдіть у ваш проєкт на сайті Vercel.
* Перейдіть у **Settings** -> **Environment Variables**.
* Додайте `TMDB_TOKEN` з вашим ключем.


4. Створіть новий Deployment, щоб Vercel підхопив налаштування та змінні.

---

## 3. Пояснення файлу `api/movies.js` (Серверна функція)

Цей файл є вашим "секретним шлюзом". Він виконується на Node.js (на сервері), а не в браузері.

**Логіка роботи:**

* **Приховування ключа:** Браузер звертається до `/api/movies`, а ключ `TMDB_TOKEN` додається до запиту вже на сервері. Клієнт ніколи не бачить цей токен.
* **Універсальність:** Замість створення окремого файлу для кожного запиту, ми передаємо параметр `path` (наприклад, `movie/popular`), який функція підставляє в URL до TMDB.
* **Проксіювання:** Параметр `...queryParams` дозволяє вашому фронтенду передавати будь-які додаткові дані (номер сторінки, текст пошуку) без змін.

---

## 4. Оновлення `src/api/tmdb-api.js` (Фронтенд)

Тепер потрібно змінити ваші функції, щоб вони зверталися до вашого нового проксі.

```javascript
import axios from "axios";
import { formatMovieData, formatCastData, formatReviewData } from "./formatTmdbData.js";

// Звертаємося до локального /api замість api.themoviedb.org
const api = axios.create({
  baseURL: "/api",
});

/**
 * Універсальний метод для виклику проксі-функції
 * @param {string} tmdbPath - шлях у системі TMDB (напр. 'movie/popular')
 * @param {object} params - додаткові query параметри
 */
const fetchFromProxy = async (tmdbPath, params = {}) => {
  const response = await api.get("/movies", {
    params: {
      path: tmdbPath,
      ...params,
    },
  });
  return response.data;
};

// --- Приклади оновлених методів ---

export const getTrendingMovies = async () => {
  const data = await fetchFromProxy("trending/movie/day");
  return data.results.map(formatMovieData);
};

export const getMovieDetails = async (movieId) => {
  const data = await fetchFromProxy(`movie/${movieId}`);
  return formatMovieData(data);
};

export const searchMovies = async (query, page = 1) => {
  const data = await fetchFromProxy("search/movie", { query, page });
  return {
    ...data,
    results: data.results.map(formatMovieData),
  };
};

export const getMovieCast = async (movieId) => {
  const data = await fetchFromProxy(`movie/${movieId}/credits`);
  return data.cast.map(formatCastData);
};

export const getMovieReviews = async (movieId) => {
  const data = await fetchFromProxy(`movie/${movieId}/reviews`);
  return data.results.map(formatReviewData);
};

```

### Чому це краще:

1. **Безпека:** Навіть якщо хтось скопіює ваш фронтенд-код, вони не зможуть скористатися вашим API-ключем.
2. **Чистота:** Всі налаштування заголовків (Headers) та авторизації знаходяться в одному місці на сервері.
3. **Гнучкість:** Якщо ви захочете змінити джерело даних (наприклад, перейти з TMDB на інший сервіс), вам потрібно буде змінити лише один файл у папці `api/`, не чіпаючи компоненти React.

Тепер ваш додаток відповідає сучасним стандартам безпеки веб-розробки!