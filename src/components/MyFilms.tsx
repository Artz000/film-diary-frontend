import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface FilmItem {
  id: number;
  title?: string;
  filmTitle?: string;
  name?: string;
  poster?: string;
  status: 'watched' | 'want' | 'favorite';
  rating?: number;
  reviewText?: string;
}

interface MyFilmsProps {
  user: any;
}

export default function MyFilms({ user }: MyFilmsProps) {
  const [films, setFilms] = useState<FilmItem[]>([]);
  const [activeTab, setActiveTab] = useState<'watched' | 'want' | 'favorite'>('watched');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFilms = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/users/${user.id}/films`, {
          params: { status: activeTab },
          headers: { 'user-id': user.id }
        });
        if (Array.isArray(response.data)) {
          setFilms(response.data);
        } else {
          console.error('Films data is not an array:', response.data);
          setError('Неверный формат данных от сервера');
        }
      } catch (err) {
        console.error('Error fetching films:', err);
        setError('Не удалось загрузить фильмы. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchFilms();
    }
  }, [user, activeTab]);

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getTitle = (film: FilmItem): string => {
    return film.title || film.filmTitle || film.name || 'Без названия';
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Загрузка...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>;

  return (
    <div style={{ padding: '10px' }}>
      <h2>Мои фильмы</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveTab('watched')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'watched' ? '#0088cc' : '#f0f0f0',
            color: activeTab === 'watched' ? 'white' : '#333',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontWeight: activeTab === 'watched' ? 'bold' : 'normal',
          }}
        >
          Просмотрено
        </button>
        <button
          onClick={() => setActiveTab('want')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'want' ? '#0088cc' : '#f0f0f0',
            color: activeTab === 'want' ? 'white' : '#333',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
          }}
        >
          Хочу посмотреть
        </button>
        <button
          onClick={() => setActiveTab('favorite')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'favorite' ? '#0088cc' : '#f0f0f0',
            color: activeTab === 'favorite' ? 'white' : '#333',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
          }}
        >
          Любимые
        </button>
      </div>

      {films.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>Нет фильмов в этой категории</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {films.map((film) => (
            <div
              key={film.id}
              style={{
                display: 'flex',
                gap: '15px',
                padding: '15px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              {film.poster ? (
                <img
                  src={film.poster}
                  alt={getTitle(film)}
                  style={{ width: '70px', height: '105px', objectFit: 'cover', borderRadius: '8px' }}
                />
              ) : (
                <div
                  style={{
                    width: '70px',
                    height: '105px',
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
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{getTitle(film)}</h3>
                {film.rating && (
                  <div style={{ marginBottom: '6px', fontSize: '16px' }}>
                    {renderStars(film.rating)}
                  </div>
                )}
                {film.reviewText && (
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#555', fontStyle: 'italic' }}>
                    {film.reviewText}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}