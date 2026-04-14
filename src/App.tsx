import { useState, useEffect } from 'react';
import Feed from './components/Feed';
import Search from './components/Search';
import MyFilms from './components/MyFilms';
import AddReview from './components/AddReview';
import Login from './components/Login';
import Register from './components/Register';
import type { Film } from './types';
import api from './api';

function App() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<'feed' | 'search' | 'myfilms'>('feed');
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('filmdiary_token');
    if (storedToken) {
      api.get('/api/auth/me')
        .then(res => {
          setUser(res.data);
          setToken(storedToken);
        })
        .catch(() => {
          localStorage.removeItem('filmdiary_token');
        });
    }
  }, []);

  const handleAuth = (userData: any, newToken: string) => {
    setUser(userData);
    setToken(newToken);
    localStorage.setItem('filmdiary_token', newToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('filmdiary_token');
  };

  const handleAddFilm = (film: Film) => setSelectedFilm(film);
  const handleSaveReview = () => setSelectedFilm(null);
  const handleCancelReview = () => setSelectedFilm(null);

  if (!user) {
    return isRegistering ? (
      <Register onRegister={handleAuth} />
    ) : (
      <Login onLogin={handleAuth} onSwitchToRegister={() => setIsRegistering(true)} />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', textAlign: 'right' }}>
        <span>Привет, {user.name || user.email}!</span>
        <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Выйти</button>
      </div>
      <div style={{ flex: 1, paddingBottom: '70px' }}>
        {currentPage === 'feed' && <Feed />}
        {currentPage === 'search' && <Search onAddFilm={handleAddFilm} />}
        {currentPage === 'myfilms' && <MyFilms />}
      </div>
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', gap: '10px', padding: '10px', backgroundColor: '#fff', borderTop: '1px solid #ccc' }}>
        <button onClick={() => setCurrentPage('feed')}>Лента</button>
        <button onClick={() => setCurrentPage('search')}>Поиск</button>
        <button onClick={() => setCurrentPage('myfilms')}>Мои фильмы</button>
      </div>
      {selectedFilm && <AddReview film={selectedFilm} onSave={handleSaveReview} onCancel={handleCancelReview} />}
    </div>
  );
}

export default App;