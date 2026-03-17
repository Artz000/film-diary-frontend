import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface FilmItem {
  id: number;
  reviewId?: number;
  title: string;
  poster?: string;
  year?: string;
  genres?: string[];
  status: 'watched' | 'want' | 'favorite';
  rating?: number;
  reviewText?: string;
  isPublic?: boolean;
  isFavorite?: boolean;
}

interface MyFilmsProps {
  user: any;
}

export default function MyFilms({ user }: MyFilmsProps) {
  const [films, setFilms] = useState<FilmItem[]>([]);
  const [activeTab, setActiveTab] = useState<'watched' | 'want' | 'favorite'>('watched');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState<{ [key: number]: number }>({});
  const [currentRating, setCurrentRating] = useState<{ [key: number]: number }>({});

  const fetchFilms = async (tab: string) => {
    setLoading(true);
    setError(null);
    try {
      let params: any = {};
      if (tab === 'watched') {
        params.status = 'watched';
      } else if (tab === 'want') {
        params.status = 'want';
      } else if (tab === 'favorite') {
        params.favorite = 'true';
      }

      const response = await axios.get(`${API_BASE_URL}/api/users/${user.id}/films`, {
        params,
        headers: { 'user-id': user.id },
      });
      if (Array.isArray(response.data)) {
        setFilms(response.data);
        const initialRatings: { [key: number]: number } = {};
        response.data.forEach((film: FilmItem) => {
          if (film.rating) initialRatings[film.id] = film.rating;
        });
        setCurrentRating(initialRatings);
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

  const updateRating = async (filmId: number, reviewId: number, newRating: number) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/reviews/${reviewId}/rating`,
        { rating: newRating },
        { headers: { 'user-id': user.id } }
      );
      setCurrentRating((prev) => ({ ...prev, [filmId]: newRating }));
    } catch (err) {
      console.error('Error updating rating:', err);
    }
  };

  const toggleFavorite = async (reviewId: number, currentValue: boolean) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/reviews/${reviewId}/favorite`,
        { isFavorite: !currentValue },
        { headers: { 'user-id': user.id } }
      );
      // Обновляем список, чтобы изменения отобразились
      fetchFilms(activeTab);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleStatusChange = async (film: FilmItem, newStatus: 'watched' | 'favorite') => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/films/${film.id}`,
        { status: newStatus },
        { headers: { 'user-id': user.id } }
      );
      fetchFilms(activeTab);
    } catch (err) {
      console.error('Error changing status:', err);
    }
  };

  const toggleVisibility = async (reviewId: number, current: boolean) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/reviews/${reviewId}`,
        { isPublic: !current },
        { headers: { 'user-id': user.id } }
      );
      fetchFilms(activeTab);
    } catch (err) {
      console.error('Error toggling visibility:', err);
    }
  };

  const handleDelete = async (filmId: number) => {
    if (!confirm('Удалить фильм из коллекции?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/films/${filmId}`, {
        headers: { 'user-id': user.id },
      });
      fetchFilms(activeTab);
    } catch (err) {
      console.error('Error deleting film:', err);
    }
  };

  const renderStars = (filmId: number, currentRatingValue: number, reviewId?: number) => {
    const hover = hoverRating[filmId] || 0;
    const value = hover || currentRatingValue;
    return (
      <div style={{ display: 'flex', gap: '2px', fontSize: '20px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => reviewId && updateRating(filmId, reviewId, star)}
            onMouseEnter={() => setHoverRating((prev) => ({ ...prev, [filmId]: star }))}
            onMouseLeave={() => setHoverRating((prev) => ({ ...prev, [filmId]: 0 }))}
            style={{
              cursor: reviewId ? 'pointer' : 'default',
              color: star <= value ? '#f5a623' : '#ccc',
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '20px', color: '#333' }}>Загрузка...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>;

  return (
    <div style={{ padding: '10px', color: '#333' }}>
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
          {films.map((film) => {
            const displayRating = currentRating[film.id] ?? film.rating;
            return (
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
                  {(film.status === 'watched' || activeTab === 'favorite') && film.rating && (
                    <div style={{ marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#f5a623' }}>
                          {displayRating}/5
                        </span>
                        {renderStars(film.id, displayRating || 0, film.reviewId)}
                      </div>
                    </div>
                  )}
                  {film.reviewText && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#555', fontStyle: 'italic' }}>
                      {film.reviewText}
                    </p>
                  )}
                  {/* Кнопки действий */}
                  <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {activeTab === 'want' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(film, 'watched')}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#0088cc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          Просмотрено
                        </button>
                        <button
                          onClick={() => handleDelete(film.id)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#e53935',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          Удалить
                        </button>
                      </>
                    )}
                    {activeTab === 'watched' && (
                      <>
                        {!film.isFavorite && (
                          <button
                            onClick={() => film.reviewId && toggleFavorite(film.reviewId, film.isFavorite || false)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#f5a623',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            В любимое
                          </button>
                        )}
                        {film.reviewId && (
                          <button
                            onClick={() => toggleVisibility(film.reviewId, film.isPublic || false)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: film.isPublic ? '#ccc' : '#0088cc',
                              color: film.isPublic ? '#333' : 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            {film.isPublic ? 'Скрыть из ленты' : 'Опубликовать'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(film.id)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#e53935',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          Удалить
                        </button>
                      </>
                    )}
                    {activeTab === 'favorite' && (
                      <>
                        <button
                          onClick={() => film.reviewId && toggleFavorite(film.reviewId, film.isFavorite || false)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#e53935',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          Убрать из любимых
                        </button>
                        {film.reviewId && (
                          <button
                            onClick={() => toggleVisibility(film.reviewId, film.isPublic || false)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: film.isPublic ? '#ccc' : '#0088cc',
                              color: film.isPublic ? '#333' : 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            {film.isPublic ? 'Скрыть из ленты' : 'Опубликовать'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(film.id)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#e53935',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          Удалить
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}