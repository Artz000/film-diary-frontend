import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import type { Film } from '../types';

interface AddReviewProps {
  film: Film;
  onSave: () => void;
  onCancel: () => void;
}

export default function AddReview({ film, onSave, onCancel }: AddReviewProps) {
  const [status, setStatus] = useState<'watched' | 'want' | 'favorite'>('watched');
  const [rating, setRating] = useState(0); // 0-5
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = JSON.parse(localStorage.getItem('filmdiary_user') || '{}');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post(
        `${API_BASE_URL}/api/films`,
        {
          tmdbId: film.id,
          title: film.title,
          posterPath: film.poster,
          year: film.year,
          genres: film.genres || [],
          status,
          rating: status === 'watched' ? rating : null,
          reviewText,
        },
        { headers: { 'user-id': user.id } }
      );
      onSave();
    } catch (err) {
      console.error('Ошибка при сохранении:', err);
      setError('Не удалось сохранить рецензию. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        width: '350px',
        maxWidth: '90%',
      }}>
        <h3 style={{ marginTop: 0 }}>{film.title}</h3>

        {error && (
          <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Статус:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'watched' | 'want')}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              <option value="watched">Просмотрено</option>
              <option value="want">Хочу посмотреть</option>
            </select>
          </div>

          {status === 'watched' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Оценка:</label>
              <div style={{ display: 'flex', gap: '5px', fontSize: '30px', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{ color: star <= (hoverRating || rating) ? '#f5a623' : '#ccc' }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <input type="hidden" value={rating} required={status === 'watched'} />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Рецензия (необязательно):</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', resize: 'vertical' }}
              placeholder="Поделитесь впечатлениями..."
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={loading || (status === 'watched' && rating === 0)}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: (loading || (status === 'watched' && rating === 0)) ? '#ccc' : '#0088cc',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: (loading || (status === 'watched' && rating === 0)) ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              style={{ flex: 1, padding: '10px', backgroundColor: '#ccc', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}