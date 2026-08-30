import Link from 'next/link';

export function SiteHeader({ anyOnline }: { anyOnline: boolean }) {
  return (
    <header className="shell nav">
      <Link className={`brand ${anyOnline ? 'brand-online' : ''}`} href="/">JPCS-APC MINECRAFT</Link>
      <nav className="nav-links">
        <Link className="nav-button" href="/">Home</Link>
        <Link className="nav-button" href="/players">Players</Link>
        <Link className="nav-button" href="/world">World</Link>
        <Link className="nav-button" href="/map">Map</Link>
      </nav>
    </header>
  );
}
