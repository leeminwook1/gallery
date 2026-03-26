"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ImageCard from "@/components/ImageCard";
import UploadModal from "@/components/UploadModal";
import LightboxModal from "@/components/LightboxModal";
import SlideshowMode from "@/components/SlideshowMode";
import Toast, { ToastMessage } from "@/components/Toast";
import Confetti from "@/components/Confetti";
import { GalleryImage, CATEGORIES, Category } from "@/types";

type ViewMode = "grid" | "masonry" | "list";
type SortMode = "newest" | "oldest" | "title" | "artist";

export default function HomePage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>("전체");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [search, setSearch] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confetti, setConfetti] = useState(false);
  const [likedOnly, setLikedOnly] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [showBackToTop, setShowBackToTop] = useState(false);

  const addToast = useCallback((type: ToastMessage["type"], message: string) => {
    setToasts((p) => [...p, { id: Date.now().toString(), type, message }]);
  }, []);
  const removeToast = useCallback((id: string) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  // Liked sync
  useEffect(() => {
    const sync = () => {
      try { const r = localStorage.getItem("gallery_likes"); setLikedIds(r ? new Set(JSON.parse(r)) : new Set()); }
      catch { setLikedIds(new Set()); }
    };
    sync();
    const i = setInterval(sync, 400);
    window.addEventListener("storage", sync);
    return () => { clearInterval(i); window.removeEventListener("storage", sync); };
  }, []);

  // Back to top button
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/images").then((r) => r.json()).then((d) => { setImages(d.images || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filteredImages = useMemo(() => {
    let result = [...images];
    if (activeCategory !== "전체") result = result.filter((i) => i.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.title.toLowerCase().includes(q) || i.artist.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      switch (sortMode) {
        case "newest": return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case "oldest": return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        case "title": return a.title.localeCompare(b.title, "ko");
        case "artist": return a.artist.localeCompare(b.artist, "ko");
        default: return 0;
      }
    });
    if (likedOnly) result = result.filter((i) => likedIds.has(i.id));
    return result;
  }, [images, activeCategory, search, sortMode, likedOnly, likedIds]);

  // Category stats
  const catStats = useMemo(() => {
    const m: Record<string, number> = {};
    images.forEach((i) => { m[i.category] = (m[i.category] || 0) + 1; });
    return m;
  }, [images]);

  const handleUpload = (image: GalleryImage) => {
    setImages((p) => [image, ...p]);
    setConfetti(true);
    setTimeout(() => setConfetti(false), 100);
    addToast("success", `"${image.title}" 등록 완료!`);
  };

  const handleDelete = (id: string) => {
    const img = images.find((i) => i.id === id);
    setImages((p) => p.filter((i) => i.id !== id));
    if (lightboxImage?.id === id) setLightboxImage(null);
    if (img) addToast("info", `"${img.title}" 삭제됨`);
  };

  const handleEdit = (updated: GalleryImage) => {
    setImages((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    if (lightboxImage?.id === updated.id) setLightboxImage(updated);
    addToast("success", `"${updated.title}" 수정 완료`);
  };

  const handleRandom = () => {
    if (filteredImages.length === 0) return;
    const rand = filteredImages[Math.floor(Math.random() * filteredImages.length)];
    setLightboxImage(rand);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar onUploadClick={() => setShowUpload(true)} imageCount={images.length} />

      {/* ─── Hero ─── */}
      <section style={{ paddingTop: 100, paddingBottom: 48, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: 600, height: 400,
          background: "radial-gradient(ellipse, rgba(196,162,101,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ height: 1, width: 32, background: "var(--gold)", opacity: 0.4 }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--gold)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Online Exhibition
            </span>
            <div style={{ height: 1, width: 32, background: "var(--gold)", opacity: 0.4 }} />
          </div>

          <h1 style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: "clamp(26px, 5vw, 52px)",
            fontWeight: 600, lineHeight: 1.2, marginBottom: 16,
          }}>
            <span>당신의 작품을 </span>
            <em className="text-gold-gradient" style={{ fontStyle: "italic", fontFamily: "var(--font-playfair), serif" }}>
              세상과 나누다
            </em>
          </h1>

          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.9, maxWidth: 420, margin: "0 auto 28px" }}>
            모든 이미지는 하나의 이야기를 담고 있습니다.
            <br />이곳에서 당신의 시선을 전시하세요.
          </p>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setShowUpload(true)} className="btn-gold"
              style={{ padding: "10px 24px", fontSize: 13, gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              작품 등록
            </button>
            {images.length > 0 && (
              <>
                <button onClick={() => setSlideshowActive(true)} className="btn-ghost"
                  style={{ padding: "10px 20px", fontSize: 13, gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21" /></svg>
                  슬라이드쇼
                </button>
                <Link href="/exhibition" className="btn-ghost"
                  style={{ padding: "10px 20px", fontSize: 13, gap: 6, textDecoration: "none" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                  전시회
                </Link>
                <button onClick={handleRandom} className="btn-ghost"
                  style={{ padding: "10px 20px", fontSize: 13, gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
                    <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
                    <line x1="4" y1="4" x2="9" y2="9" />
                  </svg>
                  랜덤
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── Stats (only when images exist) ─── */}
      {images.length > 0 && (
        <section style={{ maxWidth: 700, margin: "0 auto 8px", padding: "0 20px" }}>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "16px 20px",
            display: "flex", gap: 16, overflowX: "auto",
          }} className="hide-scrollbar">
            {Object.entries(catStats).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
              const pct = Math.round((count / images.length) * 100);
              return (
                <button key={cat}
                  onClick={() => { setActiveCategory(cat as Category); window.scrollTo({ top: document.getElementById("gallery")?.offsetTop ?? 500, behavior: "smooth" }); }}
                  style={{
                    display: "flex", flexDirection: "column", gap: 6,
                    minWidth: 80, flexShrink: 0, cursor: "pointer",
                    background: "none", border: "none", color: "inherit", textAlign: "left",
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>{cat}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{count}</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: "var(--border)", width: "100%" }}>
                    <div className="stat-bar-fill" style={{ height: "100%", width: `${pct}%`, background: "var(--gold)" }} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, var(--border), transparent)", margin: "20px 24px" }} />

      {/* ─── Gallery ─── */}
      <section id="gallery" style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 20px 40px" }}>
        {/* Toolbar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {/* Search */}
          <div style={{ position: "relative", maxWidth: 400 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input type="text" placeholder="검색..." value={search}
              onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36, fontSize: 13 }} />
          </div>

          {/* Categories + controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="filter-scroll">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: "5px 14px", borderRadius: 16, fontSize: 12, fontWeight: 500,
                    cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0,
                    background: activeCategory === cat ? "var(--gold)" : "var(--bg-card)",
                    color: activeCategory === cat ? "#0A0A0A" : "var(--text-secondary)",
                    border: `1px solid ${activeCategory === cat ? "var(--gold)" : "var(--border)"}`,
                  }}>{cat}{catStats[cat] && cat !== "전체" ? ` ${catStats[cat]}` : ""}</button>
              ))}
              {/* Like filter */}
              <button onClick={() => setLikedOnly((p) => !p)}
                style={{
                  padding: "5px 14px", borderRadius: 16, fontSize: 12, fontWeight: 500,
                  cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0,
                  display: "flex", alignItems: "center", gap: 4,
                  background: likedOnly ? "var(--danger-light)" : "var(--bg-card)",
                  color: likedOnly ? "var(--danger)" : "var(--text-secondary)",
                  border: `1px solid ${likedOnly ? "rgba(214,69,69,0.35)" : "var(--border)"}`,
                }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill={likedOnly ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {likedIds.size > 0 ? likedIds.size : ""}
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {search || activeCategory !== "전체" || likedOnly ? (
                  <><span style={{ color: "var(--gold)", fontWeight: 600 }}>{filteredImages.length}</span> 결과
                    {search && ` · "${search}"`}
                    {(search || activeCategory !== "전체" || likedOnly) && (
                      <button onClick={() => { setSearch(""); setActiveCategory("전체"); setLikedOnly(false); }}
                        style={{ marginLeft: 8, fontSize: 11, color: "var(--text-muted)", background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>
                        초기화
                      </button>
                    )}
                  </>
                ) : (
                  <><span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{images.length}</span> 작품</>
                )}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)}
                  style={{ width: "auto", padding: "5px 10px", fontSize: 12 }}>
                  <option value="newest">최신순</option>
                  <option value="oldest">오래된순</option>
                  <option value="title">제목순</option>
                  <option value="artist">작가순</option>
                </select>

                <div style={{
                  display: "flex", gap: 1, background: "var(--bg-card)",
                  border: "1px solid var(--border)", borderRadius: 6, padding: 2,
                }}>
                  {(["grid", "list"] as ViewMode[]).map((mode) => (
                    <button key={mode} onClick={() => setViewMode(mode)}
                      style={{
                        width: 28, height: 28, borderRadius: 4,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: viewMode === mode ? "var(--border-hover)" : "transparent",
                        color: viewMode === mode ? "var(--text-primary)" : "var(--text-muted)",
                        cursor: "pointer", border: "none", transition: "all 0.15s",
                      }}>
                      {mode === "grid" ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" />
                          <rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" />
                        </svg>
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        {loading ? (
          <div className="gallery-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ borderRadius: "var(--radius)", overflow: "hidden", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="skeleton" style={{ paddingBottom: "68%" }} />
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="skeleton" style={{ height: 16, borderRadius: 4, width: "65%" }} />
                  <div className="skeleton" style={{ height: 12, borderRadius: 4, width: "40%" }} />
                  <div className="skeleton" style={{ height: 10, borderRadius: 4, width: "50%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredImages.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "64px 20px", textAlign: "center",
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 18,
              background: "var(--bg-card)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18,
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <h3 style={{ fontFamily: "var(--font-playfair), serif", fontSize: 20, fontWeight: 600, marginBottom: 6 }}>
              {search || activeCategory !== "전체" || likedOnly ? "검색 결과가 없습니다" : "아직 작품이 없습니다"}
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.7 }}>
              {search || activeCategory !== "전체" || likedOnly
                ? "다른 키워드로 검색하거나 필터를 초기화해보세요."
                : "첫 번째 작품을 등록하여 전시회를 시작하세요."}
            </p>
            {!search && activeCategory === "전체" && !likedOnly && (
              <button onClick={() => setShowUpload(true)} className="btn-gold"
                style={{ padding: "10px 20px", fontSize: 13 }}>+ 첫 작품 등록</button>
            )}
          </div>
        ) : viewMode === "list" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredImages.map((img, i) => (
              <ListItem key={img.id} image={img} index={i}
                onClick={() => setLightboxImage(img)} />
            ))}
          </div>
        ) : (
          <div className="gallery-grid">
            {filteredImages.map((img, i) => (
              <ImageCard key={img.id} image={img} index={i}
                onClick={setLightboxImage} />
            ))}
          </div>
        )}
      </section>

      {/* ─── Footer ─── */}
      <footer style={{
        marginTop: 40, borderTop: "1px solid var(--border)",
        padding: "36px 20px", textAlign: "center",
      }}>
        <p style={{ fontFamily: "var(--font-playfair), serif", fontSize: 16, letterSpacing: "0.12em", color: "var(--text-muted)", marginBottom: 4 }}>
          LUMIÈRE
        </p>
        <p style={{ fontSize: 11, color: "var(--text-muted)", opacity: 0.4 }}>
          온라인 전시회 · {new Date().getFullYear()}
        </p>
      </footer>

      {/* ─── Back to top ─── */}
      {showBackToTop && (
        <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}

      {/* ─── Modals ─── */}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUpload={handleUpload} />}
      {lightboxImage && (
        <LightboxModal image={lightboxImage} images={filteredImages}
          onClose={() => setLightboxImage(null)} onNavigate={setLightboxImage}
          onDelete={handleDelete} onEdit={handleEdit} />
      )}
      {slideshowActive && filteredImages.length > 0 && (
        <SlideshowMode images={filteredImages} startIndex={0} onClose={() => setSlideshowActive(false)} />
      )}
      <Toast toasts={toasts} onRemove={removeToast} />
      <Confetti active={confetti} />

      <style>{`
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }
        @media (max-width: 640px) {
          .gallery-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 10px;
          }
        }
        @media (max-width: 360px) {
          .gallery-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

// ─── List Item ───
function ListItem({ image, index, onClick }: {
  image: GalleryImage; index: number; onClick: () => void;
}) {
  return (
    <div className="animate-fade-in" onClick={onClick}
      style={{
        animationDelay: `${Math.min(index * 30, 200)}ms`, animationFillMode: "both", opacity: 0,
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 14px", borderRadius: 10,
        background: "var(--bg-card)", border: "1px solid var(--border)",
        cursor: "pointer", transition: "border-color 0.2s",
      }}>
      <div style={{
        width: 52, height: 52, borderRadius: 7, overflow: "hidden", flexShrink: 0,
        background: "var(--bg-secondary)",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/uploads/${image.filename}`} alt={image.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <h3 style={{
            fontSize: 14, fontWeight: 600, fontFamily: "var(--font-playfair), serif",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{image.title}</h3>
          <span className="tag" style={{ flexShrink: 0 }}>{image.category}</span>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{image.artist} · {image.year}</p>
      </div>
      {/* Arrow icon to indicate clickable */}
      <div style={{ flexShrink: 0, color: "var(--text-muted)" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  );
}
