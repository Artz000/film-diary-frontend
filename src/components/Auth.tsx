import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface AuthProps {
  onAuth: (user: any) => void;
}

export default function Auth({ onAuth }: AuthProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Инициализация Telegram WebApp, если он доступен
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);

    try {
      let initData = '';
      if (window.Telegram?.WebApp) {
        initData = window.Telegram.WebApp.initData;
      }

      // Если приложение открыто не в Telegram – используем заглушку для локального тестирования
      if (!initData) {
        console.warn('Not in Telegram — using mock data for local testing');
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
    } catch (error: any) {
      console.error('Auth error:', error);
      if (error.response) {
        alert(`Ошибка авторизации: ${error.response.data.error || 'Неизвестная ошибка'}`);
      } else if (error.request) {
        alert('Сервер не отвечает. Попробуйте позже.');
      } else {
        alert('Ошибка при отправке запроса');
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