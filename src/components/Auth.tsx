import { useState, useEffect } from 'react';
import axios from 'axios';
import WebApp from '@twa-dev/sdk';
import { API_BASE_URL } from '../config';

interface AuthProps {
  onAuth: (user: any) => void;
}

export default function Auth({ onAuth }: AuthProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Сообщаем Telegram, что приложение готово и его можно развернуть на весь экран
    WebApp.ready();
    WebApp.expand();
  }, []);

  const handleLogin = async () => {
    setLoading(true);

    try {
      // Получаем initData из Telegram WebApp
      const initData = WebApp.initData;

      // Если приложение открыто не в Telegram (например, в браузере) — показываем предупреждение
      if (!initData) {
        console.warn('Not in Telegram — using mock data for local testing');
        // В реальном Telegram эта ветка никогда не выполнится,
        // но для локальной разработки можно вернуть тестового пользователя
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

      // Отправляем запрос на бэкенд
      const response = await axios.post(`${API_BASE_URL}/api/auth`, { initData });

      console.log('Auth response:', response.data);

      // Передаём данные пользователя в родительский компонент
      onAuth(response.data.user);
    } catch (error: any) {
      console.error('Auth error:', error);
      // Показываем пользователю понятную ошибку
      if (error.response) {
        // Ошибка от сервера (4xx, 5xx)
        alert(`Ошибка авторизации: ${error.response.data.error || 'Неизвестная ошибка'}`);
      } else if (error.request) {
        // Запрос был отправлен, но нет ответа
        alert('Сервер не отвечает. Попробуйте позже.');
      } else {
        // Ошибка при настройке запроса
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