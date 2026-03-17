// Интерфейс для фильма из поиска (ответ от Кинопоиска)
export interface Film {
  id: number;              // tmdbId
  title: string;
  year?: string;
  poster?: string;
  rating?: number;         // рейтинг Кинопоиска (не путать с пользовательским)
  description?: string;
  genres?: string[];
}

// Интерфейс для фильма в коллекции пользователя (ответ от /api/users/:userId/films)
export interface UserFilm {
  id: number;              // tmdbId
  title: string;
  poster?: string;
  year?: string;
  genres?: string[];
  status: 'watched' | 'want';
  rating?: number;         // пользовательская оценка (1-5)
  reviewText?: string;
  isFavorite?: boolean;
  createdAt: string;
}

// Интерфейс для элемента ленты (ответ от /api/feed)
export interface ReviewItem {
  id: number;
  userName: string;
  filmTitle: string;
  filmYear?: string;
  filmGenres?: string[];
  status: 'watched' | 'want';
  rating?: number;         // пользовательская оценка
  reviewText?: string;
  isFavorite?: boolean;
  createdAt: string;
}

// Интерфейс пользователя (из localStorage и ответа /api/auth)
export interface User {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
}