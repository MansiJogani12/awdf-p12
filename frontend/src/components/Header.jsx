export default function Header({ name, tagline, themeColor }) {
  return (
    <section id="top">
      <h1 style={{ color: themeColor }}>{name}</h1>
      <p className="tagline">{tagline}</p>
    </section>
  );
}
