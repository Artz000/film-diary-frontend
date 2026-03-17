import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import type { ReviewItem } from '../types';

interface FeedProps {
  user: any;
}

export default function Feed({ user }: FeedProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Загрузка ленты...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>;
  if (reviews.length === 0) return <div style={{ textAlign: 'center', padding: '20px' }}>Нет активности</div>;

  return (
    <div style={{ padding: '10px' }}>
      <h2>Лента друзей</h2>
      {reviews.map((rev) => (
        <div key={rev.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px', marginBottom: '10px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>{rev.userName}</strong>
            <small>{formatDate(rev.createdAt)}</small>
          </div>
          <div style={{ marginTop: '5px' }}>
            <strong>{rev.filmTitle}</strong> {rev.filmYear && <span>({rev.filmYear})</span>}
          </div>
          {rev.filmGenres && rev.filmGenres.length > 0 && (
            <div style={{ fontSize: '12px', color: '#666' }}>{rev.filmGenres.join(' • ')}</div>
          )}
          <div style={{ marginTop: '8px' }}>
            {rev.status === 'watched' ? (
              <>
                {rev.rating && <span style={{ color: '#f5a623' }}>{'⭐'.repeat(rev.rating)}</span>}
                {rev.reviewText && <p style={{ margin: '5px 0', fontStyle: 'italic' }}>"{rev.reviewText}"</p>}
                {rev.isFavorite && <span style={{ color: '#e53935', marginLeft: '5px' }}>❤️</span>}
              </>
            ) : (
              <span style={{ color: '#0088cc' }}>Хочет посмотреть</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}