import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import api from '../api';
import type { Film } from '../types';

interface SearchProps { onAddFilm: (film: Film) => void; }

export default function Search({ onAddFilm }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Film[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const searchFilms = async (searchQuery: string, pageNum: number = 1, append: boolean = false) => {
    if (!searchQuery.trim()) { setResults([]); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/kinopoisk/search', { params: { query: searchQuery, limit: 10, page: pageNum } });
      const newFilms = res.data.films;
      if (!Array.isArray(newFilms)) throw new Error('Invalid response');
      setHasMore(res.data.page < res.data.pages);
      if (append) setResults(prev => [...prev, ...newFilms]);
      else setResults(newFilms);
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить фильмы');
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(debounce((value: string) => { if (value.trim()) searchFilms(value); else setResults([]); }, 500), []);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { const val = e.target.value; setQuery(val); debouncedSearch(val); };
  const handleSearchClick = () => { if (query.trim()) searchFilms(query); };
  const loadMore = () => { if (hasMore && !loading) { const next = page + 1; setPage(next); searchFilms(query, next, true); } };
  useEffect(() => () => debouncedSearch.cancel(), []);

  return (
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input type="text" value={query} onChange={handleInputChange} placeholder="Введите название фильма..." style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
        <button onClick={handleSearchClick} disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#0088cc', color: 'white', border: 'none', borderRadius: '6px' }}>{loading ? 'Поиск...' : 'Найти'}</button>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {results.map(film => (
        <div key={film.id} style={{ display: 'flex', gap: '12px', padding: '12px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '10px', background: 'white' }}>
          {film.poster ? <img src={film.poster} alt={film.title} style={{ width: '60px', height: '90px', objectFit: 'cover' }} /> : <div style={{ width: '60px', height: '90px', background: '#f0f0f0' }}>нет фото</div>}
          <div style={{ flex: 1 }}>
            <div><strong>{film.title}</strong> {film.year && <span style={{ color: '#666' }}>({film.year})</span>}</div>
            {film.rating && <div style={{ color: '#f5a623' }}>Рейтинг: {film.rating.toFixed(1)} ★</div>}
            {film.genres && <div style={{ fontSize: '12px', color: '#666' }}>{film.genres.slice(0,3).join(' • ')}</div>}
          </div>
          <button onClick={() => onAddFilm(film)} style={{ padding: '6px 12px', backgroundColor: '#00a86b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Добавить</button>
        </div>
      ))}
      {hasMore && <div style={{ textAlign: 'center', marginTop: '10px' }}><button onClick={loadMore} disabled={loading}>{loading ? 'Загрузка...' : 'Загрузить ещё'}</button></div>}
      {!loading && query && results.length === 0 && !error && <div>Ничего не найдено</div>}
    </div>
  );
}