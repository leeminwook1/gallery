"use client";

import { useState } from "react";
import { GalleryImage, CATEGORIES } from "@/types";

interface EditModalProps {
  image: GalleryImage;
  onClose: () => void;
  onSave: (updated: GalleryImage) => void;
}

export default function EditModal({ image, onClose, onSave }: EditModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: image.title,
    artist: image.artist,
    year: image.year,
    description: image.description,
    category: image.category,
  });

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
    letterSpacing: "0.08em", textTransform: "uppercase",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("작품명을 입력해주세요."); return; }
    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/images/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: image.id, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "수정 실패");
      onSave(data.image);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "수정에 실패했습니다.");
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay fixed inset-0 z-[60] flex items-center justify-center"
      style={{ padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="animate-scale-in" style={{
        width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto",
        borderRadius: 16, background: "var(--bg-secondary)",
        border: "1px solid var(--border)", boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 22px", borderBottom: "1px solid var(--border)",
          position: "sticky", top: 0, background: "var(--bg-secondary)", zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 8, overflow: "hidden", flexShrink: 0,
              background: "var(--bg-card)",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/uploads/${image.filename}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: 18, fontWeight: 600 }}>작품 수정</h2>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>정보를 변경합니다</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: 6, borderRadius: 8, lineHeight: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px 22px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>작품명 *</label>
            <input type="text" value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
          </div>

          <div className="edit-form-row">
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              <label style={labelStyle}>작가명</label>
              <input type="text" value={form.artist}
                onChange={(e) => setForm((p) => ({ ...p, artist: e.target.value }))} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              <label style={labelStyle}>제작 연도</label>
              <input type="number" value={form.year} min="1800" max={new Date().getFullYear()}
                onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>카테고리</label>
            <div className="filter-scroll">
              {CATEGORIES.filter((c) => c !== "전체").map((cat) => (
                <button key={cat} type="button"
                  onClick={() => setForm((p) => ({ ...p, category: cat }))}
                  style={{
                    padding: "5px 13px", borderRadius: 16, fontSize: 12, fontWeight: 500,
                    cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0,
                    background: form.category === cat ? "var(--gold)" : "var(--bg-card)",
                    color: form.category === cat ? "#0A0A0A" : "var(--text-secondary)",
                    border: `1px solid ${form.category === cat ? "var(--gold)" : "var(--border)"}`,
                  }}>{cat}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>작품 설명</label>
            <textarea value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3} style={{ resize: "vertical" }} />
          </div>

          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: 8,
              background: "var(--danger-light)", border: "1px solid rgba(214,69,69,0.25)",
              color: "var(--danger)", fontSize: 13,
            }}>{error}</div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onClose} className="btn-ghost"
              disabled={saving} style={{ flex: 1, padding: "11px 0", fontSize: 13 }}>취소</button>
            <button type="submit" className="btn-gold" disabled={saving}
              style={{ flex: 1, padding: "11px 0", fontSize: 13, gap: 6 }}>
              {saving ? <><span className="spinner" style={{ width: 14, height: 14 }} /> 저장 중...</> : "변경사항 저장"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .edit-form-row { display: flex; gap: 12; }
        @media (max-width: 480px) { .edit-form-row { flex-direction: column; } }
      `}</style>
    </div>
  );
}
