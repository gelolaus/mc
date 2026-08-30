import { MapFrame } from '../../components';

export default function Map() {
  return (
    <section className="section">
      <h1 className="pixel" style={{ fontSize: 'clamp(42px, 6vw, 64px)' }}>World Map</h1>
      <MapFrame />
    </section>
  );
}
