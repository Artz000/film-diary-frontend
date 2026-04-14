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
      const res = await api.get('/api/feed', { params: { sort, page, limit: 20 } });
      setItems(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeed(); }, [sort, page]);

  const handleLike = async (reviewId: number, liked: boolean) => {
    try {
      if (liked) await api.delete(`/api/reviews/${reviewId}/like`);
      else await api.post(`/api/reviews/${reviewId}/like`);
      fetchFeed();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div>Загрузка...</div>;
  if (!items.length) return <div>Пока нет публикаций</div>;

  return (
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setSort('date')} style={{ fontWeight: sort === 'date' ? 'bold' : 'normal' }}>По дате</button>
        <button onClick={() => setSort('popular')} style={{ fontWeight: sort === 'popular' ? 'bold' : 'normal' }}>Популярные</button>
      </div>
      {items.map(item => (
        <div key={item.id} style={{ display: 'flex', gap: '15px', border: '1px solid #eee', borderRadius: '12px', padding: '15px', marginBottom: '15px', background: 'white' }}>
          {item.filmPoster ? <img src={item.filmPoster} alt={item.filmTitle} style={{ width: '80px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} /> : <div style={{ width: '80px', height: '120px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>нет фото</div>}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', color: '#666' }}>{item.userName} · {new Date(item.createdAt).toLocaleDateString()}</div>
            <h3 style={{ margin: '5px 0', color: '#000' }}>{item.filmTitle} {item.filmYear && <span style={{ fontSize: '14px', color: '#666' }}>({item.filmYear})</span>}</h3>
            <div style={{ fontSize: '12px', color: '#666' }}>{item.filmGenres?.join(' · ')}</div>
            {item.rating && <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f5a623', marginTop: '5px' }}>Оценка: {item.rating}/5</div>}
            {item.reviewText && <p style={{ fontStyle: 'italic', marginTop: '5px' }}>{item.reviewText}</p>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <button onClick={() => handleLike(item.id, item.likedByMe)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: item.likedByMe ? '#e53935' : '#ccc' }}>❤️</button>
              <span>{item.likesCount}</span>
            </div>
          </div>
        </div>
      ))}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          <button disabled={page === 1} onClick={() => setPage(p => p-1)}>Назад</button>
          <span>{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p+1)}>Вперёд</button>
        </div>
      )}
    </div>
  );
}