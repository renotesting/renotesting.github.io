import { useEffect, useState } from 'preact/hooks';

export default function AuthStatus() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  }, []);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  }

  if (user && user.name) {
    return (
      <>
        <span>{user.name}</span>
        <button class="btn btn-primary" type="button" onClick={logout}>Log out</button>
      </>
    );
  }

  return (
    <>
      <a href="/login">Log in</a>
      <a class="btn btn-primary" href="/register">Register</a>
    </>
  );
}
