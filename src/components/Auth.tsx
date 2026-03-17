interface AuthProps {
  onAuth: (user: any) => void;
}

export default function Auth({ onAuth }: AuthProps) {
  const handleLogin = () => {
    // Мгновенно "авторизуем" тестового пользователя
    onAuth({
      id: 123,
      firstName: 'Тест',
      lastName: '',
      username: 'test',
    });
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', padding: '0 20px' }}>
      <h1>FilmDiary</h1>
      <p style={{ marginBottom: '30px', color: '#666' }}>Демо-режим (вход без Telegram)</p>
      <button
        onClick={handleLogin}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: '#0088cc',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Войти (тестовый режим)
      </button>
    </div>
  );
}