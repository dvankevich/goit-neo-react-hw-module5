export const formatMovieData = (movie) => {
  return {
    ...movie,
    // Якщо vote_average null або undefined — ставимо 0
    vote_average: movie.vote_average ?? 0,

    // Обробка порожнього заголовка
    title: movie.title || movie.original_title || "Untitled",

    // Обробка відсутності дати
    release_date: movie.release_date || "Unknown",

    // Заглушка для постера
    poster_path: movie.poster_path
      ? `https://image.tmdb.org/t/p/w400${movie.poster_path}`
      : "https://placehold.co/400x600?text=No+Poster",
  };
};

export const formatCastData = (actor) => ({
  ...actor,
  profile_path: actor.profile_path
    ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
    : "https://placehold.co/200x300?text=No+Photo",
});

export const formatReviewData = (review) => {
  const { author_details } = review;
  const avatarPath = author_details?.avatar_path;

  let finalAvatar = null; // Повертаємо null, якщо аватара немає, щоб Mantine міг показати ініціали

  if (avatarPath) {
    if (avatarPath.startsWith("http") || avatarPath.startsWith("/http")) {
      // Якщо це посилання на зовнішній ресурс (наприклад, Gravatar)
      // Видаляємо зайвий слеш попереду, якщо він є (/https://...)
      finalAvatar = avatarPath.startsWith("/")
        ? avatarPath.substring(1)
        : avatarPath;
    } else {
      // Якщо це звичайний шлях до картинки на серверах TMDB
      finalAvatar = `https://image.tmdb.org/t/p/w45${avatarPath}`;
    }
  }

  return {
    ...review,
    author_details: {
      ...author_details,
      // Замінюємо старий шлях на вже готовий URL або null
      avatar_path: finalAvatar,
    },
    // Додатково: обробка порожнього тексту відгуку
    content: review.content || "No content provided for this review.",
  };
};
