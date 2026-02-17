"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Tournois", href: "/tournois" },
  { label: "Matchs", href: "/matchs" },
  { label: "Paris", href: "/paris" },
  { label: "Classements", href: "/classements" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="nav">
      <div className="nav-inner">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link${isActive ? " active" : ""}`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}