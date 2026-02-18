"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-left" />

      <Link href="/" className="logo">
        <span className="logo-icon">⚡</span>
        <span className="logo-text">ESPORT PRO</span>
      </Link>

      <div className="header-right">
        {user ? (
          <div className="user-connected">
            <div className="points-badge">
              <span>💰</span>
              <span className="points-value">{user.points.toLocaleString()} Pts</span>
            </div>
            <div className="user-menu" onClick={() => setMenuOpen(!menuOpen)}>
              <span className="username">{user.username}</span>
              {menuOpen && (
                <div className="dropdown">
                  <Link href="/profil" className="username">👤 Mon profil</Link>
                  <Link href="/historique" className="username">📋 Historique</Link>
                  <button className="profil-logout-btn" onClick={logout}>🚪 Déconnexion</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link href="/auth/login" className="btn-login">Connexion</Link>
            <Link href="/auth/register" className="btn-register">Inscription</Link>
          </div>
        )}
      </div>
    </header>
  );
}
