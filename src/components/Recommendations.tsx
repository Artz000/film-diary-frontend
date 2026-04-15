import { useState, useEffect } from 'react';
import api from '../api';
import type { Film } from '../types';

interface Recommendation {
  film: Film;
  score: number;
  reasons: string[];
}

interface RecommendationsProps {
  onAddFilm: (film: Film) => void;
}

export default function Recommendations({ onAddFilm }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<string>('');
  const [feedbackLoading, setFeedbackLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async (refresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/recommendations', {
        params: { limit: 20, refresh },
      });
      // Проверяем, что ответ содержит массив
      const recs = response.data.recommendations || [];
      setRecommendations(recs);
      setSource(response.data.source || '');
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Не удалось загрузить рекомендации');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleFeedback = async (filmId: number, feedback: 'like' | 'dislike' | 'watched') => {
    setFeedbackLoading(filmId);
    try {
      await api.post('/api/recommendations/feedback', { filmId, feedback });
      setRecommendations(prev => prev.filter(r => r.film.id !== filmId));
      await fetchRecommendations(true);
    } catch (error) {
      console.error('Error sending feedback:', error);
    } finally {
      setFeedbackLoading(null);
    }
  };

  const getSourceText = () => {
    switch (source) {
      case 'hybrid': return 'Персональные рекомендации';
      case 'popular': return 'Популярные фильмы (добавьте больше оценок)';
      default: return 'Рекомендации для вас';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Анализируем ваши вкусы...</div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
          Чем больше фильмов вы оцените, тем точнее будут рекомендации
        </div>
      </div>
    );
  }

  if (error) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>;
  }

  if (!recommendations.length) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p>Пока нет рекомендаций</p>
        <p>Добавьте больше фильмов и оценок, чтобы мы могли подобрать что-то интересное</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '10px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2>{getSourceText()}</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: '#666', fontSize: '14px' }}>
            {recommendations.length} рекомендаций
          </p>
          <button
            onClick={() => fetchRecommendations(true)}
            style={{
              padding: '5px 10px',
              backgroundColor: '#f0f0f0',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Обновить
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {recommendations.map((rec) => (
          <div
            key={rec.film.id}
            style={{
              display: 'flex',
              gap: '15px',
              padding: '15px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              position: 'relative'
            }}
          >
            {rec.film.poster ? (
              <img
                src={rec.film.poster}
                alt={rec.film.title}
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
                  color: '#999'
                }}
              >
                нет фото
              </div>
            )}

            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold', color: '#000' }}>
                {rec.film.title}
                {rec.film.year && (
                  <span style={{ fontSize: '14px', color: '#666', marginLeft: '8px', fontWeight: 'normal' }}>
                    ({rec.film.year})
                  </span>
                )}
              </h3>

              {rec.film.genres && rec.film.genres.length > 0 && (
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                  {rec.film.genres.slice(0, 3).join(' • ')}
                </div>
              )}

              {rec.reasons && rec.reasons.length > 0 && (
                <div style={{ fontSize: '12px', color: '#0088cc', marginBottom: '10px' }}>
                  {rec.reasons.join(' • ')}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                <button
                  onClick={() => handleFeedback(rec.film.id, 'like')}
                  disabled={feedbackLoading === rec.film.id}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Интересно
                </button>
                <button
                  onClick={() => handleFeedback(rec.film.id, 'dislike')}
                  disabled={feedbackLoading === rec.film.id}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Не интересно
                </button>
                <button
                  onClick={() => onAddFilm(rec.film)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#0088cc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Добавить в коллекцию
                </button>
              </div>
            </div>

            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: `conic-gradient(#4caf50 ${(rec.score || 0) * 100}%, #e0e0e0 0)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#333'
              }}
            >
              <span style={{ backgroundColor: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {Math.round((rec.score || 0) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}