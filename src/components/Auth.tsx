import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

// Расширяем глобальный интерфейс Window для Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        initData: string;
        initDataUnsafe?: any;
      };
    };
  }
}

interface AuthProps {
  onAuth: (user: any) => void;
}

export default function Auth({ onAuth }: AuthProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Инициализация Telegram WebApp, если доступен
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const webApp = window.Telegram?.WebApp;
      if (!webApp) {
        setError('Это приложение должно работать внутри Telegram Mini App');
        setLoading(false);
        return;
      }

      const initData = webApp.initData;
      if (!initData) {
        setError('Не удалось получить данные авторизации');
        setLoading(false);
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/api/auth`, { initData });

      onAuth(response.data.user);
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.response) {
        setError(`Ошибка сервера: ${err.response.data.error || 'Неизвестная ошибка'}`);
      } else if (err.request) {
        setError('Сервер не отвечает. Проверьте подключение.');
      } else {
        setError('Ошибка при отправке запроса');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', padding: '0 20px' }}>
      <h1>FilmDiary</h1>
      <p style={{ marginBottom: '30px', color: '#666' }}>
        Войдите через Telegram, чтобы вести дневник фильмов
      </p>

      {error && (
        <div style={{
          color: '#e53935',
          marginBottom: '20px',
          padding: '10px',
          border: '1px solid #e53935',
          borderRadius: '4px',
          backgroundColor: '#ffebee'
        }}>
          {error}
        </div>
      )}

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: '#0088cc',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Вход...' : 'Войти через Telegram'}
      </button>
    </div>
  );
}