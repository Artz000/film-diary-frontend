import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { API_BASE_URL } from '../config';
import type { Film } from '../types';

interface SearchProps {
  onAddFilm: (film: Film) => void;
}

interface SearchResponse {
  films: Film[];
  total: number;
  page: number;
  pages: number;
}

export default function Search({ onAddFilm }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Film[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [_totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const searchFilms = async (searchQuery: string, pageNum: number = 1, append: boolean = false) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<SearchResponse>(`${API_BASE_URL}/api/kinopoisk/search`, {
        params: {
          query: searchQuery,
          limit: 10,
          page: pageNum,
        },
      });

      const newFilms = response.data.films;
      setTotalPages(response.data.pages);
      setHasMore(response.data.page < response.data.pages);

      if (append) {
        setResults((prev) => [...prev, ...newFilms]);
      } else {
        setResults(newFilms);
        setPage(1);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Не удалось загрузить фильмы. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      if (value.trim()) {
        searchFilms(value);
      } else {
        setResults([]);
      }
    }, 500),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleSearchClick = () => {
    if (query.trim()) {
      searchFilms(query);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      searchFilms(query, nextPage, true);
    }
  };

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div style={{ padding: '10px' }}>
      <h2>Поиск фильмов</h2>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Введите название фильма..."
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '16px',
          }}
        />
        <button
          onClick={handleSearchClick}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0088cc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? 'Поиск...' : 'Найти'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>
      )}

      {results.length > 0 && (
        <>
          <div style={{ marginBottom: '10px', color: '#666' }}>
            Найдено фильмов: {results.length}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {results.map((film) => (
              <div
                key={film.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                {film.poster ? (
                  <img
                    src={film.poster}
                    alt={film.title}
                    style={{
                      width: '60px',
                      height: '90px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '60px',
                      height: '90px',
                      backgroundColor: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: '#999',
                    }}
                  >
                    Нет постера
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {film.title} {film.year ? `(${film.year})` : ''}
                  </div>
                  {film.rating && (
                    <div style={{ fontSize: '14px', color: '#f5a623' }}>
                      Рейтинг: {film.rating.toFixed(1)} ⭐
                    </div>
                  )}
                  {film.genres && film.genres.length > 0 && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      {film.genres.slice(0, 3).join(' • ')}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onAddFilm(film)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#00a86b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    alignSelf: 'center',
                  }}
                >
                  Добавить
                </button>
              </div>
            ))}
          </div>

          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={loadMore}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: loading ? 'wait' : 'pointer',
                }}
              >
                {loading ? 'Загрузка...' : 'Загрузить ещё'}
              </button>
            </div>
          )}
        </>
      )}

      {!loading && query && results.length === 0 && !error && (
        <div style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
          Ничего не найдено
        </div>
      )}
    </div>
  );
}