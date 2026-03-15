import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface FilmItem {
  id: number;
  title: string;
  poster: string;
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

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>Мои фильмы</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('watched')}>Просмотрено</button>
        <button onClick={() => setActiveTab('want')}>Хочу посмотреть</button>
        <button onClick={() => setActiveTab('favorite')}>Любимые</button>
      </div>

      {films.length === 0 ? (
        <p>Нет фильмов в этой категории</p>
      ) : (
        <div>
          {films.map((film) => (
            <div key={film.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', background: 'white', padding: '8px', borderRadius: '6px' }}>
              {film.poster ? (
                <img src={film.poster} alt={film.title} width="50" style={{ objectFit: 'cover', borderRadius: '4px' }} />
              ) : (
                <div style={{ width: '50px', height: '75px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999' }}>нет</div>
              )}
              <div style={{ flex: 1 }}>
                <strong>{film.title}</strong>
                {film.rating && <span> — {film.rating} ⭐</span>}
                {film.reviewText && <p style={{ fontSize: '12px', color: '#666' }}>{film.reviewText}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}