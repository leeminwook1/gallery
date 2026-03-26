"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { GalleryImage } from "@/types";

export default function ExhibitionPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/images")
      .then((r) => r.json())
      .then((d) => { setImages(d.images || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Track which slide is in view
  useEffect(() => {
    const container = containerRef.current;
    if (!container || images.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-idx"));
            if (!isNaN(idx)) setActiveIdx(idx);
          }
        });
      },
      { root: container, threshold: 0.6 }
    );

    container.querySelectorAll("[data-idx]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [images]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#050505",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <span className="spinner" style={{ width: 28, height: 28 }} />
          <p style={{ marginTop: 16, fontSize: 13, color: "var(--text-muted)" }}>작품을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div style={{
        minHeight: "100vh", background: "#050505",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: 20, textAlign: "center",
      }}>
        <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: 24, marginBottom: 8 }}>
          전시할 작품이 없습니다
        </h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: 14 }}>
          메인 페이지에서 작품을 등록해주세요.
        </p>
        <Link href="/" className="btn-gold" style={{ padding: "10px 24px", fontSize: 13, textDecoration: "none" }}>
          메인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: "#050505", minHeight: "100vh" }}>
      {/* Fixed top bar */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px",
        background: "linear-gradient(to bottom, rgba(5,5,5,0.9) 0%, transparent 100%)",
        pointerEvents: "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, pointerEvents: "auto" }}>
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: 8,
            textDecoration: "none", color: "rgba(255,255,255,0.5)",
            fontSize: 13, transition: "color 0.2s",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            돌아가기
          </Link>
        </div>
        <div style={{
          fontFamily: "var(--font-playfair), serif",
          fontSize: 14, letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.35)",
          pointerEvents: "auto",
        }}>
          LUMIÈRE
        </div>
        <div style={{
          fontSize: 12, color: "rgba(255,255,255,0.3)",
          pointerEvents: "auto",
        }}>
          {activeIdx + 1} / {images.length}
        </div>
      </header>

      {/* Side progress dots — desktop */}
      <div className="exhibition-dots" style={{
        position: "fixed", right: 20, top: "50%", transform: "translateY(-50%)",
        zIndex: 40, display: "flex", flexDirection: "column", gap: 8,
      }}>
        {images.map((_, i) => (
          <button key={i}
            onClick={() => {
              containerRef.current?.children[i]?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              width: i === activeIdx ? 4 : 4,
              height: i === activeIdx ? 20 : 8,
              borderRadius: 3,
              background: i === activeIdx ? "var(--gold)" : "rgba(255,255,255,0.2)",
              border: "none", cursor: "pointer", padding: 0,
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>

      {/* Scroll-snap container */}
      <div
        ref={containerRef}
        style={{
          height: "100vh", overflowY: "auto",
          scrollSnapType: "y mandatory",
          scrollBehavior: "smooth",
        }}
        className="hide-scrollbar"
      >
        {images.map((img, i) => (
          <ExhibitionSlide key={img.id} image={img} index={i} total={images.length} />
        ))}

        {/* End card */}
        <div
          style={{
            height: "100vh",
            scrollSnapAlign: "start",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: 40, textAlign: "center",
          }}
        >
          <div style={{
            width: 48, height: 1,
            background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
            marginBottom: 24,
          }} />
          <p style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: "clamp(22px, 4vw, 36px)",
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: 10,
          }}>
            감사합니다
          </p>
          <p style={{
            fontSize: 14, color: "var(--text-muted)",
            lineHeight: 1.8, maxWidth: 360,
            marginBottom: 32,
          }}>
            총 {images.length}점의 작품을 감상해 주셨습니다.
          </p>
          <Link href="/" className="btn-ghost"
            style={{ padding: "10px 24px", fontSize: 13, textDecoration: "none", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            메인으로
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .exhibition-dots { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Individual Slide ───
function ExhibitionSlide({ image, index, total }: {
  image: GalleryImage; index: number; total: number;
}) {
  const [loaded, setLoaded] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = slideRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={slideRef}
      data-idx={index}
      style={{
        height: "100vh",
        scrollSnapAlign: "start",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: "60px 20px 40px",
      }}
    >
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxWidth: 900,
        width: "100%",
        gap: 0,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
      }}>
        {/* Image frame */}
        <div style={{
          position: "relative",
          maxHeight: "62vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 0,
        }}>
          {!loaded && (
            <div style={{
              position: "absolute",
              width: "60%", paddingBottom: "40%",
              borderRadius: 4,
            }} className="skeleton" />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/uploads/${image.filename}`}
            alt={image.title}
            loading={index < 2 ? "eager" : "lazy"}
            onLoad={() => setLoaded(true)}
            style={{
              maxWidth: "100%",
              maxHeight: "62vh",
              objectFit: "contain",
              opacity: loaded ? 1 : 0,
              transition: "opacity 0.5s ease",
              borderRadius: 2,
              boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
            }}
          />
        </div>

        {/* Museum label */}
        <div style={{
          marginTop: 28,
          textAlign: "center",
          maxWidth: 500,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
        }}>
          <h2 style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: "clamp(18px, 3vw, 28px)",
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: 6,
            lineHeight: 1.3,
          }}>
            {image.title}
          </h2>
          <p style={{
            fontSize: 13, color: "var(--text-secondary)",
            marginBottom: 4,
          }}>
            {image.artist}
            {image.year && <span style={{ color: "var(--text-muted)" }}> · {image.year}</span>}
          </p>
          {image.description && (
            <p style={{
              fontSize: 13, color: "var(--text-muted)",
              lineHeight: 1.8, marginTop: 12,
              maxWidth: 400, margin: "12px auto 0",
            }}>
              {image.description}
            </p>
          )}

          {/* Divider */}
          <div style={{
            width: 32, height: 1,
            background: "rgba(196,162,101,0.3)",
            margin: "16px auto 0",
          }} />

          {/* Index */}
          <p style={{
            fontSize: 10, color: "var(--text-muted)", marginTop: 10,
            letterSpacing: "0.15em", textTransform: "uppercase",
            opacity: 0.5,
          }}>
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
        </div>
      </div>

      {/* Scroll hint on first slide */}
      {index === 0 && (
        <div style={{
          position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          animation: "pulse 2s ease infinite",
        }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
            SCROLL
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      )}
    </div>
  );
}
