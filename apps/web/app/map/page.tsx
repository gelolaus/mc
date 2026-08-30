import { MapFrame } from '../../components';

export default function Map() {
  return (
    <section className="section interior-page map-page">
      <header className="page-heading">
        <span className="eyebrow">Live overview</span>
        <h1 className="pixel">World Map</h1>
        <p className="sub">Explore the world from your browser.</p>
      </header>
      <MapFrame />
    </section>
  );
}
