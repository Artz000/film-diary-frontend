import { useState } from 'react';
import axios from 'axios';
import WebApp from '@twa-dev/sdk';
import { API_BASE_URL } from '../config';

interface AuthProps {
  onAuth: (user: any) => void;
}

export default function Auth({ onAuth }: AuthProps) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Получаем initData из Telegram WebApp
      const initData = WebApp.initData;

      // Если приложение открыто не в Telegram (для теста), можно использовать заглушку
      if (!initData) {
        console.warn('Not in Telegram, using mock data');
        // Для локального тестирования можно вернуть тестового пользователя
        onAuth({ id: 123, firstName: 'Тест', lastName: '', username: 'test' });
        setLoading(false);
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/api/auth`, { initData });
      onAuth(response.data.user);
    } catch (error) {
      console.error('Auth error:', error);
      alert('Ошибка авторизации. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>FilmDiary</h1>
      <p>Войдите через Telegram, чтобы вести дневник фильмов</p>
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Вход...' : 'Войти через Telegram'}
      </button>
    </div>
  );
}