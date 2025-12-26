// api/movies.js
import axios from "axios";

export default async function handler(req, res) {
  // Отримуємо параметри з URL запиту
  // Наприклад: /api/movies?path=movie/550&query=...
  const { path, ...queryParams } = req.query;

  // Отримуємо ключ із змінних оточення (налаштовується у Vercel або .env.local)
    const API_KEY = process.env.TMDB_TOKEN;
    
  // console.log("API_KEY:", API_KEY)
  // console.log("All env vars:", Object.keys(process.env).filter(k => k.includes('TMDB')));


  if (!API_KEY) {
    return res.status(500).json({ error: "Server configuration error: TMDB_TOKEN is missing" });
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
      message: error.response?.data?.status_message || "Error fetching data from TMDB",
    });
  }
}