export interface Film {
  id: number;
  title: string;
  year?: string;
  poster?: string;
  rating?: number;
  description?: string;
  genres?: string[];
}

export interface Review {
  id: number;
  userName: string;
  filmTitle: string;
  rating: number;
  reviewText: string;
  createdAt: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
}

export interface UserFilm {
  id: number; // id записи Review или tmdbId? Лучше использовать tmdbId как ключ, но для списка нужен уникальный ключ
  tmdbId: number;
  title: string;
  poster?: string;
  status: 'watched' | 'want' | 'favorite';
  rating?: number;
  reviewText?: string;
  createdAt?: string;
}