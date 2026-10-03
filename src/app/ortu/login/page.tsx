"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Lock,
  ArrowLeft,
  AlertCircle,
  Loader2,
  School,
  HeartHandshake,
  CheckCircle2,
  KeyRound,
  Sparkles,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function OrtuLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ortu/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login gagal");
      } else {
        router.push("/ortu/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "Koneksi ke server bermasalah");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (idVal: string) => {
    setIdentifier(idVal);
    setPassword("123456");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background: "var(--background)",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: "20px", right: "24px" }}>
        <ThemeToggle />
      </div>

      <div
        className="app-card"
        style={{
          maxWidth: "440px",
          width: "100%",
          padding: "32px 28px",
          position: "relative",
          borderRadius: "var(--radius-lg, 16px)",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={14} />
            Kamera Terminal
          </Link>

          <Link
            href="/login"
            style={{
              fontSize: "0.76rem",
              color: "var(--color-primary)",
              fontWeight: 600,
            }}
          >
            Portal Pengelola &rarr;
          </Link>
        </div>

        {/* Header Branding */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, var(--color-primary), #0284c7)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              boxShadow: "0 4px 12px rgba(14, 165, 233, 0.25)",
            }}
          >
            <HeartHandshake size={28} />
          </div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-main)" }}>
            Portal Wali Murid
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Pantau kehadiran, ajukan izin, dan perbarui nomor notifikasi WhatsApp ananda secara mandiri
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 14px",
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-danger)",
              fontSize: "0.82rem",
              marginBottom: "16px",
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
              No. WhatsApp atau NIS Anak
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Contoh: 081234567891 atau 2024002"
                className="form-input"
                style={{ paddingLeft: "34px", fontSize: "0.85rem" }}
              />
              <Users
                size={16}
                style={{
                  position: "absolute",
                  left: "11px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "3px" }}>
              Bisa memasukkan No. HP yang didaftarkan ke sekolah atau NIS siswa
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
              Password / PIN
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (default: 123456)"
                className="form-input"
                style={{ paddingLeft: "34px", fontSize: "0.85rem" }}
              />
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: "11px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{
              padding: "11px",
              marginTop: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontWeight: 700,
              fontSize: "0.88rem",
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Masuk ke Dashboard Orang Tua</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Access Card */}
        <div
          style={{
            marginTop: "20px",
            padding: "12px 14px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--bg-subtle)",
            border: "1px solid var(--border-app)",
            fontSize: "0.76rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, color: "var(--color-primary)", marginBottom: "6px" }}>
            <Sparkles size={14} />
            <span>Akun Contoh Siap Pakai (Password: 123456):</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            <button
              type="button"
              onClick={() => handleQuickFill("2024002")}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.74rem", padding: "3px 8px" }}
            >
              NIS 2024002 (Siti)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("081234567890")}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.74rem", padding: "3px 8px" }}
            >
              HP 081234567890 (Ahmad)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("ortumulti")}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "0.74rem", padding: "3px 8px" }}
            >
              ortumulti (2 Anak)
            </button>
          </div>
        </div>

        {/* Back Link */}
        <div style={{ marginTop: "18px", textAlign: "center" }}>
          <Link
            href="/cek-presensi"
            style={{
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              textDecoration: "underline",
            }}
          >
            Hanya ingin cek presensi cepat tanpa login? Klik di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
