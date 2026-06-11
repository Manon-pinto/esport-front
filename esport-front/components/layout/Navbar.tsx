"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Tournois", href: "/tournois" },
  { label: "Matchs", href: "/matchs" },
  { label: "Paris", href: "/paris" },
  { label: "Classements", href: "/classements" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav" aria-label="Navigation principale">
      {/* Desktop */}
      <div className="nav-inner" role="list">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link${pathname === link.href ? " active" : ""}`}
            aria-current={pathname === link.href ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Mobile */}
      <div className="nav-mobile">
        <button
          className="nav-burger"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          aria-controls="nav-mobile-menu"
        >
          <span className={`burger-line${open ? " open" : ""}`} aria-hidden="true" />
          <span className={`burger-line${open ? " open" : ""}`} aria-hidden="true" />
          <span className={`burger-line${open ? " open" : ""}`} aria-hidden="true" />
        </button>

        {open && (
          <div id="nav-mobile-menu" className="nav-mobile-menu" role="list">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-mobile-link${pathname === link.href ? " active" : ""}`}
                aria-current={pathname === link.href ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
