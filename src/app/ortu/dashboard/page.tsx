"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HeartHandshake,
  LogOut,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Users,
  Phone,
  PlusCircle,
  RefreshCw,
  TrendingUp,
  School,
  FileEdit,
  ShieldAlert,
  Loader2,
  ExternalLink,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Siswa, PresensiSiswa, PengajuanIzin } from "@/lib/types";

export default function OrtuDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parent & Child Data
  const [dashboardData, setDashboardData] = useState<{
    akun: {
      id: number;
      username: string;
      namaOrangTua: string;
      noHp: string;
      email?: string;
      idSiswaList: number[];
    };
    linkedSiswa: Siswa[];
    activeChild: Siswa | null;
    todayPresensi: (PresensiSiswa & { kehadiran: string }) | null;
    stats: {
      total: number;
      hadir: number;
      sakit: number;
      izin: number;
      alfa: number;
      persentase: number;
    };
    records: (PresensiSiswa & { kehadiran: string })[];
    pengajuanIzin: PengajuanIzin[];
    settings: any;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<"riwayat" | "izin" | "pengaturan">("riwayat");
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  // Leave submission modal state
  const [showIzinModal, setShowIzinModal] = useState(false);
  const [izinTipe, setIzinTipe] = useState<"Sakit" | "Izin">("Sakit");
  const [izinMulai, setIzinMulai] = useState(new Date().toISOString().split("T")[0]);
  const [izinSelesai, setIzinSelesai] = useState(new Date().toISOString().split("T")[0]);
  const [izinAlasan, setIzinAlasan] = useState("");
  const [izinLampiran, setIzinLampiran] = useState<string>("");
  const [izinSubmitting, setIzinSubmitting] = useState(false);
  const [izinSuccessMsg, setIzinSuccessMsg] = useState<string | null>(null);

  // Update phone state
  const [editPhone, setEditPhone] = useState("");
  const [phoneUpdating, setPhoneUpdating] = useState(false);
  const [phoneMsg, setPhoneMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Link child state
  const [linkNis, setLinkNis] = useState("");
  const [linkingChild, setLinkingChild] = useState(false);
  const [linkMsg, setLinkMsg] = useState<{ success: boolean; text: string } | null>(null);

  const loadData = async (childId?: number) => {
    try {
      const url = childId ? `/api/ortu/dashboard?idSiswa=${childId}` : "/api/ortu/dashboard";
      const res = await fetch(url);
      if (res.status === 401) {
        router.push("/ortu/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal memuat data dashboard.");
      } else {
        setDashboardData(data);
        if (data.activeChild) {
          setSelectedChildId(data.activeChild.id);
        }
        if (data.akun?.noHp) {
          setEditPhone(data.akun.noHp);
        }
      }
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSwitchChild = (childId: number) => {
    setSelectedChildId(childId);
    setLoading(true);
    loadData(childId);
  };

  const handleLogout = async () => {
    await fetch("/api/ortu/logout", { method: "POST" });
    router.push("/ortu/login");
  };

  const handleSubmitIzin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dashboardData?.activeChild) return;
    setIzinSubmitting(true);
    setIzinSuccessMsg(null);

    try {
      const res = await fetch("/api/izin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nis: dashboardData.activeChild.nis,
          tipe: izinTipe,
          tanggalMulai: izinMulai,
          tanggalSelesai: izinSelesai,
          alasan: izinAlasan,
          lampiranUrl: izinLampiran || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIzinSuccessMsg("Pengajuan izin berhasil dikirim! Menunggu konfirmasi verifikator sekolah.");
        setIzinAlasan("");
        setIzinLampiran("");
        setTimeout(() => {
          setShowIzinModal(false);
          setIzinSuccessMsg(null);
          loadData(selectedChildId || undefined);
        }, 1500);
      } else {
        alert(data.error || "Gagal mengirim pengajuan izin.");
      }
    } catch (err: any) {
      alert(err?.message || "Kesalahan koneksi.");
    } finally {
      setIzinSubmitting(false);
    }
  };

  const handleUpdatePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneUpdating(true);
    setPhoneMsg(null);

    try {
      const res = await fetch("/api/ortu/update-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noHp: editPhone }),
      });
      const data = await res.json();
      if (res.ok) {
        setPhoneMsg({ success: true, text: data.message });
        loadData(selectedChildId || undefined);
      } else {
        setPhoneMsg({ success: false, text: data.error || "Gagal memperbarui nomor telepon." });
      }
    } catch (err: any) {
      setPhoneMsg({ success: false, text: err?.message || "Kesalahan koneksi." });
    } finally {
      setPhoneUpdating(false);
    }
  };

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkingChild(true);
    setLinkMsg(null);

    try {
      const res = await fetch("/api/ortu/link-anak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nis: linkNis }),
      });
      const data = await res.json();
      if (res.ok) {
        setLinkMsg({ success: true, text: data.message });
        setLinkNis("");
        loadData();
      } else {
        setLinkMsg({ success: false, text: data.error || "Gagal menghubungkan anak." });
      }
    } catch (err: any) {
      setLinkMsg({ success: false, text: err?.message || "Kesalahan koneksi." });
    } finally {
      setLinkingChild(false);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          backgroundColor: "var(--bg-app)",
          color: "var(--text-main)",
        }}
      >
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--color-primary)" }} />
        <span style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>Memuat Dashboard Orang Tua...</span>
      </div>
    );
  }

  const akun = dashboardData?.akun;
  const activeChild = dashboardData?.activeChild;
  const linkedSiswa = dashboardData?.linkedSiswa || [];
  const todayPresensi = dashboardData?.todayPresensi;
  const stats = dashboardData?.stats || { total: 0, hadir: 0, sakit: 0, izin: 0, alfa: 0, persentase: 100 };
  const records = dashboardData?.records || [];
  const pengajuanIzinList = dashboardData?.pengajuanIzin || [];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-app)", color: "var(--text-main)" }}>
      {/* Top Navbar */}
      <header
        style={{
          borderBottom: "1px solid var(--border-app)",
          backgroundColor: "var(--bg-surface)",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, var(--color-primary), #0284c7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 2px 8px rgba(14, 165, 233, 0.25)",
              }}
            >
              <HeartHandshake size={20} />
            </div>
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, lineHeight: 1.2 }}>
                Portal Wali Murid
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                {dashboardData?.settings?.schoolName || "SMK 1 Indonesia"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "20px",
                backgroundColor: "var(--bg-subtle)",
                fontSize: "0.76rem",
                color: "var(--text-muted)",
              }}
            >
              <User size={13} style={{ color: "var(--color-primary)" }} />
              <strong style={{ color: "var(--text-main)" }}>{akun?.namaOrangTua}</strong>
            </div>

            <ThemeToggle />

            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "var(--color-danger)" }}
              title="Keluar dari akun orang tua"
            >
              <LogOut size={13} />
              <span className="hidden-mobile">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px 20px" }}>
        {/* Child Selector Tabs (Support Multi-Anak) */}
        {linkedSiswa.length > 1 && (
          <div
            style={{
              marginBottom: "20px",
              padding: "8px 12px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-app)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              overflowX: "auto",
            }}
          >
            <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
              Pilih Ananda:
            </span>
            {linkedSiswa.map((anak) => {
              const isSelected = anak.id === activeChild?.id;
              return (
                <button
                  key={anak.id}
                  onClick={() => handleSwitchChild(anak.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    fontWeight: isSelected ? 700 : 500,
                    backgroundColor: isSelected ? "var(--color-primary)" : "var(--bg-subtle)",
                    color: isSelected ? "#ffffff" : "var(--text-main)",
                    border: "none",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Users size={13} />
                  <span>{anak.namaSiswa} ({anak.kelas})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Student Active Profile Card */}
        {activeChild && (
          <div
            className="app-card"
            style={{
              padding: "20px 24px",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <div style={{ fontSize: "0.74rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-primary)" }}>
                Data Kehadiran Ananda
              </div>
              <h1 style={{ fontSize: "1.35rem", fontWeight: 800, marginTop: "2px", color: "var(--text-main)" }}>
                {activeChild.namaSiswa}
              </h1>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "3px" }}>
                NIS: <strong style={{ fontFamily: "var(--font-mono)", color: "var(--text-main)" }}>{activeChild.nis}</strong> &bull; Kelas: <strong>{activeChild.kelas}</strong> ({activeChild.jurusan})
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={() => setShowIzinModal(true)}
                className="btn btn-primary"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.84rem", padding: "8px 14px" }}
              >
                <FileEdit size={14} />
                <span>Ajukan Izin / Sakit</span>
              </button>
            </div>
          </div>
        )}

        {/* Today's Live Status Hero Card */}
        <div
          className="app-card"
          style={{
            padding: "22px 24px",
            marginBottom: "20px",
            position: "relative",
            overflow: "hidden",
            borderLeft: todayPresensi?.idKehadiran === 1
              ? "5px solid var(--color-success)"
              : todayPresensi?.idKehadiran === 2
              ? "5px solid #f59e0b"
              : todayPresensi?.idKehadiran === 3
              ? "5px solid var(--color-primary)"
              : todayPresensi?.idKehadiran === 4
              ? "5px solid var(--color-danger)"
              : "5px solid var(--border-app)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                <Calendar size={14} />
                <span>Status Presensi Hari Ini ({new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })})</span>
              </div>

              <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                {todayPresensi ? (
                  <span
                    className={`badge ${
                      todayPresensi.idKehadiran === 1
                        ? "badge-success"
                        : todayPresensi.idKehadiran === 2
                        ? "badge-warning"
                        : todayPresensi.idKehadiran === 3
                        ? "badge-info"
                        : "badge-danger"
                    }`}
                    style={{ fontSize: "1rem", padding: "6px 14px", fontWeight: 800 }}
                  >
                    {todayPresensi.kehadiran.toUpperCase()}
                  </span>
                ) : (
                  <span
                    className="badge"
                    style={{
                      fontSize: "0.95rem",
                      padding: "6px 14px",
                      fontWeight: 800,
                      backgroundColor: "rgba(100, 116, 139, 0.12)",
                      color: "var(--text-muted)",
                      border: "1px solid var(--border-app)",
                    }}
                  >
                    BELUM SCAN HARI INI
                  </span>
                )}

                {todayPresensi?.keterangan && (
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    &mdash; {todayPresensi.keterangan}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={18} style={{ color: "var(--color-primary)" }} />
                <div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Jam Masuk</div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                    {todayPresensi?.jamMasuk || "-"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={18} style={{ color: "var(--color-success)" }} />
                <div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Jam Pulang</div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                    {todayPresensi?.jamKeluar || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Metric Summary Cards + Ratio Indicator */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          {/* Ratio Card */}
          <div className="app-card" style={{ padding: "16px 18px", borderTop: "3px solid var(--color-success)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--text-muted)" }}>Rasio Presensi</span>
              <TrendingUp size={16} style={{ color: "var(--color-success)" }} />
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-success)", marginTop: "4px" }}>
              {stats.persentase}%
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Dari total {stats.total} catatan
            </div>
          </div>

          {/* Hadir */}
          <div className="app-card" style={{ padding: "16px 18px", borderTop: "3px solid var(--color-success)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--text-muted)" }}>Hadir</span>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-success)" }} />
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-success)", marginTop: "4px" }}>
              {stats.hadir}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Hari tepat waktu
            </div>
          </div>

          {/* Sakit */}
          <div className="app-card" style={{ padding: "16px 18px", borderTop: "3px solid #f59e0b" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--text-muted)" }}>Sakit</span>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#f59e0b" }} />
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#f59e0b", marginTop: "4px" }}>
              {stats.sakit}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Hari sakit terkonfirmasi
            </div>
          </div>

          {/* Izin */}
          <div className="app-card" style={{ padding: "16px 18px", borderTop: "3px solid var(--color-primary)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--text-muted)" }}>Izin</span>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-primary)" }} />
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-primary)", marginTop: "4px" }}>
              {stats.izin}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Hari izin resmi
            </div>
          </div>

          {/* Alfa */}
          <div className="app-card" style={{ padding: "16px 18px", borderTop: "3px solid var(--color-danger)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--text-muted)" }}>Alfa</span>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-danger)" }} />
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-danger)", marginTop: "4px" }}>
              {stats.alfa}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Tanpa keterangan
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            borderBottom: "1px solid var(--border-app)",
            marginBottom: "20px",
            overflowX: "auto",
          }}
        >
          <button
            onClick={() => setActiveTab("riwayat")}
            style={{
              padding: "10px 18px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "riwayat" ? "2px solid var(--color-primary)" : "2px solid transparent",
              color: activeTab === "riwayat" ? "var(--color-primary)" : "var(--text-muted)",
              fontWeight: activeTab === "riwayat" ? 700 : 500,
              fontSize: "0.88rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <Calendar size={16} />
            <span>Riwayat Kehadiran ({records.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("izin")}
            style={{
              padding: "10px 18px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "izin" ? "2px solid var(--color-primary)" : "2px solid transparent",
              color: activeTab === "izin" ? "var(--color-primary)" : "var(--text-muted)",
              fontWeight: activeTab === "izin" ? 700 : 500,
              fontSize: "0.88rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <FileText size={16} />
            <span>Pengajuan Izin Ananda ({pengajuanIzinList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("pengaturan")}
            style={{
              padding: "10px 18px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "pengaturan" ? "2px solid var(--color-primary)" : "2px solid transparent",
              color: activeTab === "pengaturan" ? "var(--color-primary)" : "var(--text-muted)",
              fontWeight: activeTab === "pengaturan" ? 700 : 500,
              fontSize: "0.88rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <Phone size={16} />
            <span>Pengaturan WhatsApp & Multi-Anak</span>
          </button>
        </div>

        {/* TAB 1: RIWAYAT KEHADIRAN */}
        {activeTab === "riwayat" && (
          <div className="app-card" style={{ padding: "20px 24px" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px" }}>
              Buku Catatan Kehadiran
            </h2>

            {records.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                <Calendar size={36} style={{ margin: "0 auto 10px", opacity: 0.5 }} />
                <p style={{ fontSize: "0.88rem" }}>Belum ada rekaman presensi untuk siswa ini.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="app-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Status Kehadiran</th>
                      <th>Jam Masuk</th>
                      <th>Jam Pulang</th>
                      <th>Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((rec) => (
                      <tr key={rec.id}>
                        <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                          {rec.tanggal}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              rec.idKehadiran === 1
                                ? "badge-success"
                                : rec.idKehadiran === 2
                                ? "badge-warning"
                                : rec.idKehadiran === 3
                                ? "badge-info"
                                : "badge-danger"
                            }`}
                          >
                            {rec.kehadiran}
                          </span>
                        </td>
                        <td style={{ fontFamily: "var(--font-mono)" }}>{rec.jamMasuk || "-"}</td>
                        <td style={{ fontFamily: "var(--font-mono)" }}>{rec.jamKeluar || "-"}</td>
                        <td style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                          {rec.keterangan || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PENGAJUAN IZIN ANAK */}
        {activeTab === "izin" && (
          <div className="app-card" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                  Riwayat Pengajuan Izin & Sakit
                </h2>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Status persetujuan permohonan izin dari wali kelas / admin piket
                </p>
              </div>
              <button
                onClick={() => setShowIzinModal(true)}
                className="btn btn-primary btn-sm"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <PlusCircle size={14} />
                <span>Ajukan Permohonan Baru</span>
              </button>
            </div>

            {pengajuanIzinList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                <FileText size={36} style={{ margin: "0 auto 10px", opacity: 0.5 }} />
                <p style={{ fontSize: "0.88rem" }}>Belum ada pengajuan izin untuk ananda ini.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="app-table">
                  <thead>
                    <tr>
                      <th>Tanggal Pengajuan</th>
                      <th>Tipe</th>
                      <th>Rentang Tanggal</th>
                      <th>Alasan</th>
                      <th>Status Verifikasi</th>
                      <th>Catatan Sekolah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pengajuanIzinList.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          {new Date(item.createdAt).toLocaleDateString("id-ID")}
                        </td>
                        <td>
                          <span className={`badge ${item.tipe === "Sakit" ? "badge-warning" : "badge-info"}`}>
                            {item.tipe}
                          </span>
                        </td>
                        <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>
                          {item.tanggalMulai} s/d {item.tanggalSelesai}
                        </td>
                        <td style={{ fontSize: "0.84rem", maxWidth: "260px" }}>{item.alasan}</td>
                        <td>
                          <span
                            className={`badge ${
                              item.status === "Disetujui"
                                ? "badge-success"
                                : item.status === "Ditolak"
                                ? "badge-danger"
                                : "badge-secondary"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                          {item.catatanAdmin || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PENGATURAN WHATSAPP & MULTI-ANAK */}
        {activeTab === "pengaturan" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
            {/* Phone Card */}
            <div className="app-card" style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <Phone size={18} style={{ color: "var(--color-primary)" }} />
                <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Nomor WhatsApp Notifikasi</h2>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                Sistem akan mengirimkan pemberitahuan otomatis ke nomor ini saat anak Anda melakukan scan presensi atau jika terdapat peringatan dari sekolah.
              </p>

              {phoneMsg && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: phoneMsg.success ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                    border: `1px solid ${phoneMsg.success ? "var(--color-success)" : "var(--color-danger)"}`,
                    color: phoneMsg.success ? "var(--color-success)" : "var(--color-danger)",
                    fontSize: "0.82rem",
                    marginBottom: "14px",
                  }}
                >
                  {phoneMsg.text}
                </div>
              )}

              <form onSubmit={handleUpdatePhone} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.8rem" }}>Nomor WhatsApp Wali Murid</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="form-input"
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={phoneUpdating}
                  className="btn btn-primary btn-sm"
                  style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  {phoneUpdating ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                  <span>Simpan Perubahan Nomor</span>
                </button>
              </form>
            </div>

            {/* Link Child Card */}
            <div className="app-card" style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <Users size={18} style={{ color: "var(--color-primary)" }} />
                <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Hubungkan Anak Lain</h2>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                Jika Anda memiliki lebih dari 1 putra/putri yang bersekolah di sekolah ini, masukkan Nomor Induk Siswa (NIS) untuk menghubungkannya ke akun ini.
              </p>

              {linkMsg && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: linkMsg.success ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                    border: `1px solid ${linkMsg.success ? "var(--color-success)" : "var(--color-danger)"}`,
                    color: linkMsg.success ? "var(--color-success)" : "var(--color-danger)",
                    fontSize: "0.82rem",
                    marginBottom: "14px",
                  }}
                >
                  {linkMsg.text}
                </div>
              )}

              <form onSubmit={handleLinkChild} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.8rem" }}>NIS Siswa yang Ingin Dihubungkan</label>
                  <input
                    type="text"
                    required
                    value={linkNis}
                    onChange={(e) => setLinkNis(e.target.value)}
                    placeholder="Contoh: 2024003"
                    className="form-input"
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={linkingChild}
                  className="btn btn-secondary btn-sm"
                  style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  {linkingChild ? <Loader2 size={13} className="animate-spin" /> : <PlusCircle size={13} />}
                  <span>Hubungkan Anak</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: AJUKAN IZIN / SAKIT BARU */}
        {showIzinModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.55)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: "20px",
            }}
          >
            <div
              className="app-card"
              style={{
                maxWidth: "500px",
                width: "100%",
                padding: "26px",
                borderRadius: "var(--radius-lg, 16px)",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>
                  Form Pengajuan Izin / Sakit
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIzinModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.2rem",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                  }}
                >
                  &times;
                </button>
              </div>

              {izinSuccessMsg && (
                <div
                  style={{
                    padding: "12px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid var(--color-success)",
                    color: "var(--color-success)",
                    fontSize: "0.84rem",
                    marginBottom: "14px",
                  }}
                >
                  {izinSuccessMsg}
                </div>
              )}

              <form onSubmit={handleSubmitIzin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ padding: "10px 14px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Siswa Pemohon:</div>
                  <div style={{ fontSize: "0.92rem", fontWeight: 700 }}>{activeChild?.namaSiswa}</div>
                  <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                    NIS: {activeChild?.nis} &bull; Kelas: {activeChild?.kelas}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.8rem" }}>Jenis Permohonan</label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setIzinTipe("Sakit")}
                      style={{
                        flex: 1,
                        padding: "9px",
                        borderRadius: "var(--radius-sm)",
                        border: izinTipe === "Sakit" ? "2px solid #f59e0b" : "1px solid var(--border-app)",
                        backgroundColor: izinTipe === "Sakit" ? "rgba(245, 158, 11, 0.12)" : "var(--bg-surface)",
                        color: izinTipe === "Sakit" ? "#f59e0b" : "var(--text-main)",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Sakit
                    </button>
                    <button
                      type="button"
                      onClick={() => setIzinTipe("Izin")}
                      style={{
                        flex: 1,
                        padding: "9px",
                        borderRadius: "var(--radius-sm)",
                        border: izinTipe === "Izin" ? "2px solid var(--color-primary)" : "1px solid var(--border-app)",
                        backgroundColor: izinTipe === "Izin" ? "rgba(14, 165, 233, 0.12)" : "var(--bg-surface)",
                        color: izinTipe === "Izin" ? "var(--color-primary)" : "var(--text-main)",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Izin / Keperluan Lain
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: "0.8rem" }}>Mulai Tanggal</label>
                    <input
                      type="date"
                      required
                      value={izinMulai}
                      onChange={(e) => setIzinMulai(e.target.value)}
                      className="form-input"
                      style={{ fontSize: "0.84rem" }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: "0.8rem" }}>Hingga Tanggal</label>
                    <input
                      type="date"
                      required
                      value={izinSelesai}
                      onChange={(e) => setIzinSelesai(e.target.value)}
                      className="form-input"
                      style={{ fontSize: "0.84rem" }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.8rem" }}>Keterangan / Alasan</label>
                  <textarea
                    rows={3}
                    required
                    value={izinAlasan}
                    onChange={(e) => setIzinAlasan(e.target.value)}
                    placeholder="Contoh: Demam dan flu berat, istirahat sesuai saran dokter."
                    className="form-input"
                    style={{ fontSize: "0.84rem", resize: "vertical" }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.8rem" }}>
                    Lampiran Bukti (Opsional / Surat Dokter / Foto)
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          setIzinLampiran(evt.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="form-input"
                    style={{ fontSize: "0.8rem", padding: "6px" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setShowIzinModal(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={izinSubmitting}
                    className="btn btn-primary btn-sm"
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    {izinSubmitting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                    <span>Kirim Pengajuan</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
