import { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('App mounted');
  }, []);

  return <div style={{ color: 'black', padding: '20px' }}>Hello, world</div>;
}

export default App;