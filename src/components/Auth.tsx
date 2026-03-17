import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

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
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      console.log('Telegram WebApp initialized');
    } else {
      console.log('Not in Telegram environment');
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      let initData = '';
      if (window.Telegram?.WebApp) {
        initData = window.Telegram.WebApp.initData;
        console.log('initData present:', !!initData);
      }

      // Если приложение открыто не в Telegram – используем заглушку для локального тестирования
      if (!initData) {
        console.warn('No initData – using mock user');
        onAuth({
          id: 123,
          firstName: 'Тест',
          lastName: '',
          username: 'test',
        });
        setLoading(false);
        return;
      }

      console.log('Sending auth request with initData length:', initData.length);
      const response = await axios.post(`${API_BASE_URL}/api/auth`, { initData });
      console.log('Auth response:', response.data);
      onAuth(response.data.user);
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.response) {
        setError(`Ошибка сервера: ${err.response.data.error || err.response.status}`);
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
        <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>
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