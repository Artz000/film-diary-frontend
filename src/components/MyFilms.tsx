import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface UserFilm {
  tmdbId: number;
  title: string;
  poster?: string;
  status: 'watched' | 'want' | 'favorite';
  rating?: number;
  reviewText?: string;
  createdAt?: string;
}

interface MyFilmsProps {
  user: any;
}

export default function MyFilms({ user }: MyFilmsProps) {
  const [films, setFilms] = useState<UserFilm[]>([]);
  const [activeTab, setActiveTab] = useState<'watched' | 'want' | 'favorite'>('watched');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFilms = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/users/${user.id}/films`, {
          params: { status: activeTab }
        });
        setFilms(response.data);
      } catch (err) {
        console.error('Error fetching films:', err);
        setError('Не удалось загрузить фильмы');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchFilms();
    }
  }, [user.id, activeTab]);

  const handleRemove = async (tmdbId: number) => {
    if (!confirm('Удалить фильм из коллекции?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/films/${tmdbId}`, {
        headers: { 'user-id': user.id }
      });
      setFilms(prev => prev.filter(f => f.tmdbId !== tmdbId));
    } catch (err) {
      console.error('Error removing film:', err);
      alert('Не удалось удалить фильм');
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>{error}</div>;

  return (
    <div style={{ padding: '10px' }}>
      <h2>Мои фильмы</h2>
      
      {/* Табы */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #ccc' }}>
        <button
          onClick={() => setActiveTab('watched')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: activeTab === 'watched' ? '#0088cc' : 'transparent',
            color: activeTab === 'watched' ? 'white' : '#333',
            borderRadius: '6px 6px 0 0',
            cursor: 'pointer'
          }}
        >
          Просмотрено
        </button>
        <button
          onClick={() => setActiveTab('want')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: activeTab === 'want' ? '#0088cc' : 'transparent',
            color: activeTab === 'want' ? 'white' : '#333',
            borderRadius: '6px 6px 0 0',
            cursor: 'pointer'
          }}
        >
          Хочу посмотреть
        </button>
        <button
          onClick={() => setActiveTab('favorite')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: activeTab === 'favorite' ? '#0088cc' : 'transparent',
            color: activeTab === 'favorite' ? 'white' : '#333',
            borderRadius: '6px 6px 0 0',
            cursor: 'pointer'
          }}
        >
          Любимые
        </button>
      </div>

      {/* Список фильмов */}
      {films.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>Нет фильмов в этой категории</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {films.map((film) => (
            <div
              key={film.tmdbId}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '12px',
                border: '1px solid #eee',
                borderRadius: '8px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {film.poster ? (
                <img
                  src={film.poster}
                  alt={film.title}
                  style={{ width: '50px', height: '75px', objectFit: 'cover', borderRadius: '4px' }}
                />
              ) : (
                <div style={{ width: '50px', height: '75px', backgroundColor: '#f0f0f0' }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>{film.title}</div>
                {film.rating && <div style={{ fontSize: '14px', color: '#f5a623' }}>Оценка: {film.rating} ⭐</div>}
                {film.reviewText && (
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                    {film.reviewText.length > 100 ? film.reviewText.slice(0, 100) + '...' : film.reviewText}
                  </div>
                )}
                {film.createdAt && (
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    {new Date(film.createdAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleRemove(film.tmdbId)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  alignSelf: 'center'
                }}
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}