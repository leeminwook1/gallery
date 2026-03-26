"use client";

import { useState, useRef, useCallback } from "react";
import { GalleryImage, CATEGORIES } from "@/types";

interface UploadModalProps {
  onClose: () => void;
  onUpload: (image: GalleryImage) => void;
}

export default function UploadModal({ onClose, onUpload }: UploadModalProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    artist: "",
    year: new Date().getFullYear().toString(),
    description: "",
    category: "기타",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(file.type)) { setError("JPG, PNG, GIF, WEBP만 가능합니다."); return; }
    if (file.size > 20 * 1024 * 1024) { setError("20MB 이하만 가능합니다."); return; }
    setError(null);
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    if (!form.title) setForm((p) => ({ ...p, title: file.name.replace(/\.[^/.]+$/, "") }));
  }, [form.title]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) { setError("이미지를 선택해주세요."); return; }
    setUploading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("title", form.title || selectedFile.name);
      fd.append("artist", form.artist || "작가 미상");
      fd.append("year", form.year);
      fd.append("description", form.description);
      fd.append("category", form.category);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onUpload(data.image);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 실패");
    } finally { setUploading(false); }
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
    letterSpacing: "0.08em", textTransform: "uppercase",
  };

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center"
      style={{ padding: "16px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="animate-scale-in"
        style={{
          width: "100%", maxWidth: 560,
          maxHeight: "92vh", overflowY: "auto",
          borderRadius: 16,
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: "1px solid var(--border)",
          position: "sticky", top: 0, background: "var(--bg-secondary)", zIndex: 1,
        }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: 20, fontWeight: 600 }}>
              작품 등록
            </h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              전시회에 새 작품을 추가합니다
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: 6, borderRadius: 8, lineHeight: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Upload zone */}
          <div
            className={`upload-zone ${dragOver ? "drag-over" : ""}`}
            style={{ borderRadius: 12, minHeight: 160, display: "flex", alignItems: "center", justifyContent: "center" }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              style={{ display: "none" }}
            />
            {preview ? (
              <div style={{ position: "relative", width: "100%", padding: "16px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="preview"
                  style={{ width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 8 }}
                />
                <div style={{
                  position: "absolute", bottom: 24, right: 24,
                  background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
                  borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#fff",
                }}>
                  클릭하여 변경
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "24px 16px" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 10,
                  background: "rgba(196,162,101,0.08)", border: "1px solid rgba(196,162,101,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p style={{ fontSize: 14, fontWeight: 500, textAlign: "center" }}>
                  이미지를 드래그하거나 탭하여 업로드
                </p>
                <p style={{ fontSize: 11, color: "var(--text-muted)" }}>JPG, PNG, GIF, WEBP · 최대 20MB</p>
              </div>
            )}
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>작품명 *</label>
              <input type="text" placeholder="작품 제목" value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
            </div>

            <div className="form-row">
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                <label style={labelStyle}>작가명</label>
                <input type="text" placeholder="작가 이름" value={form.artist}
                  onChange={(e) => setForm((p) => ({ ...p, artist: e.target.value }))} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                <label style={labelStyle}>제작 연도</label>
                <input type="number" placeholder="YYYY" value={form.year}
                  min="1800" max={new Date().getFullYear()}
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
                      padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                      cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0,
                      background: form.category === cat ? "var(--gold)" : "var(--bg-card)",
                      color: form.category === cat ? "#0A0A0A" : "var(--text-secondary)",
                      border: `1px solid ${form.category === cat ? "var(--gold)" : "var(--border)"}`,
                    }}
                  >{cat}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>작품 설명</label>
              <textarea placeholder="작품에 대한 설명 (선택)" value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={3} style={{ resize: "vertical" }} />
            </div>
          </div>

          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: 8,
              background: "var(--danger-light)", border: "1px solid rgba(214,69,69,0.25)",
              color: "var(--danger)", fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onClose} className="btn-ghost"
              disabled={uploading} style={{ flex: 1, padding: "12px 0", fontSize: 13 }}>
              취소
            </button>
            <button type="submit" className="btn-gold"
              disabled={uploading || !selectedFile}
              style={{ flex: 1, padding: "12px 0", fontSize: 13, gap: 6 }}>
              {uploading ? (
                <><span className="spinner" style={{ width: 14, height: 14 }} /> 업로드 중...</>
              ) : "작품 등록"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .form-row { display: flex; gap: 12; }
        @media (max-width: 480px) { .form-row { flex-direction: column; } }
      `}</style>
    </div>
  );
}
