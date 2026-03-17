import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

declare global {
  interface Window { Telegram?: { WebApp?: any } }
}

export default function Auth({ onAuth }: any) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const initData = window.Telegram?.WebApp?.initData || '';
      console.log('initData:', initData);
      const res = await axios.post(`${API_BASE_URL}/api/auth`, { initData });
      console.log('Auth response:', res.data);
      onAuth(res.data.user);
    } catch (err) {
      console.error('Auth error:', err);
      alert('Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>FilmDiary</h1>
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Вход...' : 'Войти через Telegram'}
      </button>
    </div>
  );
}