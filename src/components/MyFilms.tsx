import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface FilmItem {
  id: number;
  title: string;
  poster?: string;
  year?: string;
  genres?: string[];
  status: 'watched' | 'want' | 'favorite';
  rating?: number;
  reviewText?: string;
  reviewId?: number;        // добавлено
  isPublic?: boolean;       // добавлено
}

interface MyFilmsProps {
  user: any;
}

export default function MyFilms({ user }: MyFilmsProps) {
  const [films, setFilms] = useState<FilmItem[]>([]);
  const [activeTab, setActiveTab] = useState<'watched' | 'want' | 'favorite'>('watched');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFilms = async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/${user.id}/films`, {
        params: { status },
        headers: { 'user-id': user.id },
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

  useEffect(() => {
    if (user?.id) {
      fetchFilms(activeTab);
    }
  }, [user, activeTab]);

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const handleTogglePublic = async (reviewId: number, currentPublic: boolean) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/reviews/${reviewId}`,
        { isPublic: !currentPublic },
        { headers: { 'user-id': user.id } }
      );
      // Обновляем список после изменения
      fetchFilms(activeTab);
    } catch (err) {
      console.error('Error toggling visibility:', err);
      alert('Не удалось изменить видимость рецензии');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '20px', color: '#333' }}>Загрузка...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>;

  return (
    <div style={{ padding: '10px', color: '#333' }}>
      {/* Табы */}
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
                color: '#333',
              }}
            >
              {film.poster ? (
                <img
                  src={film.poster}
                  alt={film.title}
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
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#000' }}>{film.title}</h3>
                  {film.year && <span style={{ fontSize: '14px', color: '#666' }}>({film.year})</span>}
                </div>
                {film.genres && film.genres.length > 0 && (
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
                    {film.genres.join(' • ')}
                  </div>
                )}
                {film.rating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#f5a623' }}>{film.rating}/5</span>
                    <span style={{ fontSize: '16px' }}>{renderStars(film.rating)}</span>
                  </div>
                )}
                {film.reviewText && (
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#555', fontStyle: 'italic' }}>
                    {film.reviewText}
                  </p>
                )}

                {/* Кнопка публикации — только для просмотренных фильмов */}
                {activeTab === 'watched' && film.reviewId && (
                  <div style={{ marginTop: '10px' }}>
                    <button
                      onClick={() => handleTogglePublic(film.reviewId!, film.isPublic!)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: film.isPublic ? '#ccc' : '#0088cc',
                        color: film.isPublic ? '#333' : 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      {film.isPublic ? 'Скрыть из ленты' : 'Опубликовать в ленте'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}