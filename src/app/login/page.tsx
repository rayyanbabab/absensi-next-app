"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, ArrowLeft, AlertCircle, Loader2, School } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login gagal");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "Koneksi ke server bermasalah");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
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
          maxWidth: "400px",
          width: "100%",
          padding: "32px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
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
            href="/ortu/login"
            style={{
              fontSize: "0.78rem",
              color: "var(--color-primary)",
              fontWeight: 700,
            }}
          >
            Portal Orang Tua &rarr;
          </Link>
        </div>

        {/* Role Switcher Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4px",
            padding: "4px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--bg-subtle)",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              padding: "6px 10px",
              textAlign: "center",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--bg-surface)",
              fontWeight: 700,
              fontSize: "0.78rem",
              color: "var(--text-main)",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
            }}
          >
            Admin / Petugas
          </div>
          <Link
            href="/ortu/login"
            style={{
              padding: "6px 10px",
              textAlign: "center",
              borderRadius: "var(--radius-sm)",
              fontWeight: 500,
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              textDecoration: "none",
            }}
          >
            Wali Murid &rarr;
          </Link>
        </div>

        {/* Logo and title */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-primary)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            <School size={24} />
          </div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Portal Pengelola</h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "3px" }}>
            Autentikasi akun administrator dan petugas piket sekolah
          </p>
        </div>

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              borderRadius: "var(--radius-sm)",
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
            <label className="form-label">Username atau Email</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="superadmin"
                className="form-input"
                style={{ paddingLeft: "32px", fontSize: "0.85rem" }}
              />
              <User
                size={15}
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Kata Sandi</label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: "32px", fontSize: "0.85rem" }}
              />
              <Lock
                size={15}
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ width: "100%", padding: "10px", marginTop: "6px", justifyContent: "center" }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Memvalidasi...</span>
              </>
            ) : (
              "Masuk ke Sistem"
            )}
          </button>
        </form>

        {/* Credentials hint */}
        <div
          style={{
            marginTop: "20px",
            padding: "10px 12px",
            background: "var(--bg-sunken)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-app)",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            textAlign: "center",
          }}
        >
          <div>Akun bawaan sistem:</div>
          <div style={{ color: "var(--text-main)", fontWeight: 600, marginTop: "2px" }}>
            Username: <code style={{ fontFamily: "var(--font-mono)" }}>superadmin</code> &bull; Password: <code style={{ fontFamily: "var(--font-mono)" }}>superadmin</code>
          </div>
        </div>
      </div>
    </div>
  );
}
