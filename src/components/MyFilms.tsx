import { useState, useEffect } from 'react';
import api from '../api';

interface FilmItem {
  id: number;
  reviewId?: number;
  title: string;
  poster?: string;
  year?: string;
  genres?: string[];
  status: string;
  rating?: number;
  reviewText?: string;
  isPublic?: boolean;
  isFavorite?: boolean;
}

export default function MyFilms() {
  const [films, setFilms] = useState<FilmItem[]>([]);
  const [activeTab, setActiveTab] = useState<'watched' | 'want' | 'favorite'>('watched');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState<{ [key: number]: number }>({});
  const [currentRating, setCurrentRating] = useState<{ [key: number]: number }>({});

  const fetchFilms = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/users/me/films';
      const params: any = {};
      if (activeTab === 'watched') params.status = 'watched';
      else if (activeTab === 'want') params.status = 'want';
      else if (activeTab === 'favorite') params.favorite = true;

      const res = await api.get(url, { params });
      if (Array.isArray(res.data)) {
        setFilms(res.data);
        const ratings: { [key: number]: number } = {};
        res.data.forEach((f: FilmItem) => { if (f.rating) ratings[f.id] = f.rating; });
        setCurrentRating(ratings);
      } else {
        setError('Неверный формат данных');
      }
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить фильмы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilms();
  }, [activeTab]);

  const updateRating = async (filmId: number, reviewId: number, newRating: number) => {
    try {
      await api.patch(`/api/reviews/${reviewId}/rating`, { rating: newRating });
      setCurrentRating(prev => ({ ...prev, [filmId]: newRating }));
    } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (film: FilmItem, newStatus: string) => {
    try {
      await api.patch(`/api/films/${film.id}`, { status: newStatus });
      fetchFilms();
    } catch (err) { console.error(err); }
  };

  const toggleFavorite = async (film: FilmItem, isFavorite: boolean) => {
    try {
      await api.patch(`/api/films/${film.id}/favorite`, { isFavorite });
      fetchFilms();
    } catch (err) { console.error(err); }
  };

  const toggleVisibility = async (reviewId: number, current: boolean) => {
    try {
      await api.patch(`/api/reviews/${reviewId}`, { isPublic: !current });
      fetchFilms();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (filmId: number) => {
    if (!confirm('Удалить фильм из коллекции?')) return;
    try {
      await api.delete(`/api/films/${filmId}`);
      fetchFilms();
    } catch (err) { console.error(err); }
  };

  const renderStars = (filmId: number, currentRatingValue: number, reviewId?: number) => {
    const hover = hoverRating[filmId] || 0;
    const value = hover || currentRatingValue;
    return (
      <div style={{ display: 'flex', gap: '2px', fontSize: '20px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            onClick={() => reviewId && updateRating(filmId, reviewId, star)}
            onMouseEnter={() => setHoverRating(prev => ({ ...prev, [filmId]: star }))}
            onMouseLeave={() => setHoverRating(prev => ({ ...prev, [filmId]: 0 }))}
            style={{ cursor: reviewId ? 'pointer' : 'default', color: star <= value ? '#f5a623' : '#ccc' }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Загрузка...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>;

  return (
    <div style={{ padding: '10px', color: '#333' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <button onClick={() => setActiveTab('watched')} style={{ padding: '8px 16px', backgroundColor: activeTab === 'watched' ? '#0088cc' : '#f0f0f0', color: activeTab === 'watched' ? 'white' : '#333', border: 'none', borderRadius: '20px' }}>Просмотрено</button>
        <button onClick={() => setActiveTab('want')} style={{ padding: '8px 16px', backgroundColor: activeTab === 'want' ? '#0088cc' : '#f0f0f0', color: activeTab === 'want' ? 'white' : '#333', border: 'none', borderRadius: '20px' }}>Хочу посмотреть</button>
        <button onClick={() => setActiveTab('favorite')} style={{ padding: '8px 16px', backgroundColor: activeTab === 'favorite' ? '#0088cc' : '#f0f0f0', color: activeTab === 'favorite' ? 'white' : '#333', border: 'none', borderRadius: '20px' }}>Любимые</button>
      </div>

      {films.length === 0 ? <p style={{ textAlign: 'center' }}>Нет фильмов в этой категории</p> : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {films.map(film => {
            const displayRating = currentRating[film.id] ?? film.rating;
            return (
              <div key={film.id} style={{ display: 'flex', gap: '15px', padding: '15px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                {film.poster ? <img src={film.poster} alt={film.title} style={{ width: '70px', height: '105px', objectFit: 'cover', borderRadius: '8px' }} /> : <div style={{ width: '70px', height: '105px', background: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>нет</div>}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0', color: '#000' }}>{film.title} {film.year && <span style={{ fontSize: '14px', color: '#666' }}>({film.year})</span>}</h3>
                  {film.genres?.length && <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>{film.genres.join(' • ')}</div>}
                  {film.rating !== undefined && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 'bold', color: '#f5a623' }}>{displayRating}/5</span>
                      {renderStars(film.id, displayRating || 0, film.reviewId)}
                    </div>
                  )}
                  {film.reviewText && <p style={{ fontSize: '14px', color: '#555', fontStyle: 'italic' }}>{film.reviewText}</p>}
                  <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {film.status === 'want' && (
                      <>
                        <button onClick={() => handleStatusChange(film, 'watched')} style={{ padding: '5px 10px', background: '#0088cc', color: 'white', border: 'none', borderRadius: '4px' }}>Просмотрено</button>
                        <button onClick={() => handleDelete(film.id)} style={{ padding: '5px 10px', background: '#e53935', color: 'white', border: 'none', borderRadius: '4px' }}>Удалить</button>
                      </>
                    )}
                    {film.status === 'watched' && (
                      <>
                        <button onClick={() => toggleFavorite(film, true)} style={{ padding: '5px 10px', background: '#f5a623', color: 'white', border: 'none', borderRadius: '4px' }}>В любимое</button>
                        {film.reviewId && (
                          <button onClick={() => toggleVisibility(film.reviewId!, film.isPublic || false)} style={{ padding: '5px 10px', background: film.isPublic ? '#ccc' : '#0088cc', color: film.isPublic ? '#333' : 'white', border: 'none', borderRadius: '4px' }}>
                            {film.isPublic ? 'Скрыть из ленты' : 'Опубликовать'}
                          </button>
                        )}
                        <button onClick={() => handleDelete(film.id)} style={{ padding: '5px 10px', background: '#e53935', color: 'white', border: 'none', borderRadius: '4px' }}>Удалить</button>
                      </>
                    )}
                    {film.status === 'favorite' && (
                      <>
                        <button onClick={() => toggleFavorite(film, false)} style={{ padding: '5px 10px', background: '#e53935', color: 'white', border: 'none', borderRadius: '4px' }}>Убрать из любимых</button>
                        <button onClick={() => handleDelete(film.id)} style={{ padding: '5px 10px', background: '#e53935', color: 'white', border: 'none', borderRadius: '4px' }}>Удалить</button>
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