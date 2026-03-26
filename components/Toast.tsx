"use client";

import { useEffect, useState } from "react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const ICONS = {
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

const COLORS = {
  success: { bg: "rgba(39,174,96,0.12)", border: "rgba(39,174,96,0.3)", color: "#2ECC71" },
  error: { bg: "rgba(192,57,43,0.12)", border: "rgba(192,57,43,0.3)", color: "#E74C3C" },
  info: { bg: "rgba(181,149,109,0.12)", border: "rgba(181,149,109,0.3)", color: "var(--gold)" },
};

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: () => void }) {
  const [show, setShow] = useState(false);
  const c = COLORS[toast.type];

  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 10);
    const t2 = setTimeout(() => { setShow(false); setTimeout(onRemove, 300); }, 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onRemove]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        borderRadius: 10,
        background: c.bg,
        border: `1px solid ${c.border}`,
        backdropFilter: "blur(16px)",
        color: c.color,
        fontSize: 13,
        fontWeight: 500,
        minWidth: 240,
        maxWidth: 360,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        opacity: show ? 1 : 0,
        transform: show ? "translateX(0)" : "translateX(24px)",
        cursor: "pointer",
      }}
      onClick={onRemove}
    >
      {ICONS[toast.type]}
      <span style={{ color: "var(--text-primary)", flex: 1 }}>{toast.message}</span>
    </div>
  );
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  if (toasts.length === 0) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "flex-end",
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={() => onRemove(t.id)} />
      ))}
    </div>
  );
}
