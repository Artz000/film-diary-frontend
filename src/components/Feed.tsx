import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface Review {
  id: number;
  userId: number;          // добавлено для фильтрации
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
        if (Array.isArray(response.data)) {
          // Фильтруем рецензии, оставляя только чужие
          const otherReviews = response.data.filter((rev: Review) => rev.userId !== user.id);
          setReviews(otherReviews);
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

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Загрузка ленты...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>;
  if (reviews.length === 0) return <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Нет рецензий от друзей</div>;

  return (
    <div style={{ padding: '10px' }}>
      <h2>Лента друзей</h2>
      {reviews.map((rev) => (
        <div key={rev.id} style={{ border: '1px solid #ccc', borderRadius: '12px', padding: '15px', marginBottom: '15px', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <strong>{rev.userName}</strong> оценил(а) <strong>{rev.filmTitle}</strong>
          <div style={{ margin: '8px 0', fontSize: '18px', color: '#f5a623' }}>
            {rev.rating} ⭐
          </div>
          {rev.reviewText && <p style={{ fontSize: '14px', color: '#333' }}>{rev.reviewText}</p>}
          <small style={{ color: '#999' }}>{new Date(rev.createdAt).toLocaleDateString()}</small>
        </div>
      ))}
    </div>
  );
}