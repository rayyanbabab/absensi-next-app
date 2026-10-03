"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  School,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowLeft,
  FileEdit,
  Loader2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Siswa, PresensiSiswa } from "@/lib/types";

export default function CekPresensiPage() {
  const [nis, setNis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    siswa: Siswa;
    stats: {
      total: number;
      hadir: number;
      sakit: number;
      izin: number;
      alfa: number;
      persentase: number;
    };
    records: PresensiSiswa[];
  } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nis.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/cek-presensi?nis=${encodeURIComponent(nis.trim())}`);
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "Data siswa tidak ditemukan.");
      }
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat memeriksa data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-app)", color: "var(--text-main)" }}>
      {/* Top Navbar */}
      <header
        style={{
          borderBottom: "1px solid var(--border-app)",
          backgroundColor: "var(--bg-surface)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: "960px",
            margin: "0 auto",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--text-main)",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "0.95rem",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--color-primary)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <School size={16} />
            </div>
            <span>Portal Siswa & Orang Tua</span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link
              href="/izin"
              className="btn btn-secondary btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <FileEdit size={13} />
              <span>Ajukan Izin</span>
            </Link>
            <Link
              href="/"
              className="btn btn-secondary btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <ArrowLeft size={13} />
              <span>Terminal Scan</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "28px 20px" }}>
        {/* Search Hero Card */}
        <div
          className="app-card"
          style={{
            padding: "28px 24px",
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-main)" }}>
            Cek Kehadiran Siswa Mandiri
          </h1>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              marginTop: "4px",
              marginBottom: "20px",
              maxWidth: "520px",
              marginInline: "auto",
            }}
          >
            Masukkan Nomor Induk Siswa (NIS) untuk melihat rekap kehadiran, persentase absensi, dan jam pemindaian secara transparan.
          </p>

          <form
            onSubmit={handleSearch}
            style={{
              display: "flex",
              gap: "8px",
              maxWidth: "460px",
              margin: "0 auto",
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative", flex: "1 1 240px" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                required
                placeholder="Contoh: 2024001"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                className="form-input"
                style={{
                  paddingLeft: "36px",
                  fontSize: "0.9rem",
                  height: "42px",
                  fontFamily: "var(--font-mono)",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ height: "42px", padding: "0 22px", fontSize: "0.88rem" }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Memeriksa...</span>
                </>
              ) : (
                "Cari Data"
              )}
            </button>
          </form>

          {/* Quick suggestions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              marginTop: "14px",
              fontSize: "0.76rem",
              color: "var(--text-muted)",
            }}
          >
            <span>Coba NIS contoh:</span>
            {["2024001", "2024002", "2024003"].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setNis(sample);
                }}
                style={{
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border-app)",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  cursor: "pointer",
                  color: "var(--color-primary)",
                  fontWeight: 600,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 18px",
              borderRadius: "var(--radius-md)",
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "var(--color-danger)",
              fontSize: "0.85rem",
              marginBottom: "20px",
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Attendance Profile & History Result */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Student Profile Card */}
            <div
              className="app-card"
              style={{
                padding: "20px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div>
                <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--color-primary)", textTransform: "uppercase" }}>
                  Profil Siswa Terdaftar
                </div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginTop: "2px", color: "var(--text-main)" }}>
                  {result.siswa.namaSiswa}
                </h2>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "3px" }}>
                  NIS: <strong style={{ fontFamily: "var(--font-mono)", color: "var(--text-main)" }}>{result.siswa.nis}</strong> &bull; Kelas: <strong>{result.siswa.kelas || "-"}</strong> ({result.siswa.jurusan || "-"})
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-subtle)",
                  border: "1px solid var(--border-app)",
                }}
              >
                <TrendingUp size={20} style={{ color: "var(--color-success)" }} />
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Rasio Presensi</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-success)" }}>
                    {result.stats.persentase}%
                  </div>
                </div>
              </div>
            </div>

            {/* Metric Summary Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: "12px",
              }}
            >
              <div className="app-card" style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--text-muted)" }}>Hadir</span>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-success)" }} />
                </div>
                <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--color-success)", marginTop: "4px" }}>
                  {result.stats.hadir}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Hari masuk tepat waktu
                </div>
              </div>

              <div className="app-card" style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--text-muted)" }}>Izin</span>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-primary)" }} />
                </div>
                <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--color-primary)", marginTop: "4px" }}>
                  {result.stats.izin}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Dispensasi sekolah
                </div>
              </div>

              <div className="app-card" style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--text-muted)" }}>Sakit</span>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-warning)" }} />
                </div>
                <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--color-warning)", marginTop: "4px" }}>
                  {result.stats.sakit}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Keterangan dokter
                </div>
              </div>

              <div className="app-card" style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--text-muted)" }}>Alfa</span>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-danger)" }} />
                </div>
                <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--color-danger)", marginTop: "4px" }}>
                  {result.stats.alfa}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Tanpa keterangan
                </div>
              </div>
            </div>

            {/* Attendance History Table Card */}
            <div className="app-card" style={{ padding: 0, overflow: "hidden" }}>
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--border-app)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "var(--bg-surface)",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                  Riwayat Presensi Harian
                </div>
                <span className="status-badge status-badge-neutral" style={{ fontSize: "0.74rem" }}>
                  {result.records.length} Catatan
                </span>
              </div>

              {result.records.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  Belum ada rekaman presensi yang tersimpan untuk siswa ini.
                </div>
              ) : (
                <div className="table-container">
                  <table className="app-table">
                    <thead>
                      <tr>
                        <th style={{ width: "45px" }}>No</th>
                        <th>Tanggal</th>
                        <th>Jam Masuk</th>
                        <th>Jam Pulang</th>
                        <th>Status</th>
                        <th>Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.records.map((r, idx) => (
                        <tr key={r.id || idx}>
                          <td style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{idx + 1}</td>
                          <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>
                            {r.tanggal}
                          </td>
                          <td style={{ fontFamily: "var(--font-mono)", color: "var(--color-success)", fontWeight: 600 }}>
                            {r.jamMasuk || "-"}
                          </td>
                          <td style={{ fontFamily: "var(--font-mono)", color: "var(--color-warning)", fontWeight: 600 }}>
                            {r.jamKeluar || "-"}
                          </td>
                          <td>
                            <span
                              className={
                                r.idKehadiran === 1
                                  ? "status-badge status-badge-success"
                                  : r.idKehadiran === 4
                                  ? "status-badge status-badge-danger"
                                  : "status-badge status-badge-warning"
                              }
                            >
                              {r.kehadiran || "Hadir"}
                            </span>
                          </td>
                          <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            {r.keterangan || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick action to submit leave */}
            <div
              className="app-card"
              style={{
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "var(--bg-sunken)",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>
                  Tidak bisa hadir ke sekolah hari ini?
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Ajukan surat izin atau surat keterangan dokter secara online langsung ke pihak sekolah.
                </div>
              </div>
              <Link
                href={`/izin?nis=${encodeURIComponent(result.siswa.nis)}`}
                className="btn btn-primary btn-sm"
              >
                <FileEdit size={14} />
                <span>Buat Pengajuan Izin</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
