import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import type { Film } from '../types';

interface AddReviewProps {
  film: Film;                       // фильм, который добавляем
  onSave: () => void;               // вызывается после успешного сохранения
  onCancel: () => void;             // вызывается при отмене
}

export default function AddReview({ film, onSave, onCancel }: AddReviewProps) {
  const [status, setStatus] = useState<'watched' | 'want' | 'favorite'>('watched');
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получаем пользователя из localStorage (сохраняется после авторизации)
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
          status,
          rating,
          reviewText,
        },
        {
          headers: {
            'user-id': user.id, // передаём ID пользователя в заголовке
          },
        }
      );
      onSave(); // закрываем модалку и обновляем список
    } catch (err) {
      console.error('Ошибка при сохранении:', err);
      setError('Не удалось сохранить рецензию. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
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
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          width: '350px',
          maxWidth: '90%',
        }}
      >
        <h3 style={{ marginTop: 0 }}>{film.title}</h3>

        {error && (
          <div
            style={{
              backgroundColor: '#ffebee',
              color: '#c62828',
              padding: '8px',
              borderRadius: '4px',
              marginBottom: '10px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Статус:
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            >
              <option value="watched">Просмотрено</option>
              <option value="want">Хочу посмотреть</option>
              <option value="favorite">Любимое</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Оценка (1–5):
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
              required={status === 'watched'} // оценка обязательна только для просмотренных
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Рецензия (необязательно):
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#0088cc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'wait' : 'pointer',
              }}
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#ccc',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'wait' : 'pointer',
              }}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}