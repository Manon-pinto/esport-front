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
    <nav className="nav">
      {/* Desktop */}
      <div className="nav-inner">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link${pathname === link.href ? " active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Mobile */}
      <div className="nav-mobile">
        <button className="nav-burger" onClick={() => setOpen(!open)} aria-label="Menu">
          <span className={`burger-line${open ? " open" : ""}`} />
          <span className={`burger-line${open ? " open" : ""}`} />
          <span className={`burger-line${open ? " open" : ""}`} />
        </button>

        {open && (
          <div className="nav-mobile-menu">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-mobile-link${pathname === link.href ? " active" : ""}`}
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
