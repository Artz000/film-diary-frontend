import { useState, useEffect } from 'react';
import api from '../api';

interface StatsData {
  totalWatched: number;
  totalWant: number;
  totalFavorite: number;
  avgRating: number;
  timeline: { label: string; count: number }[];
  topGenres: { name: string; count: number }[];
}

export default function Stats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/users/me/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Не удалось загрузить статистику');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Загрузка статистики...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>;
  if (!stats) return null;

  // Максимальное значение для шкалы timeline
  const maxCount = Math.max(...stats.timeline.map(t => t.count), 1);

  return (
    <div style={{ padding: '10px' }}>
      <h2>Моя статистика</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
        <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalWatched}</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Просмотрено</div>
        </div>
        <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalWant}</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Хочу посмотреть</div>
        </div>
        <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalFavorite}</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Любимые</div>
        </div>
      </div>

      <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '12px', marginBottom: '25px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Средний рейтинг</div>
        <div style={{ fontSize: '32px', color: '#f5a623' }}>{stats.avgRating} / 5</div>
      </div>

      <div style={{ marginBottom: '25px' }}>
        <h3>Просмотры по месяцам</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', height: '150px', marginTop: '15px' }}>
          {stats.timeline.map((item, idx) => (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                height: `${(item.count / maxCount) * 120}px`,
                width: '100%',
                backgroundColor: '#0088cc',
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.3s'
              }} />
              <div style={{ fontSize: '12px', marginTop: '5px' }}>{item.label}</div>
              <div style={{ fontSize: '10px', color: '#666' }}>{item.count}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3>Любимые жанры</h3>
        {stats.topGenres.length === 0 ? (
          <p>Нет данных</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
            {stats.topGenres.map((genre, idx) => (
              <div key={idx} style={{
                background: '#e0e0e0',
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '14px'
              }}>
                {genre.name} ({genre.count})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}