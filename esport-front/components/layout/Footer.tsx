import Link from "next/link"

const NAV_LINKS = [
  { label: "Tournois", href: "/tournois" },
  { label: "Matchs", href: "/matchs" },
  { label: "Paris", href: "/paris" },
  { label: "Classements", href: "/classements" },
]

const INFO_LINKS = [
  { label: "À propos", href: "/a-propos" },
  { label: "FAQ", href: "/faq" },
  { label: "CGU", href: "/cgu" },
  { label: "Mentions légales", href: "/mentions-legales" },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#f6e05e" stroke="#f6e05e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              ESPORT PRO
            </div>
            <p className="footer-tagline">
              Suivez les tournois esport, comparez les équipes et placez vos paris en points virtuels — sans argent réel.
            </p>
          </div>

          <div>
            <h3 className="footer-col-title">Navigation</h3>
            <nav className="footer-links">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href}>{l.label}</Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="footer-col-title">Informations</h3>
            <nav className="footer-links">
              {INFO_LINKS.map((l) => (
                <Link key={l.href} href={l.href}>{l.label}</Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-text">© 2026 ESPORT PRO</span>
          <span className="footer-sub">Projet fil rouge CDA — My Digital School Bordeaux</span>
        </div>
      </div>
    </footer>
  );
}
