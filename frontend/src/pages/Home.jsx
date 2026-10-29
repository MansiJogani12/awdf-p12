import Header from '../components/Header.jsx';
import About from '../components/About.jsx';
import Skills from '../components/Skills.jsx';
import { profile, skills } from '../data.js';

export default function Home() {
  return (
    <>
      <Header name={profile.name} tagline={profile.tagline} themeColor="var(--accent)" />
      <About bio={profile.bio} />
      <Skills skillList={skills} />
    </>
  );
}
