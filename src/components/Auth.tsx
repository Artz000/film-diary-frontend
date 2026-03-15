import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface AuthProps {
  onAuth: (user: any) => void;
}

export default function Auth({ onAuth }: AuthProps) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Проверяем, есть ли Telegram WebApp (работаем в Telegram или нет)
      const telegram = (window as any).Telegram?.WebApp;
      let initData = '';

      if (telegram) {
        // Мы внутри Telegram Mini App
        initData = telegram.initData;
        telegram.ready(); // сообщаем Telegram, что приложение готово
        telegram.expand(); // разворачиваем на весь экран
      } else {
        // Локальная разработка — используем тестовые данные
        console.log('Запуск вне Telegram, использую тестовые данные');
        initData = 'test_init_data';
      }

      // Отправляем запрос на бэкенд
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