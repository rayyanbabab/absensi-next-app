"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRScanner from "@/components/QRScanner";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Clock,
  Calendar,
  LayoutDashboard,
  CheckCircle,
  AlertCircle,
  QrCode,
  UserCheck,
  School,
  Volume2,
  VolumeX,
  FileText,
  HeartHandshake,
} from "lucide-react";

export default function ScanPage() {
  const [mode, setMode] = useState<"masuk" | "pulang">("masuk");
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    type?: "siswa" | "guru";
    entity?: any;
    presensi?: any;
  } | null>(null);

  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [stats, setStats] = useState({ hadir: 0, total: 0 });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setCurrentDate(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadRecentScans = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (data) {
        const combined = [
          ...(data.presensiSiswaHariIni || []).map((p: any) => ({
            ...p,
            type: "siswa",
          })),
          ...(data.presensiGuruHariIni || []).map((p: any) => ({
            ...p,
            type: "guru",
          })),
        ].sort((a, b) => (b.jamMasuk || "").localeCompare(a.jamMasuk || ""));

        setRecentScans(combined);
        setStats({
          hadir: (data.siswaKehadiran?.hadir || 0) + (data.guruKehadiran?.hadir || 0),
          total: (data.totalSiswa || 0) + (data.totalGuru || 0),
        });
      }
    } catch (err) {
      console.warn("Gagal memuat rekap presensi:", err);
    }
  };

  useEffect(() => {
    loadRecentScans();
  }, []);

  const [voiceEnabled, setVoiceEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("presensi_voice_enabled");
    if (saved !== null) {
      setVoiceEnabled(saved === "true");
    }
  }, []);

  const toggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    localStorage.setItem("presensi_voice_enabled", String(next));
    if (next) {
      speakGreeting("Suara presensi diaktifkan.");
    }
  };

  const speakGreeting = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (!voiceEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(
        (v) => v.lang.includes("id") || v.lang.includes("ID")
      );
      if (idVoice) utterance.voice = idVoice;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS error:", e);
    }
  };

  const handleScan = async (code: string) => {
    setIsProcessing(true);
    setScanResult(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uniqueCode: code, mode }),
      });

      const data = await res.json();
      setScanResult(data);

      if (data.success) {
        loadRecentScans();
        const nama = data.entity?.namaSiswa || data.entity?.namaGuru || "";
        const isGuru = data.type === "guru";

        if (mode === "masuk") {
          if (isGuru) {
            speakGreeting(`Terima kasih Bapak atau Ibu ${nama}. Selamat bertugas.`);
          } else {
            speakGreeting(`Terima kasih ${nama}. Selamat belajar.`);
          }
        } else {
          speakGreeting(`Sampai jumpa ${nama}. Hati-hati di jalan.`);
        }
      } else {
        speakGreeting(data.message || "Peringatan, presensi tidak tercatat.");
      }
    } catch (err: any) {
      setScanResult({
        success: false,
        message: err?.message || "Koneksi ke server gagal.",
      });
      speakGreeting("Koneksi ke server terganggu.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Navbar */}
      <header
        style={{
          borderBottom: "1px solid var(--border-app)",
          backgroundColor: "var(--bg-surface)",
          position: "sticky",
          top: 0,
          zIndex: 40,
          padding: "12px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1320px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--brand-primary)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <QrCode size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--text-main)" }}>
                Presensi QR Sekolah
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                SMK 1 Indonesia
              </div>
            </div>
          </div>

          {/* Date, Time, and Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.82rem",
                color: "var(--text-body)",
                backgroundColor: "var(--bg-subtle)",
                padding: "6px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-app)",
              }}
            >
              <Calendar size={14} style={{ color: "var(--text-muted)" }} />
              <span>{currentDate}</span>
              <span style={{ color: "var(--border-strong)" }}>|</span>
              <Clock size={14} style={{ color: "var(--brand-primary)" }} />
              <strong style={{ fontFamily: "var(--font-mono)" }}>{currentTime}</strong>
            </div>

            <button
              onClick={toggleVoice}
              className="btn btn-secondary btn-sm"
              title={voiceEnabled ? "Matikan Suara Sapaan" : "Aktifkan Suara Sapaan"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.8rem",
                color: voiceEnabled ? "var(--color-primary)" : "var(--text-muted)",
              }}
            >
              {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              <span>{voiceEnabled ? "Suara Aktif" : "Bisu"}</span>
            </button>

            <ThemeToggle />

            <Link href="/cek-presensi" className="btn btn-secondary btn-sm" title="Cek Rekap Kehadiran Siswa Mandiri">
              <UserCheck size={14} />
              <span className="hidden-mobile">Cek Presensi</span>
            </Link>

            <Link href="/ortu/login" className="btn btn-secondary btn-sm" title="Login Khusus Wali Murid">
              <HeartHandshake size={14} />
              <span>Portal Wali</span>
            </Link>

            <Link href="/admin" className="btn btn-primary btn-sm">
              <LayoutDashboard size={14} />
              <span>Portal Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main
        className="scanner-layout-grid"
        style={{
          flex: 1,
          maxWidth: "1320px",
          width: "100%",
          margin: "0 auto",
          padding: "24px 16px",
        }}
      >
        {/* Left Column: Jadwal & Panduan */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Jadwal Jam Presensi */}
          <div className="app-card" style={{ padding: "20px" }}>
            <h2 style={{ fontSize: "0.95rem", marginBottom: "14px", color: "var(--text-main)" }}>
              Aturan Jam Sekolah
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--status-success-bg)",
                  border: "1px solid var(--status-success-border)",
                }}
              >
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--status-success-text)" }}>
                  Jam Masuk
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                  06:00 - 07:15
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Batas kedatangan tepat waktu
                </div>
              </div>

              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--status-warning-bg)",
                  border: "1px solid var(--status-warning-border)",
                }}
              >
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--status-warning-text)" }}>
                  Jam Pulang
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>
                  15:00 - 17:00
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Buka scan kepulangan
                </div>
              </div>
            </div>
          </div>

          {/* Panduan */}
          <div className="app-card" style={{ padding: "20px" }}>
            <h2 style={{ fontSize: "0.95rem", marginBottom: "12px", color: "var(--text-main)" }}>
              Panduan Presensi
            </h2>
            <ol
              style={{
                paddingLeft: "18px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                fontSize: "0.82rem",
                color: "var(--text-body)",
                lineHeight: 1.5,
              }}
            >
              <li>Pilih tombol Masuk atau Pulang.</li>
              <li>Arahkan kartu QR ke depan kamera.</li>
              <li>Tunggu bunyi bip dan konfirmasi data muncul di layar.</li>
            </ol>
          </div>

          {/* Layanan Siswa & Orang Tua */}
          <div className="app-card" style={{ padding: "18px 20px" }}>
            <h2 style={{ fontSize: "0.95rem", marginBottom: "6px", color: "var(--text-main)" }}>
              Layanan Siswa & Orang Tua
            </h2>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "14px", lineHeight: 1.4 }}>
              Cek kehadiran mandiri tanpa login atau kirim formulir izin/sakit online secara langsung.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link
                href="/ortu/login"
                className="btn btn-primary btn-sm"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <HeartHandshake size={14} />
                <span>Masuk Portal Orang Tua</span>
              </Link>
              <Link
                href="/cek-presensi"
                className="btn btn-secondary btn-sm"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <UserCheck size={14} />
                <span>Cek Riwayat Presensi (NIS)</span>
              </Link>
              <Link
                href="/izin"
                className="btn btn-secondary btn-sm"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <FileText size={14} />
                <span>Pengajuan Izin / Sakit Online</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Center Column: Scanner Station (Prioritized on Mobile) */}
        <div className="scanner-station-col" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="app-card" style={{ padding: "24px" }}>
            <div style={{ textAlign: "center", marginBottom: "18px" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Kamera Pemindai QR</h2>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Dekatkan kartu presensi siswa atau guru ke area kamera
              </p>
            </div>

            {/* QR Scanner Component */}
            <QRScanner
              onScanSuccess={handleScan}
              mode={mode}
              setMode={setMode}
              isProcessing={isProcessing}
            />

            {/* Result Confirmation Box */}
            {scanResult && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: scanResult.success
                    ? "var(--status-success-bg)"
                    : "var(--status-danger-bg)",
                  border: `1px solid ${
                    scanResult.success
                      ? "var(--status-success-border)"
                      : "var(--status-danger-border)"
                  }`,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  {scanResult.success ? (
                    <CheckCircle
                      size={22}
                      style={{ color: "var(--status-success-text)", flexShrink: 0, marginTop: "2px" }}
                    />
                  ) : (
                    <AlertCircle
                      size={22}
                      style={{ color: "var(--status-danger-text)", flexShrink: 0, marginTop: "2px" }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "0.92rem",
                        fontWeight: 700,
                        color: scanResult.success
                          ? "var(--status-success-text)"
                          : "var(--status-danger-text)",
                      }}
                    >
                      {scanResult.message}
                    </div>

                    {scanResult.entity && (
                      <div
                        style={{
                          marginTop: "8px",
                          padding: "8px 12px",
                          backgroundColor: "var(--bg-surface)",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--border-app)",
                          fontSize: "0.82rem",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <strong>
                            {scanResult.entity.namaSiswa || scanResult.entity.namaGuru}
                          </strong>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {scanResult.entity.nis
                              ? `NIS: ${scanResult.entity.nis}`
                              : `NUPTK: ${scanResult.entity.nuptk}`}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span className="status-badge status-badge-info">
                            {scanResult.entity.kelas || "Guru"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Aktivitas Hari Ini */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Stat Box */}
          <div
            className="app-card"
            style={{
              padding: "16px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              textAlign: "center",
              gap: "8px",
            }}
          >
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Hadir Hari Ini</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--brand-primary)" }}>
                {stats.hadir}
              </div>
            </div>
            <div style={{ borderLeft: "1px solid var(--border-app)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Warga</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)" }}>
                {stats.total}
              </div>
            </div>
          </div>

          {/* Recent Scans Feed */}
          <div className="app-card" style={{ padding: "18px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <h2 style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>
                Presensi Terakhir
              </h2>
              <span className="status-badge status-badge-neutral">{recentScans.length}</span>
            </div>

            {recentScans.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "36px 8px",
                  fontSize: "0.82rem",
                  color: "var(--text-muted)",
                }}
              >
                Belum ada data scan presensi hari ini.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  maxHeight: "440px",
                  overflowY: "auto",
                }}
              >
                {recentScans.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "8px 10px",
                      backgroundColor: "var(--bg-subtle)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-app)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.82rem",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
                        {item.namaSiswa || item.namaGuru}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {item.kelas || item.nuptk || "Guru"}
                      </div>
                    </div>
                    <span className="status-badge status-badge-success" style={{ fontFamily: "var(--font-mono)" }}>
                      {item.jamMasuk || "Hadir"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border-app)",
          padding: "16px 24px",
          textAlign: "center",
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          backgroundColor: "var(--bg-surface)",
        }}
      >
        Hak Cipta &copy; 2025 SMK 1 Indonesia. Sistem Presensi Siswa dan Guru.
      </footer>
    </div>
  );
}
