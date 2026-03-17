import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Feed from './components/Feed';
import Search from './components/Search';
import MyFilms from './components/MyFilms';
import AddReview from './components/AddReview';
import type { Film } from './types';

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<'feed' | 'search' | 'myfilms'>('feed');
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);

  useEffect(() => {
    // Небольшая задержка для показа LaunchScreen (можно убрать)
    const timer = setTimeout(() => setLoading(false), 300);
    const savedUser = localStorage.getItem('filmdiary_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    return () => clearTimeout(timer);
  }, []);

  const handleAuth = (userData: any) => {
    setUser(userData);
    localStorage.setItem('filmdiary_user', JSON.stringify(userData));
  };

  const handleAddFilm = (film: Film) => {
    setSelectedFilm(film);
  };

  const handleSaveReview = () => {
    setSelectedFilm(null);
  };

  const handleCancelReview = () => {
    setSelectedFilm(null);
  };

  if (!user) {
    return <Auth onAuth={handleAuth} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Основной контент с отступом снизу для меню */}
      <div style={{ flex: 1, paddingBottom: '70px' }}>
        {currentPage === 'feed' && <Feed user={user} />}
        {currentPage === 'search' && <Search onAddFilm={handleAddFilm} />}
        {currentPage === 'myfilms' && <MyFilms user={user} />}
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
        backgroundColor: '#ffffff',
        borderTop: '1px solid #ccc',
        boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
        zIndex: 1000
      }}>
        <button
          onClick={() => setCurrentPage('feed')}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: currentPage === 'feed' ? '#0088cc' : '#f0f0f0',
            color: currentPage === 'feed' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: currentPage === 'feed' ? 'bold' : 'normal'
          }}
        >
          Лента
        </button>
        <button
          onClick={() => setCurrentPage('search')}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: currentPage === 'search' ? '#0088cc' : '#f0f0f0',
            color: currentPage === 'search' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: currentPage === 'search' ? 'bold' : 'normal'
          }}
        >
          Поиск
        </button>
        <button
          onClick={() => setCurrentPage('myfilms')}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: currentPage === 'myfilms' ? '#0088cc' : '#f0f0f0',
            color: currentPage === 'myfilms' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: currentPage === 'myfilms' ? 'bold' : 'normal'
          }}
        >
          Мои фильмы
        </button>
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