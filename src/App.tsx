import { useState, useEffect } from 'react';
import Feed from './components/Feed';
import Search from './components/Search';
import MyFilms from './components/MyFilms';
import AddReview from './components/AddReview';
import Login from './components/Login';
import Register from './components/Register';
import Statistics from './components/Stats';
import type { Film } from './types';
import api from './api';

function App() {
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<'feed' | 'search' | 'myfilms' | 'statistics'>('feed');
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('filmdiary_token');
    if (token) {
      api.get('/api/auth/me')
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('filmdiary_token'));
    }
  }, []);

  const handleAuth = (userData: any, token: string) => {
    setUser(userData);
    localStorage.setItem('filmdiary_token', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('filmdiary_token');
  };

  const handleAddFilm = (film: Film) => setSelectedFilm(film);
  const handleSaveReview = () => setSelectedFilm(null);
  const handleCancelReview = () => setSelectedFilm(null);

  if (!user) {
    return isRegistering ? (
      <Register onRegister={handleAuth} onSwitchToLogin={() => setIsRegistering(false)} />
    ) : (
      <Login onLogin={handleAuth} onSwitchToRegister={() => setIsRegistering(true)} />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Верхняя панель */}
      <div style={{ padding: '10px', textAlign: 'right', backgroundColor: '#f5f5f5' }}>
        <span>Привет, {user.name || user.email}!</span>
        <button onClick={handleLogout} style={{ marginLeft: '10px', padding: '5px 10px' }}>Выйти</button>
      </div>

      {/* Контент (растягивается на всю доступную высоту) */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '70px' }}>
        {currentPage === 'feed' && <Feed />}
        {currentPage === 'search' && <Search onAddFilm={handleAddFilm} />}
        {currentPage === 'myfilms' && <MyFilms />}
        {currentPage === 'statistics' && <Statistics />}
      </div>

      {/* Закреплённое нижнее меню */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        gap: '10px',
        padding: '10px',
        backgroundColor: '#fff',
        borderTop: '1px solid #ccc',
        zIndex: 1000,
      }}>
        <button onClick={() => setCurrentPage('feed')} style={{ flex: 1, padding: '10px' }}>Лента</button>
        <button onClick={() => setCurrentPage('search')} style={{ flex: 1, padding: '10px' }}>Поиск</button>
        <button onClick={() => setCurrentPage('myfilms')} style={{ flex: 1, padding: '10px' }}>Мои фильмы</button>
        <button onClick={() => setCurrentPage('statistics')} style={{ flex: 1, padding: '10px' }}>Статистика</button>
      </div>

      {/* Модалка добавления рецензии */}
      {selectedFilm && (
        <AddReview
          film={selectedFilm}
          onSave={handleSaveReview}
          onCancel={handleCancelReview}
        />
      )}
    </div>
  );
}

export default App;