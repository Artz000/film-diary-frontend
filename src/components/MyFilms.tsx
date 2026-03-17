import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import AddReview from './AddReview';
import type { UserFilm } from '../types';

interface MyFilmsProps {
  user: any;
}

export default function MyFilms({ user }: MyFilmsProps) {
  const [films, setFilms] = useState<UserFilm[]>([]);
  const [activeTab, setActiveTab] = useState<'watched' | 'want' | 'favorite'>('watched');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilm, setSelectedFilm] = useState<UserFilm | null>(null); // для модалки

  const fetchFilms = async (tab: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = tab === 'favorite' ? { status: 'favorite' } : { status: tab };
      const response = await axios.get(`${API_BASE_URL}/api/users/${user.id}/films`, {
        params,
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

  const handleStatusChange = async (film: UserFilm, newStatus: 'watched' | 'want', rating?: number, reviewText?: string) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/films/${film.id}`,
        { status: newStatus, rating, reviewText },
        { headers: { 'user-id': user.id } }
      );
      fetchFilms(activeTab);
    } catch (err) {
      console.error('Error updating film status:', err);
      alert('Не удалось обновить статус');
    }
  };

  const handleToggleFavorite = async (film: UserFilm) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/films/${film.id}`,
        { isFavorite: !film.isFavorite },
        { headers: { 'user-id': user.id } }
      );
      fetchFilms(activeTab);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Не удалось добавить в любимое');
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
      alert('Не удалось удалить фильм');
    }
  };

  const renderStars = (rating: number) => '⭐'.repeat(rating) + '☆'.repeat(5 - rating);

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
                {/* Кнопки действий */}
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                  {activeTab === 'want' && (
                    <button
                      onClick={() => setSelectedFilm(film)} // открываем модалку для оценки
                      style={{ padding: '5px 10px', backgroundColor: '#0088cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      ✓ Просмотрено
                    </button>
                  )}
                  {activeTab === 'watched' && (
                    <>
                      <button
                        onClick={() => handleToggleFavorite(film)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: film.isFavorite ? '#f5a623' : '#f0f0f0',
                          color: film.isFavorite ? 'white' : '#333',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        {film.isFavorite ? '❤️ В любимых' : '♡ В любимое'}
                      </button>
                      <button
                        onClick={() => handleDelete(film.id)}
                        style={{ padding: '5px 10px', backgroundColor: '#e53935', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Удалить
                      </button>
                    </>
                  )}
                  {activeTab === 'favorite' && (
                    <button
                      onClick={() => handleDelete(film.id)}
                      style={{ padding: '5px 10px', backgroundColor: '#e53935', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модалка для добавления оценки при переносе из want в watched */}
      {selectedFilm && (
        <AddReview
          film={selectedFilm}
          onSave={() => {
            setSelectedFilm(null);
            fetchFilms(activeTab);
          }}
          onCancel={() => setSelectedFilm(null)}
        />
      )}
    </div>
  );
}