"use client";

import { useState } from "react";
import Link from "next/link";

interface User {
  username: string;
  points: number;
}

const mockUser: User | null = null;

export default function Header() {
  const [user] = useState<User | null>(mockUser);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">

      {/* Logo */}
      <Link href="/" className="logo">
        <span className="logo-icon">⚡</span>
        <span className="logo-text">ESPORT PRO</span>
      </Link>

      {/* Droite */}
      <div className="header-right">
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>

            {/* Points */}
            <div className="points-badge">
              <span>💰</span>
              <span className="points-value">{user.points.toLocaleString()} Pts</span>
            </div>

            {/* Menu utilisateur */}
            <div className="user-menu" onClick={() => setMenuOpen(!menuOpen)}>
              <span className="username">{user.username}</span>
              <span className="chevron">{menuOpen ? "▲" : "▼"}</span>

              {menuOpen && (
                <div className="dropdown">
                  <Link href="/profil" className="dropdown-item">👤 Mon profil</Link>
                  <Link href="/historique" className="dropdown-item">📋 Historique</Link>
                  <button className="dropdown-item logout">🚪 Déconnexion</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Non connecté */
          <div className="auth-buttons">
            <Link href="/connexion" className="btn-login">Connexion</Link>
            <Link href="/inscription" className="btn-register">Inscription</Link>
          </div>
        )}
      </div>
    </header>
  );
}