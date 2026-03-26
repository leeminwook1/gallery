"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GalleryImage } from "@/types";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface ImageCardProps {
  image: GalleryImage;
  index: number;
  onClick: (image: GalleryImage) => void;
}

function formatSize(b: number) {
  return b < 1024 * 1024 ? (b / 1024).toFixed(1) + " KB" : (b / (1024 * 1024)).toFixed(1) + " MB";
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" });
}
function getLiked(): Set<string> {
  try { const r = localStorage.getItem("gallery_likes"); return r ? new Set(JSON.parse(r)) : new Set(); } catch { return new Set(); }
}
function toggleLike(id: string) {
  const s = getLiked(); s.has(id) ? s.delete(id) : s.add(id);
  localStorage.setItem("gallery_likes", JSON.stringify([...s])); return s.has(id);
}

export default function ImageCard({ image, index, onClick }: ImageCardProps) {
  const { ref, visible } = useScrollReveal(0.08);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);
  const [showBigHeart, setShowBigHeart] = useState(false);
  const lastTap = useRef(0);

  useEffect(() => { setLiked(getLiked().has(image.id)); }, [image.id]);

  const doLike = useCallback(() => {
    const nowLiked = toggleLike(image.id);
    setLiked(nowLiked);
    if (nowLiked) {
      setLikeAnim(true);
      setShowBigHeart(true);
      setTimeout(() => setLikeAnim(false), 500);
      setTimeout(() => setShowBigHeart(false), 900);
    }
  }, [image.id]);

  const handleLike = (e: React.MouseEvent) => { e.stopPropagation(); doLike(); };

  // Double-tap to like (mobile)
  const handleCardClick = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // Double tap
      if (!liked) doLike();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
      setTimeout(() => {
        if (lastTap.current !== 0) {
          onClick(image);
          lastTap.current = 0;
        }
      }, 300);
    }
  };

  const likeBtn: React.CSSProperties = {
    width: 34, height: 34, borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: liked ? "rgba(214,69,69,0.85)" : "rgba(10,10,10,0.65)",
    border: `1px solid ${liked ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)"}`,
    color: liked ? "#fff" : "rgba(255,255,255,0.65)",
    cursor: "pointer", transition: "all 0.25s",
    backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
    transform: likeAnim ? "scale(1.3)" : "scale(1)",
  };

  return (
    <div
      ref={ref}
      className="image-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.45s ease ${Math.min(index * 50, 300)}ms, transform 0.45s ease ${Math.min(index * 50, 300)}ms`,
      }}
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="card-img-wrap" style={{ position: "relative", paddingBottom: "68%", background: "var(--bg-card)" }}>
        {!imgLoaded && <div className="skeleton" style={{ position: "absolute", inset: 0 }} />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/uploads/${image.filename}`} alt={image.title}
          onLoad={() => setImgLoaded(true)} className="card-img"
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", opacity: imgLoaded ? 1 : 0,
            transition: "opacity 0.4s, transform 0.5s cubic-bezier(0.4,0,0.2,1)",
          }} />

        <div className="card-overlay" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)",
          opacity: 0, transition: "opacity 0.3s",
        }} />

        {/* Big heart (double-tap feedback) */}
        {showBigHeart && (
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
            pointerEvents: "none", zIndex: 20,
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="#fff"
              style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))", animation: "bigHeartPop 0.8s ease forwards" }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
        )}

        {/* Category */}
        <div style={{ position: "absolute", top: 10, left: 10, zIndex: 5 }}>
          <span className="tag">{image.category}</span>
        </div>

        {/* Like button only */}
        <div style={{ position: "absolute", top: 10, right: 10, zIndex: 5 }}>
          <button onClick={handleLike} style={likeBtn}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* View hint */}
        <div className="card-view-hint" style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          opacity: 0, transition: "opacity 0.3s", pointerEvents: "none",
        }}>
          <div style={{
            padding: "6px 14px", borderRadius: 16,
            background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)",
            fontSize: 11, fontWeight: 500, color: "#fff",
          }}>크게 보기</div>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <h3 style={{
            fontSize: 14, fontWeight: 600, fontFamily: "var(--font-playfair), serif",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
          }}>{image.title}</h3>
          {liked && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--danger)" style={{ flexShrink: 0 }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )}
        </div>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 2 }}>{image.artist}</p>
        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
          {image.year} · {formatDate(image.uploadedAt)} · {formatSize(image.size)}
        </p>
        {image.description && (
          <p style={{
            fontSize: 11, color: "var(--text-muted)", marginTop: 6,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden", lineHeight: 1.5,
          }}>{image.description}</p>
        )}
      </div>

      <style>{`
        @keyframes bigHeartPop {
          0% { transform: scale(0); opacity: 0.9; }
          40% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
