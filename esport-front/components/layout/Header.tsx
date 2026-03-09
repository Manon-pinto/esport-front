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
        <svg width="40" height="40" viewBox="0 0 24 24" fill="#f6e05e" stroke="#f6e05e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        <span className="logo-text">ESPORT PRO</span>
      </Link>

      <div className="header-right">
        {user ? (
          <div className="user-connected">
            <div className="points-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f6e05e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
              </svg>
              <span className="points-value">{user.points.toLocaleString()} Pts</span>
            </div>
            <div className="user-menu" onClick={() => setMenuOpen(!menuOpen)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="username">{user.username}</span>
              {menuOpen && (
                <div className="dropdown">
                  <Link href="/profil" className="username">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#667EEA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Mon profil
                  </Link>
                  <Link href="/historique" className="username">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>
                    Historique
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/admin" className="username">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0 0 5 4.93M4.93 19.07A10 10 0 0 0 19 19.07M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
                      Admin
                    </Link>
                  )}
                  <button className="profil-logout-btn" onClick={logout}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Déconnexion
                  </button>
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
