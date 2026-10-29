import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section>
      <h1>404</h1>
      <p className="tagline">This page does not exist.</p>
      <p style={{ marginTop: 16 }}>
        <Link to="/">Back to home</Link>
      </p>
    </section>
  );
}
