"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  School,
  ArrowLeft,
  Calendar,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCheck,
} from "lucide-react";

function FormPengajuanIzin() {
  const searchParams = useSearchParams();
  const initialNis = searchParams.get("nis") || "";

  const [nis, setNis] = useState(initialNis);
  const [verifyingNis, setVerifyingNis] = useState(false);
  const [studentInfo, setStudentInfo] = useState<{
    namaSiswa: string;
    kelas: string;
    jurusan: string;
  } | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const [tipe, setTipe] = useState<"Sakit" | "Izin">("Sakit");
  const [tanggalMulai, setTanggalMulai] = useState(today);
  const [tanggalSelesai, setTanggalSelesai] = useState(today);
  const [alasan, setAlasan] = useState("");
  const [lampiranUrl, setLampiranUrl] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto verify NIS
  const verifyStudent = async (nisToVerify: string) => {
    if (!nisToVerify.trim()) {
      setStudentInfo(null);
      return;
    }
    setVerifyingNis(true);
    setError(null);
    try {
      const res = await fetch(`/api/cek-presensi?nis=${encodeURIComponent(nisToVerify.trim())}`);
      const data = await res.json();
      if (res.ok && data.siswa) {
        setStudentInfo({
          namaSiswa: data.siswa.namaSiswa,
          kelas: data.siswa.kelas || "-",
          jurusan: data.siswa.jurusan || "-",
        });
      } else {
        setStudentInfo(null);
        setError("Siswa dengan NIS tersebut tidak terdaftar di sistem sekolah.");
      }
    } catch {
      setStudentInfo(null);
    } finally {
      setVerifyingNis(false);
    }
  };

  useEffect(() => {
    if (initialNis) {
      verifyStudent(initialNis);
    }
  }, [initialNis]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimal 2 MB!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      setLampiranUrl(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentInfo) {
      setError("Silakan masukkan NIS yang valid dan pastikan data siswa terverifikasi.");
      return;
    }

    if (new Date(tanggalSelesai) < new Date(tanggalMulai)) {
      setError("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/izin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nis: nis.trim(),
          tipe,
          tanggalMulai,
          tanggalSelesai,
          alasan: alasan.trim(),
          lampiranUrl: lampiranUrl || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Gagal mengirim formulir izin.");
      }
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan koneksi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-app)", color: "var(--text-main)" }}>
      {/* Header */}
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
            maxWidth: "760px",
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
            <span>Formulir Izin / Sakit Online</span>
          </Link>

          <Link
            href="/cek-presensi"
            className="btn btn-secondary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <ArrowLeft size={13} />
            <span>Cek Presensi</span>
          </Link>
        </div>
      </header>

      {/* Form Container */}
      <main style={{ maxWidth: "640px", margin: "0 auto", padding: "28px 20px" }}>
        {success ? (
          <div
            className="app-card"
            style={{
              padding: "40px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                color: "var(--color-success)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h1 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Pengajuan Berhasil Dikirim!</h1>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                maxWidth: "440px",
                lineHeight: 1.5,
              }}
            >
              Permohonan izin untuk <strong>{studentInfo?.namaSiswa}</strong> ({studentInfo?.kelas}) telah tersimpan dan sedang menunggu peninjauan oleh Guru Piket / Petugas Sekolah.
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <Link href={`/cek-presensi?nis=${encodeURIComponent(nis)}`} className="btn btn-primary btn-sm">
                Lihat Rekap Presensi
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSuccess(false);
                  setAlasan("");
                  setLampiranUrl("");
                }}
                className="btn btn-secondary btn-sm"
              >
                Kirim Pengajuan Baru
              </button>
            </div>
          </div>
        ) : (
          <div className="app-card" style={{ padding: "24px 24px" }}>
            <div style={{ marginBottom: "20px" }}>
              <h1 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Surat Dispensasi / Izin Digital</h1>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Pengajuan ketidakhadiran resmi yang langsung masuk ke sistem presensi sekolah.
              </p>
            </div>

            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  color: "var(--color-danger)",
                  fontSize: "0.82rem",
                  marginBottom: "16px",
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* NIS Input & Validation */}
              <div className="form-group">
                <label className="form-label">Nomor Induk Siswa (NIS)</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan NIS Anda"
                    value={nis}
                    onChange={(e) => {
                      setNis(e.target.value);
                      if (studentInfo) setStudentInfo(null);
                    }}
                    onBlur={() => verifyStudent(nis)}
                    className="form-input"
                    style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => verifyStudent(nis)}
                    disabled={verifyingNis || !nis}
                    className="btn btn-secondary btn-sm"
                  >
                    {verifyingNis ? <Loader2 size={14} className="animate-spin" /> : "Periksa"}
                  </button>
                </div>

                {studentInfo && (
                  <div
                    style={{
                      marginTop: "8px",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--bg-sunken)",
                      border: "1px solid var(--border-app)",
                      fontSize: "0.78rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FileCheck size={16} style={{ color: "var(--color-success)", flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: "var(--text-main)" }}>{studentInfo.namaSiswa}</strong> &bull; {studentInfo.kelas} ({studentInfo.jurusan})
                    </div>
                  </div>
                )}
              </div>

              {/* Kategori Izin */}
              <div className="form-group">
                <label className="form-label">Kategori Ketidakhadiran</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      border: `1.5px solid ${tipe === "Sakit" ? "var(--color-warning)" : "var(--border-app)"}`,
                      backgroundColor: tipe === "Sakit" ? "rgba(245, 158, 11, 0.06)" : "var(--bg-surface)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="radio"
                      name="tipe"
                      checked={tipe === "Sakit"}
                      onChange={() => setTipe("Sakit")}
                    />
                    <span>Sakit (Medis)</span>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      border: `1.5px solid ${tipe === "Izin" ? "var(--color-primary)" : "var(--border-app)"}`,
                      backgroundColor: tipe === "Izin" ? "rgba(37, 99, 235, 0.06)" : "var(--bg-surface)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="radio"
                      name="tipe"
                      checked={tipe === "Izin"}
                      onChange={() => setTipe("Izin")}
                    />
                    <span>Izin Keperluan Lain</span>
                  </label>
                </div>
              </div>

              {/* Rentang Tanggal */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Mulai Tanggal</label>
                  <input
                    type="date"
                    required
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="form-input"
                    style={{ fontSize: "0.82rem" }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sampai Tanggal</label>
                  <input
                    type="date"
                    required
                    value={tanggalSelesai}
                    onChange={(e) => setTanggalSelesai(e.target.value)}
                    className="form-input"
                    style={{ fontSize: "0.82rem" }}
                  />
                </div>
              </div>

              {/* Keterangan / Alasan */}
              <div className="form-group">
                <label className="form-label">Alasan Detail Ketidakhadiran</label>
                <textarea
                  required
                  rows={3}
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  placeholder="Contoh: Mengalami demam dan disarankan istirahat oleh dokter..."
                  className="form-textarea"
                />
              </div>

              {/* Upload Foto Surat Dokter / Bukti */}
              <div className="form-group">
                <label className="form-label">
                  Foto Surat Dokter / Surat Orang Tua (Opsional)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="form-input"
                  style={{ fontSize: "0.82rem" }}
                />
                {lampiranUrl && (
                  <div style={{ marginTop: "10px" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Pratinjau Dokumen:</span>
                    <img
                      src={lampiranUrl}
                      alt="Pratinjau Lampiran"
                      style={{
                        marginTop: "4px",
                        maxHeight: "140px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-app)",
                        display: "block",
                      }}
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || !studentInfo}
                className="btn btn-primary"
                style={{
                  height: "42px",
                  justifyContent: "center",
                  fontSize: "0.88rem",
                  marginTop: "8px",
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Mengirimkan Formulir...</span>
                  </>
                ) : (
                  "Kirim Permohonan Izin"
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default function IzinPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Memuat formulir...</div>}>
      <FormPengajuanIzin />
    </Suspense>
  );
}
