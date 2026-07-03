import Link from 'next/link';

const links = [
  { href: '#features', label: 'Features' },
  { href: '#architecture', label: 'Architecture' },
  { href: '#quickstart', label: 'Quickstart' },
  { href: '#providers', label: 'Providers' },
  { href: '/getting-started', label: 'Docs' },
];

export function LandingNav() {
  return (
    <header className="landing-nav">
      <div className="landing-nav-inner">
        <Link href="/" className="landing-logo">
          <span className="landing-logo-mark">K</span>
          <span>Kortex</span>
        </Link>
        <nav className="landing-nav-links" aria-label="Main">
          {links.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
