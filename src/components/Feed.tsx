import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config'; // предположим, что у тебя есть такой файл

// Тип для рецензии (если ещё не описан в types.ts)
interface Review {
  id: number;
  userName: string;
  filmTitle: string;
  rating: number;
  reviewText: string;
  createdAt: string;
}

interface FeedProps {
  user: {
    id: number;
    firstName: string;
    lastName?: string;
    username?: string;
  };
}

export default function Feed({ user }: FeedProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      setError(null);

      // 🔁 ЗАГЛУШКА – пока бэкенд не готов, используем мок-данные
      // Как только бэкенд с эндпоинтом /api/feed заработает,
      // удали или закомментируй этот блок и раскомментируй реальный запрос ниже
      setTimeout(() => {
        const mockReviews: Review[] = [
          {
            id: 1,
            userName: 'Анна',
            filmTitle: 'Интерстеллар',
            rating: 5,
            reviewText: 'Гениальный фильм, пересматривал много раз!',
            createdAt: '2025-02-20T10:00:00Z',
          },
          {
            id: 2,
            userName: 'Петр',
            filmTitle: 'Дюна',
            rating: 4,
            reviewText: 'Красиво, но местами затянуто',
            createdAt: '2025-02-19T15:30:00Z',
          },
        ];
        setReviews(mockReviews);
        setLoading(false);
      }, 1000);

      // 🔁 РЕАЛЬНЫЙ ЗАПРОС (раскомментируй, когда бэкенд готов)
      
      try {
        const response = await axios.get(`${API_BASE_URL}/api/feed`, {
          headers: { 'user-id': user.id }, // если бэкенд требует идентификатор
        });
        setReviews(response.data);
      } catch (err) {
        console.error('Ошибка загрузки ленты:', err);
        setError('Не удалось загрузить ленту. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
      
    };

    fetchFeed();
  }, [user.id]); // перезагружаем, если изменился user.id (хотя обычно этого не происходит)

  // Форматирование даты
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '20px' }}>Загрузка ленты...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>{error}</div>;
  }

  if (reviews.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        Пока нет рецензий. Подпишитесь на друзей или добавьте свой первый отзыв!
      </div>
    );
  }

  return (
    <div>
      <h2>Лента друзей</h2>
      {reviews.map((review) => (
        <div
          key={review.id}
          style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '12px',
            backgroundColor: 'white',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontWeight: 'bold' }}>{review.userName}</span>
            <span style={{ color: '#666' }}>оценил(а)</span>
            <span style={{ fontWeight: 'bold' }}>{review.filmTitle}</span>
            <span style={{ marginLeft: 'auto', color: '#f5b342' }}>{'★'.repeat(review.rating)}</span>
          </div>
          {review.reviewText && (
            <p style={{ margin: '8px 0', fontStyle: 'italic' }}>«{review.reviewText}»</p>
          )}
          <div style={{ fontSize: '12px', color: '#999' }}>
            {formatDate(review.createdAt)}
          </div>
        </div>
      ))}
    </div>
  );
}