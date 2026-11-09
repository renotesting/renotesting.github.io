import { useEffect, useState } from 'preact/hooks';

export default function NavToggle() {
  const [open, setOpen] = useState(false);
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
    window.location.href = '/';
  }

  return (
    <>
      <button
        class="nav-toggle"
        type="button"
        aria-expanded={open ? 'true' : 'false'}
        aria-controls="mobile-nav"
        onClick={() => setOpen((value) => !value)}
      >
        <span class="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" fill="none" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" fill="none" />
          )}
        </svg>
      </button>
      <div class={`mobile-panel${open ? ' open' : ''}`} id="mobile-nav">
        <a href="/#about">About</a>
        <a href="/#testimonials">Testimonials</a>
        <a href="/#services">Services</a>
        <a href="/blog">Blog</a>
        <a href="/contact">Contact</a>
        {user && user.name ? (
          <button type="button" onClick={logout}>Log out ({user.name})</button>
        ) : (
          <>
            <a href="/login">Log in</a>
            <a href="/register">Register</a>
          </>
        )}
      </div>
    </>
  );
}
