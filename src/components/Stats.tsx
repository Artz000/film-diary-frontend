import { useState, useEffect } from 'react';
import api from '../api';

interface StatisticsData {
  totalWatched: number;
  totalWant: number;
  totalFavorite: number;
  averageRating: number;
  monthlyActivity: { month: string; count: number }[];
  genreStats: { genre: string; count: number }[];
}

export default function Statistics() {
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/statistics');
        setStats(response.data);
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить статистику');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка статистики...</div>;
  if (error) return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>;
  if (!stats) return null;

  return (
    <div style={{ padding: '10px' }}>
      <h2>Моя статистика</h2>
      <div style={{ display: 'grid', gap: '15px' }}>
        <div style={{ background: 'white', padding: '15px', borderRadius: '12px' }}>
          <h3>Общее</h3>
          <p>📺 Просмотрено: {stats.totalWatched}</p>
          <p>⏳ Хочу посмотреть: {stats.totalWant}</p>
          <p>❤️ Любимые: {stats.totalFavorite}</p>
          <p>⭐ Средний рейтинг: {stats.averageRating?.toFixed(1) ?? 0} / 5</p>
        </div>

        <div style={{ background: 'white', padding: '15px', borderRadius: '12px' }}>
          <h3>Активность по месяцам</h3>
          {stats.monthlyActivity?.length > 0 ? (
            <ul>
              {stats.monthlyActivity.map((item, idx) => (
                <li key={idx}>{item.month}: {item.count} фильмов</li>
              ))}
            </ul>
          ) : <p>Нет данных</p>}
        </div>

        <div style={{ background: 'white', padding: '15px', borderRadius: '12px' }}>
          <h3>Любимые жанры</h3>
          {stats.genreStats?.length > 0 ? (
            <ul>
              {stats.genreStats.map((g, idx) => (
                <li key={idx}>{g.genre}: {g.count} фильмов</li>
              ))}
            </ul>
          ) : <p>Нет данных</p>}
        </div>
      </div>
    </div>
  );
}