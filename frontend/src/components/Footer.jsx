export default function Footer({ name, email }) {
  return (
    <footer className="container">
      © {new Date().getFullYear()} {name} · <a href={`mailto:${email}`}>{email}</a>
    </footer>
  );
}
