import { useState, useEffect } from 'react';
import api from '../api';

interface FeedItem {
  id: number;
  userName: string;
  filmTitle: string;
  filmYear?: string;
  filmGenres: string[];
  filmPoster?: string;
  rating?: number;
  reviewText?: string;
  createdAt: string;
  likesCount: number;
  likedByMe: boolean;
}

export default function Feed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [sort, setSort] = useState<'date' | 'popular'>('date');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/feed', {
        params: { sort, page, limit: 20 },
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
        await api.delete(`/api/reviews/${reviewId}/like`);
      } else {
        await api.post(`/api/reviews/${reviewId}/like`);
      }
      fetchFeed();
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Загрузка...</div>;
  if (!loading && items.length === 0) return <div style={{ textAlign: 'center', padding: '20px' }}>Пока нет публикаций</div>;

  return (
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setSort('date')}
          style={{
            fontWeight: sort === 'date' ? 'bold' : 'normal',
            padding: '5px 10px',
            backgroundColor: sort === 'date' ? '#0088cc' : '#f0f0f0',
            color: sort === 'date' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          По дате
        </button>
        <button
          onClick={() => setSort('popular')}
          style={{
            fontWeight: sort === 'popular' ? 'bold' : 'normal',
            padding: '5px 10px',
            backgroundColor: sort === 'popular' ? '#0088cc' : '#f0f0f0',
            color: sort === 'popular' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Популярные
        </button>
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          style={{
            display: 'flex',
            gap: '15px',
            border: '1px solid #eee',
            borderRadius: '12px',
            padding: '15px',
            marginBottom: '15px',
            background: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          {item.filmPoster ? (
            <img
              src={item.filmPoster}
              alt={item.filmTitle}
              style={{ width: '80px', height: '120px', objectFit: 'cover', borderRadius: '8px' }}
            />
          ) : (
            <div
              style={{
                width: '80px',
                height: '120px',
                backgroundColor: '#f0f0f0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: '#999',
              }}
            >
              нет фото
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
              {item.userName} · {new Date(item.createdAt).toLocaleDateString()}
            </div>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#000' }}>
              {item.filmTitle}{' '}
              {item.filmYear && <span style={{ fontSize: '14px', color: '#666' }}>({item.filmYear})</span>}
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
                  color: item.likedByMe ? '#e53935' : '#ccc',
                }}
              >
                ❤️
              </button>
              <span style={{ color: '#333', fontWeight: 'bold' }}>{item.likesCount}</span>
            </div>
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '5px 10px',
              backgroundColor: '#f0f0f0',
              border: 'none',
              borderRadius: '4px',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Назад
          </button>
          <span style={{ padding: '5px 0' }}>
            Стр. {page} из {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              padding: '5px 10px',
              backgroundColor: '#f0f0f0',
              border: 'none',
              borderRadius: '4px',
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Вперёд
          </button>
        </div>
      )}
    </div>
  );
}