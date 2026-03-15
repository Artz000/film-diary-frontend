import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface Review {
  id: number;
  userName: string;
  filmTitle: string;
  rating: number;
  reviewText: string;
  createdAt: string;
}

interface FeedProps {
  user: any;
}

export default function Feed({ user }: FeedProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/feed`, {
          headers: { 'user-id': user.id }
        });
        // Проверяем, что ответ - массив
        if (Array.isArray(response.data)) {
          setReviews(response.data);
        } else {
          console.error('Feed data is not an array:', response.data);
          setError('Неверный формат данных от сервера');
        }
      } catch (err) {
        console.error('Error fetching feed:', err);
        setError('Не удалось загрузить ленту. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchFeed();
    }
  }, [user]);

  if (loading) return <div>Загрузка ленты...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (reviews.length === 0) return <div>Нет рецензий от друзей</div>;

  return (
    <div>
      <h2>Лента друзей</h2>
      {reviews.map((rev) => (
        <div key={rev.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px', marginBottom: '10px', background: 'white' }}>
          <strong>{rev.userName}</strong> оценил(а) <strong>{rev.filmTitle}</strong> на {rev.rating} ⭐
          <p>{rev.reviewText}</p>
          <small>{new Date(rev.createdAt).toLocaleDateString()}</small>
        </div>
      ))}
    </div>
  );
}