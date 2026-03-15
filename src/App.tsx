import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Feed from './components/Feed';
import Search from './components/Search';
import MyFilms from './components/MyFilms';
import AddReview from './components/AddReview';
import type { Film } from './types'; // создадим позже

function App() {
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<'feed' | 'search' | 'myfilms'>('feed');
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null); // для модалки

  // При загрузке проверяем, есть ли сохранённый пользователь
  useEffect(() => {
    const savedUser = localStorage.getItem('filmdiary_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
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
    // Можно показать уведомление или обновить список фильмов
    alert('Рецензия добавлена (заглушка)');
  };

  const handleCancelReview = () => {
    setSelectedFilm(null);
  };

  if (!user) {
    return <Auth onAuth={handleAuth} />;
  }

  return (
    <div style={{ padding: '10px' }}>
      {/* Нижнее меню */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setCurrentPage('feed')}>Лента</button>
        <button onClick={() => setCurrentPage('search')}>Поиск</button>
        <button onClick={() => setCurrentPage('myfilms')}>Мои фильмы</button>
      </div>

      {/* Контент страницы */}
      {currentPage === 'feed' && <Feed user={user} />}
      {currentPage === 'search' && <Search onAddFilm={handleAddFilm} />}
      {currentPage === 'myfilms' && <MyFilms user={user} />}

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