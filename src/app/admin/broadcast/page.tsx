"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Send,
  MessageSquare,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Layers,
  Settings,
} from "lucide-react";
import { Kelas } from "@/lib/types";

export default function BroadcastPage() {
  const today = new Date().toISOString().split("T")[0];
  const [tanggal, setTanggal] = useState(today);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [targetType, setTargetType] = useState<"wali_kelas" | "ortu_absen">("wali_kelas");
  const [targetPhone, setTargetPhone] = useState("");

  const [previewLoading, setPreviewLoading] = useState(false);
  const [presensiData, setPresensiData] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/kelas")
      .then((r) => r.json())
      .then((k) => setKelasList(k))
      .catch((e) => console.error(e));
  }, []);

  // Fetch today's records for preview
  const fetchPreview = async () => {
    setPreviewLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/presensi/siswa?tanggal=${tanggal}`);
      const data = await res.json();
      setPresensiData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, [tanggal, selectedKelas]);

  const filtered = selectedKelas
    ? presensiData.filter((p) => p.kelas === selectedKelas)
    : presensiData;

  const totalHadir = filtered.filter((p) => p.idKehadiran === 1).length;
  const totalSakit = filtered.filter((p) => p.idKehadiran === 2).length;
  const totalIzin = filtered.filter((p) => p.idKehadiran === 3).length;
  const totalAlfa = filtered.filter((p) => p.idKehadiran === 4).length;
  const alfaList = filtered.filter((p) => p.idKehadiran === 4);

  const handleBroadcast = async () => {
    if (targetType === "wali_kelas" && !targetPhone.trim()) {
      alert("Masukkan nomor WhatsApp penerima (Wali Kelas / Guru Piket) terlebih dahulu!");
      return;
    }

    if (
      !confirm(
        targetType === "wali_kelas"
          ? `Kirim rekapitulasi kehadiran tanggal ${tanggal} ke nomor ${targetPhone}?`
          : `Kirim notifikasi peringatan ke ${alfaList.length} nomor orang tua siswa yang berstatus Alfa?`
      )
    ) {
      return;
    }

    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tanggal,
          idKelas: selectedKelas
            ? kelasList.find((k) => k.kelas === selectedKelas)?.id
            : undefined,
          targetType,
          targetPhone: targetType === "wali_kelas" ? targetPhone.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult({ success: true, message: data.message });
      } else {
        setResult({
          success: false,
          message: data.error || data.message || "Gagal melakukan pengiriman broadcast.",
        });
      }
    } catch (err: any) {
      setResult({ success: false, message: err?.message || "Kesalahan jaringan." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "880px" }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Broadcast Rekapitulasi WhatsApp</h1>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
          Kirim laporan ringkasan kehadiran harian ke wali kelas atau kirim pemberitahuan peringatan langsung ke orang tua siswa yang tidak hadir.
        </p>
      </div>

      {result && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 16px",
            background: result.success ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${result.success ? "var(--color-success)" : "var(--color-danger)"}`,
            borderRadius: "var(--radius-md)",
            color: result.success ? "var(--color-success)" : "var(--color-danger)",
            fontSize: "0.85rem",
          }}
        >
          {result.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{result.message}</span>
        </div>
      )}

      {/* Parameter Konfigurasi Broadcast */}
      <div className="app-card" style={{ padding: "20px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "14px" }}>
          1. Parameter Broadcast
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
            marginBottom: "16px",
          }}
        >
          <div className="form-group">
            <label className="form-label">Tanggal Presensi</label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="form-input"
              style={{ fontSize: "0.85rem" }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Filter Rombongan Belajar (Kelas)</label>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="form-select"
              style={{ fontSize: "0.85rem" }}
            >
              <option value="">Semua Kelas</option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.kelas}>
                  {k.kelas}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Tujuan Penerima Pesan</label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "10px",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                border: `1.5px solid ${targetType === "wali_kelas" ? "var(--color-primary)" : "var(--border-app)"}`,
                backgroundColor: targetType === "wali_kelas" ? "rgba(37, 99, 235, 0.05)" : "var(--bg-surface)",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="targetType"
                checked={targetType === "wali_kelas"}
                onChange={() => setTargetType("wali_kelas")}
                style={{ marginTop: "2px" }}
              />
              <div>
                <strong style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
                  Wali Kelas / Guru Piket
                </strong>
                <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Kirim rekap lengkap kehadiran hari ini ke nomor kontak guru yang ditentukan.
                </div>
              </div>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                border: `1.5px solid ${targetType === "ortu_absen" ? "var(--color-warning)" : "var(--border-app)"}`,
                backgroundColor: targetType === "ortu_absen" ? "rgba(245, 158, 11, 0.05)" : "var(--bg-surface)",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="targetType"
                checked={targetType === "ortu_absen"}
                onChange={() => setTargetType("ortu_absen")}
                style={{ marginTop: "2px" }}
              />
              <div>
                <strong style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
                  Orang Tua Siswa Alfa (Tidak Hadir)
                </strong>
                <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Kirim notifikasi peringatan langsung ke kontak WhatsApp orang tua siswa yang tidak hadir hari ini ({alfaList.length} siswa).
                </div>
              </div>
            </label>
          </div>
        </div>

        {targetType === "wali_kelas" && (
          <div className="form-group" style={{ marginTop: "14px" }}>
            <label className="form-label">Nomor WhatsApp Guru / Wali Kelas Tujuan</label>
            <input
              type="text"
              placeholder="Contoh: 081234567890"
              value={targetPhone}
              onChange={(e) => setTargetPhone(e.target.value)}
              className="form-input"
              style={{ maxWidth: "340px", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}
            />
          </div>
        )}
      </div>

      {/* Pratinjau Ringkasan & Isi Pesan */}
      <div className="app-card" style={{ padding: "20px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "14px" }}>
          2. Pratinjau Laporan ({tanggal})
        </h2>

        {previewLoading ? (
          <div style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
            <Loader2 size={20} className="animate-spin" style={{ margin: "0 auto 6px" }} />
            Menghitung ringkasan presensi...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Quick Stat Pill */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                gap: "10px",
              }}
            >
              <div style={{ padding: "8px 12px", backgroundColor: "var(--bg-sunken)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-app)" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Hadir</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-success)" }}>{totalHadir}</div>
              </div>
              <div style={{ padding: "8px 12px", backgroundColor: "var(--bg-sunken)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-app)" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Sakit</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-warning)" }}>{totalSakit}</div>
              </div>
              <div style={{ padding: "8px 12px", backgroundColor: "var(--bg-sunken)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-app)" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Izin</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-primary)" }}>{totalIzin}</div>
              </div>
              <div style={{ padding: "8px 12px", backgroundColor: "var(--bg-sunken)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-app)" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Alfa</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-danger)" }}>{totalAlfa}</div>
              </div>
            </div>

            {/* Simulated Message Bubble */}
            <div>
              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                Format Pesan WhatsApp Terformat:
              </div>
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--bg-sunken)",
                  border: "1px solid var(--border-app)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.78rem",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {targetType === "wali_kelas" ? (
                  `*REKAP PRESENSI HARIAN*
Tanggal: *${tanggal}* ${selectedKelas ? `(${selectedKelas})` : "(Semua Kelas)"}
---------------------------------
Total Kehadiran: ${totalHadir} siswa
Sakit: ${totalSakit} siswa
Izin: ${totalIzin} siswa
Tanpa Keterangan (Alfa): ${totalAlfa} siswa
---------------------------------
${
  alfaList.length > 0
    ? `*Daftar Siswa Alfa:*\n` +
      alfaList.map((a, idx) => `${idx + 1}. ${a.namaSiswa} (${a.kelas || "-"})`).join("\n")
    : "Seluruh siswa tercatat hadir/berketerangan."
}

_Pesan otomatis dikirim melalui Sistem Presensi Terpadu._`
                ) : (
                  `Pemberitahuan Presensi Sekolah:
Ananda [Nama Siswa] (NIS: [NIS]) terdata ALFA (Tidak Hadir) di sekolah pada tanggal ${tanggal}.
Mohon orang tua/wali segera mengonfirmasi ke pihak sekolah jika terdapat halangan medis/keluarga.`
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "6px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleBroadcast}
                disabled={sending}
                className="btn btn-primary"
                style={{ padding: "10px 24px" }}
              >
                <Send size={15} />
                <span>
                  {sending
                    ? "Mengirimkan Pesan..."
                    : targetType === "wali_kelas"
                    ? "Kirim Rekapitulasi via WhatsApp"
                    : `Kirim Peringatan ke ${alfaList.length} Orang Tua`}
                </span>
              </button>

              <Link
                href="/admin/settings"
                className="btn btn-secondary btn-sm"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Settings size={13} />
                <span>Pengaturan Gateway</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
