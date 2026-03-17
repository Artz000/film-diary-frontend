import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface FeedItem {
  id: number;
  userName: string;
  filmTitle: string;
  filmYear?: string;
  filmGenres: string[];
  rating?: number;
  reviewText?: string;
  createdAt: string;
  likesCount: number;
  likedByMe: boolean;
}

export default function Feed({ user }: { user: any }) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [sort, setSort] = useState<'date' | 'popular'>('date');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/feed`, {
        params: { sort, page, limit: 20 },
        headers: { 'user-id': user.id },
      });
      setItems(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [sort, page]);

  const handleLike = async (reviewId: number, liked: boolean) => {
    try {
      if (liked) {
        await axios.delete(`${API_BASE_URL}/api/reviews/${reviewId}/like`, {
          headers: { 'user-id': user.id },
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/reviews/${reviewId}/like`, null, {
          headers: { 'user-id': user.id },
        });
      }
      // Обновить список, чтобы изменился счётчик и состояние likedByMe
      fetchFeed();
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  return (
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setSort('date')} style={{ fontWeight: sort === 'date' ? 'bold' : 'normal' }}>
          По дате
        </button>
        <button onClick={() => setSort('popular')} style={{ fontWeight: sort === 'popular' ? 'bold' : 'normal' }}>
          Популярные
        </button>
      </div>

      {loading && <div>Загрузка...</div>}
      {!loading && items.length === 0 && <div>Пока нет публикаций</div>}

      {items.map((item) => (
        <div key={item.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', marginBottom: '15px', background: 'white' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            {item.userName} · {new Date(item.createdAt).toLocaleDateString()}
          </div>
          <h3 style={{ margin: '0 0 5px 0', color: '#000' }}>
            {item.filmTitle} {item.filmYear && <span style={{ fontSize: '14px', color: '#666' }}>({item.filmYear})</span>}
          </h3>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
            {item.filmGenres?.join(' · ')}
          </div>
          {item.rating && (
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f5a623', marginBottom: '8px' }}>
              Оценка: {item.rating}/5
            </div>
          )}
          {item.reviewText && (
            <p style={{ fontSize: '14px', color: '#333', marginBottom: '10px', fontStyle: 'italic' }}>
              {item.reviewText}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => handleLike(item.id, item.likedByMe)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                color: item.likedByMe ? 'red' : '#ccc',
              }}
            >
              ❤️
            </button>
            <span>{item.likesCount}</span>
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Назад</button>
          <span>Стр. {page} из {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Вперёд</button>
        </div>
      )}
    </div>
  );
}