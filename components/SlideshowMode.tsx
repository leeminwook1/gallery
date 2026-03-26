"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GalleryImage } from "@/types";

interface SlideshowProps {
  images: GalleryImage[];
  startIndex?: number;
  onClose: () => void;
}

const INTERVAL = 5000;

export default function SlideshowMode({ images, startIndex = 0, onClose }: SlideshowProps) {
  const [current, setCurrent] = useState(startIndex);
  const [next, setNext] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showUI, setShowUI] = useState(true);
  const uiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStart = useRef<number | null>(null);

  const goTo = useCallback((idx: number) => {
    if (transitioning || idx === current) return;
    setTransitioning(true);
    setNext(idx);
    setTimeout(() => {
      setCurrent(idx);
      setNext(null);
      setTransitioning(false);
      setProgress(0);
    }, 700);
  }, [transitioning, current]);

  const goNext = useCallback(() => goTo((current + 1) % images.length), [current, images.length, goTo]);
  const goPrev = useCallback(() => goTo((current - 1 + images.length) % images.length), [current, images.length, goTo]);

  // Auto-advance
  useEffect(() => {
    if (paused || images.length <= 1) return;
    const t = setInterval(goNext, INTERVAL);
    return () => clearInterval(t);
  }, [paused, goNext, images.length]);

  // Progress
  useEffect(() => {
    if (paused || images.length <= 1) { setProgress(0); return; }
    setProgress(0);
    const step = 100 / (INTERVAL / 80);
    const t = setInterval(() => setProgress((p) => Math.min(p + step, 100)), 80);
    return () => clearInterval(t);
  }, [paused, current, images.length]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === " ") { e.preventDefault(); setPaused((p) => !p); }
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose, goNext, goPrev]);

  // Auto-hide UI
  const resetUI = useCallback(() => {
    setShowUI(true);
    if (uiTimer.current) clearTimeout(uiTimer.current);
    uiTimer.current = setTimeout(() => setShowUI(false), 3500);
  }, []);
  useEffect(() => { resetUI(); }, [resetUI]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 60) { dx < 0 ? goNext() : goPrev(); }
    touchStart.current = null;
  };

  const img = images[current];
  const nextImg = next !== null ? images[next] : null;

  const pillBtn: React.CSSProperties = {
    width: 40, height: 40, borderRadius: "50%",
    background: "rgba(14,14,14,0.7)", border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(8px)", transition: "all 0.2s",
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "#000", cursor: showUI ? "default" : "none" }}
      onMouseMove={resetUI} onClick={resetUI}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
    >
      {/* Images */}
      <div style={{ position: "absolute", inset: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/uploads/${img.filename}`} alt={img.title}
          style={{ width: "100%", height: "100%", objectFit: "contain",
            transition: "opacity 0.7s ease", opacity: transitioning ? 0 : 1 }} />
      </div>
      {nextImg && (
        <div style={{ position: "absolute", inset: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/uploads/${nextImg.filename}`} alt={nextImg.title}
            style={{ width: "100%", height: "100%", objectFit: "contain",
              transition: "opacity 0.7s ease", opacity: transitioning ? 1 : 0 }} />
        </div>
      )}

      {/* Gradients */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 35%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 25%)", pointerEvents: "none" }} />

      {/* Progress */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: "rgba(255,255,255,0.1)", opacity: showUI ? 1 : 0.3,
        transition: "opacity 0.4s",
      }}>
        <div style={{
          height: "100%", width: `${progress}%`,
          background: "linear-gradient(90deg, var(--gold-dark), var(--gold), var(--gold-light))",
          transition: "width 0.08s linear", borderRadius: "0 2px 2px 0",
        }} />
      </div>

      {/* Top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        opacity: showUI ? 1 : 0, transition: "opacity 0.4s",
      }}>
        <span style={{ fontFamily: "var(--font-playfair), serif", fontSize: 14, color: "rgba(255,255,255,0.7)", letterSpacing: "0.08em" }}>
          슬라이드쇼
        </span>
        <button onClick={onClose} style={{ ...pillBtn, width: 34, height: 34 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Desktop nav arrows */}
      {images.length > 1 && (
        <div className="slideshow-nav-desktop">
          <button onClick={goPrev} style={{ ...pillBtn, position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", opacity: showUI ? 1 : 0, transition: "opacity 0.3s" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button onClick={goNext} style={{ ...pillBtn, position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", opacity: showUI ? 1 : 0, transition: "opacity 0.3s" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      )}

      {/* Bottom info */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "24px 20px", display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        opacity: showUI ? 1 : 0, transition: "opacity 0.4s",
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="tag">{img.category}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{current + 1}/{images.length}</span>
          </div>
          <h2 style={{
            fontFamily: "var(--font-playfair), serif", fontSize: "clamp(18px, 4vw, 32px)",
            fontWeight: 600, color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.5)",
            marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{img.title}</h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
            {img.artist}{img.year ? ` · ${img.year}` : ""}
          </p>
        </div>
        <button onClick={() => setPaused((p) => !p)} style={{ ...pillBtn, flexShrink: 0 }}
          title={paused ? "재생" : "일시정지"}>
          {paused ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
          )}
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .slideshow-nav-desktop { display: none !important; }
        }
      `}</style>
    </div>
  );
}
