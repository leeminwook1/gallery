"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { GalleryImage } from "@/types";
import EditModal from "@/components/EditModal";

interface LightboxProps {
  image: GalleryImage;
  images: GalleryImage[];
  onClose: () => void;
  onNavigate: (image: GalleryImage) => void;
  onDelete: (id: string) => void;
  onEdit: (updated: GalleryImage) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}
function formatFileSize(b: number) {
  return b < 1024 * 1024 ? (b / 1024).toFixed(1) + " KB" : (b / (1024 * 1024)).toFixed(1) + " MB";
}

export default function LightboxModal({ image, images, onClose, onNavigate, onDelete, onEdit }: LightboxProps) {
  const idx = images.findIndex((i) => i.id === image.id);
  const hasPrev = idx > 0;
  const hasNext = idx < images.length - 1;
  const [opacity, setOpacity] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const nav = useCallback((img: GalleryImage) => {
    setOpacity(0);
    setTimeout(() => { onNavigate(img); setOpacity(1); }, 160);
  }, [onNavigate]);

  // Scroll strip
  useEffect(() => {
    const el = stripRef.current?.children[idx] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [idx]);

  // Keyboard
  const onKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft" && hasPrev) nav(images[idx - 1]);
    if (e.key === "ArrowRight" && hasNext) nav(images[idx + 1]);
    if (e.key === "i") setShowInfo((p) => !p);
  }, [onClose, hasPrev, hasNext, images, idx, nav]);

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onKey]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
      if (dx < 0 && hasNext) nav(images[idx + 1]);
      if (dx > 0 && hasPrev) nav(images[idx - 1]);
    }
    touchStart.current = null;
  };

  const handleDelete = async () => {
    if (!confirm(`"${image.title}" 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch("/api/images/delete", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: image.id }),
      });
      if (!res.ok) throw new Error();
      onDelete(image.id);
      if (hasNext) nav(images[idx + 1]);
      else if (hasPrev) nav(images[idx - 1]);
      else onClose();
    } catch { alert("삭제 실패"); }
  };

  const navBtn: React.CSSProperties = {
    position: "absolute", top: "50%", transform: "translateY(-50%)", zIndex: 10,
    width: 42, height: 42, borderRadius: "50%",
    background: "rgba(14,14,14,0.8)", border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff", cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(8px)", transition: "all 0.2s",
  };

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="animate-scale-in lightbox-layout">
        {/* Image area */}
        <div className="lightbox-image-area"
          onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {/* Close mobile */}
          <button onClick={onClose} className="lightbox-close-btn" style={{
            position: "absolute", top: 12, right: 12, zIndex: 20,
            width: 36, height: 36, borderRadius: 8,
            background: "rgba(14,14,14,0.8)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Nav arrows */}
          {hasPrev && (
            <button onClick={() => nav(images[idx - 1])}
              className="lightbox-nav-desktop" style={{ ...navBtn, left: 16 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          {hasNext && (
            <button onClick={() => nav(images[idx + 1])}
              className="lightbox-nav-desktop" style={{ ...navBtn, right: 16 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {/* Main image */}
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", position: "relative",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={image.id} src={`/uploads/${image.filename}`} alt={image.title}
              style={{
                maxWidth: "100%", maxHeight: "100%", objectFit: "contain",
                padding: "24px", opacity, transition: "opacity 0.16s ease",
              }} />
          </div>

          {/* Counter */}
          <div style={{
            position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)",
            background: "rgba(14,14,14,0.8)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16,
            padding: "4px 12px", fontSize: 11, color: "var(--text-secondary)",
          }}>
            {idx + 1} / {images.length}
          </div>

          {/* Mobile bottom bar */}
          <div className="lightbox-mobile-bar">
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{
                fontFamily: "var(--font-playfair), serif", fontSize: 16, fontWeight: 600,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{image.title}</h3>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                {image.artist} · {image.year}
              </p>
            </div>
            <button onClick={() => setShowInfo(true)} style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: "var(--bg-card)", border: "1px solid var(--border)",
              color: "var(--text-secondary)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </button>
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="lightbox-strip hide-scrollbar">
              <div ref={stripRef} style={{ display: "flex", gap: 5, padding: "0 8px" }}>
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => nav(img)} style={{
                    width: 48, height: 48, borderRadius: 6, flexShrink: 0,
                    overflow: "hidden", cursor: "pointer", padding: 0,
                    border: `2px solid ${i === idx ? "var(--gold)" : "transparent"}`,
                    opacity: i === idx ? 1 : 0.4, transition: "all 0.2s",
                    background: "var(--bg-card)",
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/uploads/${img.filename}`} alt={img.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info panel — desktop sidebar / mobile bottom sheet */}
        <div className={`lightbox-info-panel ${showInfo ? "open" : ""}`}>
          {/* Mobile drag handle */}
          <div className="lightbox-info-handle" onClick={() => setShowInfo(false)}>
            <div style={{ width: 32, height: 4, borderRadius: 2, background: "var(--border-hover)" }} />
          </div>

          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", borderBottom: "1px solid var(--border)",
          }}>
            <span className="tag">{image.category}</span>
            <button onClick={() => { setShowInfo(false); onClose(); }}
              className="lightbox-close-desktop"
              style={{
                width: 30, height: 30, borderRadius: 6,
                background: "var(--bg-card)", border: "1px solid var(--border)",
                color: "var(--text-secondary)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <h2 style={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: 20, fontWeight: 600, lineHeight: 1.3, marginBottom: 6,
              }}>{image.title}</h2>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{image.artist}</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{image.year}</p>
            </div>
            {image.description && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>설명</p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.75 }}>{image.description}</p>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>정보</p>
              {[
                { l: "등록일", v: formatDate(image.uploadedAt) },
                { l: "파일 크기", v: formatFileSize(image.size) },
                { l: "파일명", v: image.originalName },
              ].map(({ l, v }) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{l}</span>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", textAlign: "right", maxWidth: "55%", wordBreak: "break-all" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            padding: "14px 20px", borderTop: "1px solid var(--border)",
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            {/* Edit + Download */}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowEdit(true)}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 8, fontSize: 12, fontWeight: 500,
                  background: "rgba(196,162,101,0.1)", border: "1px solid rgba(196,162,101,0.2)",
                  color: "var(--gold)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  transition: "all 0.2s",
                }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                수정
              </button>
              <a href={`/uploads/${image.filename}`} download={image.originalName}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 8, fontSize: 12, fontWeight: 500,
                  textAlign: "center", textDecoration: "none",
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  color: "var(--text-secondary)", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 5, transition: "all 0.2s",
                }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                다운로드
              </a>
            </div>
            {/* Delete */}
            <button onClick={handleDelete}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 8, fontSize: 12, fontWeight: 500,
                background: "var(--danger-light)", border: "1px solid rgba(214,69,69,0.2)",
                color: "var(--danger)", cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", gap: 5,
              }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
              삭제
            </button>
          </div>
        </div>
      </div>

      {showEdit && (
        <EditModal image={image} onClose={() => setShowEdit(false)}
          onSave={(updated) => { onEdit(updated); setShowEdit(false); }} />
      )}

      <style>{`
        .lightbox-layout { display: flex; width: 100%; height: 100%; }
        .lightbox-image-area {
          flex: 1; display: flex; flex-direction: column;
          position: relative; min-width: 0;
        }
        .lightbox-strip {
          height: 66px; background: rgba(10,10,10,0.9);
          border-top: 1px solid var(--border);
          display: flex; align-items: center;
          padding: 0 4px; overflow-x: auto;
        }
        .lightbox-info-panel {
          width: 280px; background: var(--bg-secondary);
          border-left: 1px solid var(--border);
          display: flex; flex-direction: column; flex-shrink: 0;
        }
        .lightbox-info-handle { display: none; }
        .lightbox-mobile-bar { display: none; }
        .lightbox-close-btn { display: none; }
        .lightbox-close-desktop { display: flex; }
        .lightbox-nav-desktop { display: flex; }

        @media (max-width: 768px) {
          .lightbox-layout { flex-direction: column; }
          .lightbox-image-area { flex: 1; }
          .lightbox-nav-desktop { display: none !important; }
          .lightbox-close-btn { display: flex !important; }
          .lightbox-close-desktop { display: none !important; }

          .lightbox-info-panel {
            position: fixed; bottom: 0; left: 0; right: 0;
            width: 100%; height: auto; max-height: 70vh;
            border-left: none;
            border-top: 1px solid var(--border);
            border-radius: 16px 16px 0 0;
            transform: translateY(100%);
            transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
            z-index: 60;
          }
          .lightbox-info-panel.open { transform: translateY(0); }
          .lightbox-info-handle {
            display: flex; justify-content: center;
            padding: 10px 0 4px; cursor: pointer;
          }

          .lightbox-mobile-bar {
            display: flex; align-items: center; gap: 12;
            padding: 12px 16px;
            background: rgba(10,10,10,0.9);
            border-top: 1px solid var(--border);
            backdrop-filter: blur(8px);
          }

          .lightbox-strip { height: 56px; }
          .lightbox-strip button { width: 40px !important; height: 40px !important; }
        }
      `}</style>
    </div>
  );
}
