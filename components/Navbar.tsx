"use client";

import { useState, useEffect } from "react";

interface NavbarProps {
  onUploadClick: () => void;
  imageCount: number;
}

export default function Navbar({ onUploadClick, imageCount }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="glass fixed top-0 left-0 right-0 z-50"
      style={{
        borderBottom: "1px solid var(--border)",
        transition: "box-shadow 0.3s",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.4)" : "none",
      }}
    >
      <nav
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 20px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30, height: 30,
              background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))",
              borderRadius: 7,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1.5" fill="#0A0A0A" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" fill="#0A0A0A" opacity="0.7" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" fill="#0A0A0A" opacity="0.7" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" fill="#0A0A0A" opacity="0.4" />
            </svg>
          </div>
          <span
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: 18, fontWeight: 600,
              letterSpacing: "0.1em",
              color: "var(--text-primary)",
            }}
          >
            LUMIÈRE
          </span>
        </div>

        {/* Center badge — desktop */}
        <div
          style={{
            display: "flex",
            alignItems: "center", gap: 6,
            padding: "5px 14px",
            borderRadius: 20,
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            fontSize: 12,
            color: "var(--text-muted)",
          }}
          className="hidden-mobile"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          {imageCount > 0 ? (
            <span>
              <span style={{ color: "var(--gold)", fontWeight: 600 }}>{imageCount}</span> 작품
            </span>
          ) : (
            <span>전시 준비 중</span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={onUploadClick}
            className="btn-gold hidden-mobile"
            style={{ padding: "8px 16px", fontSize: 13, gap: 6 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            작품 등록
          </button>

          {/* Mobile upload */}
          <button
            onClick={onUploadClick}
            className="btn-gold visible-mobile"
            style={{ padding: 8, borderRadius: 8, lineHeight: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          {/* Hamburger — mobile */}
          <button
            className="btn-ghost visible-mobile"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ padding: 7, borderRadius: 8, lineHeight: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="animate-slide-down"
          style={{
            borderTop: "1px solid var(--border)",
            padding: "16px 20px 20px",
          }}
        >
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
            {imageCount > 0 ? `${imageCount}개의 작품 전시 중` : "전시 준비 중"}
          </p>
          <button
            onClick={() => { onUploadClick(); setMenuOpen(false); }}
            className="btn-gold"
            style={{
              width: "100%", padding: "12px 0",
              fontSize: 14, gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            작품 등록
          </button>
        </div>
      )}

      <style>{`
        .hidden-mobile { display: flex; }
        .visible-mobile { display: none !important; }
        @keyframes slideDownNav { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .animate-slide-down { animation: slideDownNav 0.2s ease; }
        @media (max-width: 640px) {
          .hidden-mobile { display: none !important; }
          .visible-mobile { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
