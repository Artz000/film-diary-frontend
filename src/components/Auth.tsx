import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface AuthProps {
  onAuth: (user: any) => void;
}

export default function Auth({ onAuth }: AuthProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Если в Telegram – инициализируем
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // Проверяем, что мы в Telegram и есть initData
      const webApp = window.Telegram?.WebApp;
      const initData = webApp?.initData || '';

      // Если вне Telegram – для локальной разработки можно использовать заглушку
      if (!initData) {
        console.warn('Not in Telegram – using mock data');
        onAuth({ id: 123, firstName: 'Тест', lastName: '', username: 'test' });
        setLoading(false);
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/api/auth`, { initData });
      onAuth(response.data.user);
    } catch (err: any) {
      console.error('Auth error:', err);
      setError('Ошибка входа. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', padding: '0 20px' }}>
      <h1>FilmDiary</h1>
      <p style={{ marginBottom: '30px', color: '#666' }}>Войдите через Telegram</p>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
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
        }}
      >
        {loading ? 'Вход...' : 'Войти через Telegram'}
      </button>
    </div>
  );
}