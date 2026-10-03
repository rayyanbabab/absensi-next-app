"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  Layers,
  CalendarCheck,
  CheckCircle,
  AlertCircle,
  QrCode,
  FileSpreadsheet,
  ArrowUpRight,
  TrendingUp,
  UserPlus,
  Clock,
  Download,
  Sparkles,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  FileWarning,
  Printer,
  ShieldAlert,
  BarChart2,
  PieChart,
} from "lucide-react";
import { generateSuratPeringatanPdf } from "@/lib/sp-generator";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSpSiswa, setSelectedSpSiswa] = useState<any>(null);
  const [customSpLevel, setCustomSpLevel] = useState<"SP1" | "SP2" | "SP3">("SP1");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("08:30 WIB s/d Selesai");

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        setStats(data);
      } catch (e) {
        console.error("Dashboard error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 20px",
          color: "var(--text-muted)",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            border: "3px solid var(--border-app)",
            borderTopColor: "var(--brand-primary)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>Memuat data ringkasan presensi...</div>
      </div>
    );
  }

  const siswaKehadiran = stats?.siswaKehadiran || { hadir: 0, sakit: 0, izin: 0, alfa: 0 };
  const guruKehadiran = stats?.guruKehadiran || { hadir: 0, sakit: 0, izin: 0, alfa: 0 };
  const trendDays = stats?.trendDays || [];

  const totalSiswa = stats?.totalSiswa || 0;
  const totalGuru = stats?.totalGuru || 0;
  const totalHadirSiswa = siswaKehadiran.hadir;
  const persentaseHadirSiswa = totalSiswa > 0 ? Math.round((totalHadirSiswa / totalSiswa) * 100) : 0;

  const maxTrend = Math.max(
    ...trendDays.map((t: any) => Math.max(t.siswa, t.guru)),
    5
  );

  // Combine recent scans for live feed
  const recentScans = [
    ...(stats?.presensiSiswaHariIni || []).map((p: any) => ({
      ...p,
      role: "Siswa",
      nama: p.namaSiswa || p.siswa?.namaSiswa || "Siswa",
      identifier: p.nis || p.siswa?.nis || "-",
    })),
    ...(stats?.presensiGuruHariIni || []).map((p: any) => ({
      ...p,
      role: "Guru",
      nama: p.namaGuru || p.guru?.namaGuru || "Guru",
      identifier: p.nuptk || p.guru?.nuptk || "-",
    })),
  ].sort((a, b) => (b.jamMasuk || "").localeCompare(a.jamMasuk || "")).slice(0, 5);

  const perJurusan = stats?.perJurusan || [];
  const peringatanSiswa = stats?.peringatanSiswa || [];

  const handleOpenSpModal = (item: any) => {
    setSelectedSpSiswa(item);
    const initialLevel = item.spLevel === "SP3" ? "SP3" : item.spLevel === "SP2" ? "SP2" : "SP1";
    setCustomSpLevel(initialLevel);
    const nextMon = new Date();
    nextMon.setDate(nextMon.getDate() + ((1 + 7 - nextMon.getDay()) % 7 || 7));
    setMeetingDate(
      nextMon.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
  };

  const handleDownloadSp = () => {
    if (!selectedSpSiswa) return;
    generateSuratPeringatanPdf({
      siswa: {
        namaSiswa: selectedSpSiswa.namaSiswa,
        nis: selectedSpSiswa.nis,
        kelas: selectedSpSiswa.kelas,
        jurusan: selectedSpSiswa.jurusan,
      },
      spLevel: customSpLevel,
      totalAlfa: selectedSpSiswa.totalAlfa,
      alfaDates: selectedSpSiswa.alfaDates || [],
      tanggalPertemuan: meetingDate,
      jamPertemuan: meetingTime,
      schoolName: stats?.settings?.schoolName || "SMK NEGERI 1 INDONESIA",
    });
    setSelectedSpSiswa(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner / Executive Summary */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
          paddingBottom: "8px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.45rem",
              fontWeight: 800,
              color: "var(--text-main)",
              letterSpacing: "-0.02em",
            }}
          >
            Ringkasan Presensi Sekolah
          </h1>
          <p
            style={{
              fontSize: "0.84rem",
              color: "var(--text-muted)",
              marginTop: "4px",
            }}
          >
            Pantau arus presensi harian, rasio kehadiran siswa dan guru, serta aktivitas scanner secara real-time.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link
            href="/"
            target="_blank"
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 600 }}
          >
            <CalendarCheck size={15} style={{ color: "var(--brand-primary)" }} />
            <span>Kamera Scanner</span>
          </Link>
          <Link
            href="/admin/siswa"
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 600 }}
          >
            <UserPlus size={15} />
            <span>Kelola Siswa</span>
          </Link>
          <Link
            href="/admin/laporan"
            className="btn btn-primary btn-sm"
            style={{ fontWeight: 600 }}
          >
            <FileSpreadsheet size={15} />
            <span>Rekap & Unduh</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
        }}
      >
        {/* Metric 1: Total Siswa */}
        <div
          className="app-card"
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-muted)",
                }}
              >
                Total Siswa
              </span>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-main)",
                }}
              >
                <GraduationCap size={16} />
              </div>
            </div>
            <div
              style={{
                fontSize: "1.9rem",
                fontWeight: 800,
                color: "var(--text-main)",
                marginTop: "8px",
                letterSpacing: "-0.03em",
                fontFamily: "var(--font-mono)",
              }}
            >
              {totalSiswa}
            </div>
          </div>
          <div
            style={{
              marginTop: "16px",
              paddingTop: "12px",
              borderTop: "1px solid var(--border-app)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.76rem",
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>Tersebar di {stats?.totalKelas || 0} kelas</span>
            <Link
              href="/admin/siswa"
              style={{
                color: "var(--brand-primary)",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              Daftar <ChevronRight size={13} />
            </Link>
          </div>
        </div>

        {/* Metric 2: Total Guru */}
        <div
          className="app-card"
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-muted)",
                }}
              >
                Guru & Tenaga Pendidik
              </span>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-main)",
                }}
              >
                <Users size={16} />
              </div>
            </div>
            <div
              style={{
                fontSize: "1.9rem",
                fontWeight: 800,
                color: "var(--text-main)",
                marginTop: "8px",
                letterSpacing: "-0.03em",
                fontFamily: "var(--font-mono)",
              }}
            >
              {totalGuru}
            </div>
          </div>
          <div
            style={{
              marginTop: "16px",
              paddingTop: "12px",
              borderTop: "1px solid var(--border-app)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.76rem",
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>{guruKehadiran.hadir} sudah hadir hari ini</span>
            <Link
              href="/admin/guru"
              style={{
                color: "var(--brand-primary)",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              Daftar <ChevronRight size={13} />
            </Link>
          </div>
        </div>

        {/* Metric 3: Rasio Kehadiran Siswa */}
        <div
          className="app-card"
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-muted)",
                }}
              >
                Tingkat Kehadiran Siswa
              </span>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "var(--status-success-bg)",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle size={16} />
              </div>
            </div>
            <div
              style={{
                fontSize: "1.9rem",
                fontWeight: 800,
                color: "#059669",
                marginTop: "8px",
                letterSpacing: "-0.03em",
                fontFamily: "var(--font-mono)",
              }}
            >
              {persentaseHadirSiswa}%
            </div>
          </div>
          <div style={{ marginTop: "16px" }}>
            <div
              style={{
                height: "6px",
                borderRadius: "9999px",
                backgroundColor: "var(--bg-subtle)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${persentaseHadirSiswa}%`,
                  height: "100%",
                  backgroundColor: "#059669",
                  borderRadius: "9999px",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <div
              style={{
                marginTop: "8px",
                fontSize: "0.74rem",
                color: "var(--text-muted)",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{totalHadirSiswa} hadir</span>
              <span>{siswaKehadiran.alfa} belum presensi</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Jam Operasional */}
        <div
          className="app-card"
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-muted)",
                }}
              >
                Jadwal Kios
              </span>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-main)",
                }}
              >
                <Clock size={16} />
              </div>
            </div>
            <div
              style={{
                fontSize: "1.45rem",
                fontWeight: 800,
                color: "var(--text-main)",
                marginTop: "10px",
                letterSpacing: "-0.01em",
              }}
            >
              06:00 – 17:00
            </div>
          </div>
          <div
            style={{
              marginTop: "16px",
              paddingTop: "12px",
              borderTop: "1px solid var(--border-app)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.76rem",
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>Batas tepat waktu: 07:15</span>
            <span className="status-badge status-badge-success" style={{ fontSize: "0.68rem" }}>
              Aktif
            </span>
          </div>
        </div>
      </div>

      {/* Middle: 7-Day Trend Chart & Breakdown */}
      <div className="dashboard-middle-grid">
        {/* Trend Bar Chart Card */}
        <div
          className="app-card"
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "var(--text-main)",
                  letterSpacing: "-0.01em",
                }}
              >
                Tren Kehadiran (7 Hari Terakhir)
              </h2>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Komparasi jumlah presensi siswa dan guru per hari
              </div>
            </div>
            <div style={{ display: "flex", gap: "14px", fontSize: "0.76rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "2px",
                    backgroundColor: "var(--brand-primary)",
                  }}
                />
                <span style={{ color: "var(--text-body)", fontWeight: 500 }}>Siswa</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "2px",
                    backgroundColor: "#10b981",
                  }}
                />
                <span style={{ color: "var(--text-body)", fontWeight: 500 }}>Guru</span>
              </div>
            </div>
          </div>

          {/* Clean Solid Bar Chart */}
          <div style={{ width: "100%", height: "210px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                height: "175px",
                borderBottom: "1px solid var(--border-app)",
                paddingBottom: "8px",
                gap: "8px",
              }}
            >
              {trendDays.map((day: any, i: number) => {
                const sHeight = maxTrend > 0 ? (day.siswa / maxTrend) * 140 : 0;
                const gHeight = maxTrend > 0 ? (day.guru / maxTrend) * 140 : 0;

                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                      height: "100%",
                      justifyContent: "flex-end",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        gap: "5px",
                        height: "140px",
                      }}
                    >
                      {/* Siswa Bar */}
                      <div
                        title={`Siswa hadir: ${day.siswa}`}
                        style={{
                          width: "14px",
                          height: `${Math.max(sHeight, 4)}px`,
                          backgroundColor: "var(--brand-primary)",
                          borderRadius: "3px 3px 0 0",
                          transition: "height 0.3s ease",
                        }}
                      />
                      {/* Guru Bar */}
                      <div
                        title={`Guru hadir: ${day.guru}`}
                        style={{
                          width: "14px",
                          height: `${Math.max(gHeight, 4)}px`,
                          backgroundColor: "#10b981",
                          borderRadius: "3px 3px 0 0",
                          transition: "height 0.3s ease",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-muted)",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Today's Status Breakdown */}
        <div
          className="app-card"
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--text-main)",
                letterSpacing: "-0.01em",
                marginBottom: "16px",
              }}
            >
              Rincian Status Hari Ini
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Siswa */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ color: "var(--text-main)" }}>Presensi Siswa</span>
                  <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>
                    {totalSiswa} total
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      backgroundColor: "var(--status-success-bg)",
                      border: "1px solid var(--status-success-border)",
                    }}
                  >
                    <div style={{ fontSize: "0.7rem", color: "var(--status-success-text)", fontWeight: 600 }}>
                      Hadir
                    </div>
                    <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--status-success-text)" }}>
                      {siswaKehadiran.hadir}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      backgroundColor: "var(--status-info-bg)",
                      border: "1px solid var(--status-info-border)",
                    }}
                  >
                    <div style={{ fontSize: "0.7rem", color: "var(--status-info-text)", fontWeight: 600 }}>
                      Izin
                    </div>
                    <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--status-info-text)" }}>
                      {siswaKehadiran.izin}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      backgroundColor: "var(--status-warning-bg)",
                      border: "1px solid var(--status-warning-border)",
                    }}
                  >
                    <div style={{ fontSize: "0.7rem", color: "var(--status-warning-text)", fontWeight: 600 }}>
                      Sakit
                    </div>
                    <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--status-warning-text)" }}>
                      {siswaKehadiran.sakit}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      backgroundColor: "var(--status-danger-bg)",
                      border: "1px solid var(--status-danger-border)",
                    }}
                  >
                    <div style={{ fontSize: "0.7rem", color: "var(--status-danger-text)", fontWeight: 600 }}>
                      Belum Hadir
                    </div>
                    <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--status-danger-text)" }}>
                      {siswaKehadiran.alfa}
                    </div>
                  </div>
                </div>
              </div>

              {/* Guru */}
              <div style={{ borderTop: "1px solid var(--border-app)", paddingTop: "14px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ color: "var(--text-main)" }}>Presensi Guru</span>
                  <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>
                    {totalGuru} total
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      backgroundColor: "var(--status-success-bg)",
                      border: "1px solid var(--status-success-border)",
                    }}
                  >
                    <div style={{ fontSize: "0.7rem", color: "var(--status-success-text)", fontWeight: 600 }}>
                      Hadir
                    </div>
                    <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--status-success-text)" }}>
                      {guruKehadiran.hadir}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      backgroundColor: "var(--status-danger-bg)",
                      border: "1px solid var(--status-danger-border)",
                    }}
                  >
                    <div style={{ fontSize: "0.7rem", color: "var(--status-danger-text)", fontWeight: 600 }}>
                      Belum Hadir
                    </div>
                    <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--status-danger-text)" }}>
                      {guruKehadiran.alfa}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Komparasi Kehadiran per Jurusan */}
      <div className="app-card" style={{ padding: "22px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <BarChart2 size={18} style={{ color: "var(--brand-primary)" }} />
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)" }}>
                Komparasi Rasio Kehadiran per Konsentrasi Keahlian (Jurusan)
              </h2>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Persentase siswa yang hadir tepat waktu pada setiap program keahlian hari ini
            </p>
          </div>
          <span className="status-badge status-badge-primary" style={{ fontSize: "0.74rem" }}>
            {perJurusan.length} Program Keahlian
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
          }}
        >
          {perJurusan.map((j: any) => (
            <div
              key={j.id}
              style={{
                padding: "14px 16px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-subtle)",
                border: "1px solid var(--border-app)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-main)", maxWidth: "160px" }}>
                  {j.jurusan}
                </span>
                <span
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    fontFamily: "var(--font-mono)",
                    color: j.persentase >= 80 ? "var(--color-success)" : j.persentase >= 60 ? "#f59e0b" : "var(--color-danger)",
                  }}
                >
                  {j.persentase}%
                </span>
              </div>

              <div
                style={{
                  width: "100%",
                  height: "6px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(0, 0, 0, 0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${j.persentase}%`,
                    height: "100%",
                    borderRadius: "999px",
                    backgroundColor: j.persentase >= 80 ? "var(--color-success)" : j.persentase >= 60 ? "#f59e0b" : "var(--color-danger)",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                <span>{j.hadir} Hadir</span>
                <span>{j.totalSiswa} Total Siswa</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Early Warning System: Leaderboard Kedisiplinan & Peringatan Dini BP/BK */}
      <div className="app-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid var(--border-app)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldAlert size={18} style={{ color: "var(--color-danger)" }} />
              <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-main)" }}>
                Early Warning System: Pemantauan Kedisiplinan & Peringatan Dini
              </h2>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Daftar siswa yang mencapai ambang batas ketidakhadiran (Alfa) atau sering terlambat untuk bimbingan konseling dan penerbitan Surat Peringatan (SP)
            </p>
          </div>

          <Link
            href="/admin/laporan"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: "0.76rem" }}
          >
            Arsip Lengkap Laporan &rarr;
          </Link>
        </div>

        {peringatanSiswa.length === 0 ? (
          <div style={{ textAlign: "center", padding: "36px 20px", color: "var(--text-muted)" }}>
            <CheckCircle size={32} style={{ color: "var(--color-success)", margin: "0 auto 8px" }} />
            <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>Tingkat Kedisiplinan Sangat Baik!</div>
            <div style={{ fontSize: "0.76rem" }}>Tidak ada siswa yang mencapai ambang batas peringatan absensi.</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="app-table">
              <thead>
                <tr>
                  <th style={{ width: "45px" }}>No</th>
                  <th>Identitas Siswa</th>
                  <th>Kelas & Jurusan</th>
                  <th>Total Alfa</th>
                  <th>Sering Terlambat</th>
                  <th>Status Kedisiplinan</th>
                  <th style={{ textAlign: "right" }}>Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {peringatanSiswa.map((item: any, idx: number) => (
                  <tr key={item.idSiswa}>
                    <td style={{ color: "var(--text-muted)" }}>{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--text-main)" }}>{item.namaSiswa}</div>
                      <div style={{ fontSize: "0.74rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                        NIS: {item.nis}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>{item.kelas}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{item.jurusan}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: "0.95rem",
                          fontFamily: "var(--font-mono)",
                          color: item.totalAlfa >= 3 ? "var(--color-danger)" : "var(--text-main)",
                        }}
                      >
                        {item.totalAlfa} Hari
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.82rem", fontFamily: "var(--font-mono)" }}>
                        {item.totalTerlambat > 0 ? `${item.totalTerlambat} Kali` : "-"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${item.spBadge}`} style={{ fontSize: "0.74rem", fontWeight: 700 }}>
                        {item.spLabel}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => handleOpenSpModal(item)}
                        className="btn btn-secondary btn-sm"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "0.76rem",
                          padding: "4px 10px",
                          borderColor: item.totalAlfa >= 3 ? "var(--color-danger)" : "var(--border-app)",
                          color: item.totalAlfa >= 3 ? "var(--color-danger)" : "var(--text-main)",
                        }}
                        title="Cetak Surat Peringatan (SP) Resmi"
                      >
                        <Printer size={13} />
                        <span>Cetak SP (PDF)</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: CETAK SURAT PERINGATAN (SP) RESMI */}
      {selectedSpSiswa && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
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
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileWarning size={20} style={{ color: "var(--color-danger)" }} />
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>
                  Penerbitan Surat Peringatan (SP)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSpSiswa(null)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--text-muted)" }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: "12px 14px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-sm)", marginBottom: "16px" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Siswa yang Dikenakan Peringatan:</div>
              <div style={{ fontSize: "1rem", fontWeight: 800, marginTop: "2px" }}>{selectedSpSiswa.namaSiswa}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                NIS: {selectedSpSiswa.nis} &bull; Kelas: {selectedSpSiswa.kelas} &bull; Total Alfa: <strong style={{ color: "var(--color-danger)" }}>{selectedSpSiswa.totalAlfa} Hari</strong>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: "0.8rem" }}>Tingkat Surat Peringatan (SP)</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  {(["SP1", "SP2", "SP3"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setCustomSpLevel(lvl)}
                      style={{
                        padding: "8px",
                        borderRadius: "var(--radius-sm)",
                        border: customSpLevel === lvl ? "2px solid var(--color-danger)" : "1px solid var(--border-app)",
                        backgroundColor: customSpLevel === lvl ? "rgba(239, 68, 68, 0.1)" : "var(--bg-surface)",
                        color: customSpLevel === lvl ? "var(--color-danger)" : "var(--text-main)",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                      }}
                    >
                      {lvl === "SP3" ? "SP-3 (Panggilan)" : lvl === "SP2" ? "SP-2 (Keras)" : "SP-1 (Awal)"}
                    </button>
                  ))}
                </div>
              </div>

              {customSpLevel === "SP3" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: "0.8rem" }}>Jadwal Pemanggilan</label>
                    <input
                      type="text"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      placeholder="Hari Senin, 6 Okt 2026"
                      className="form-input"
                      style={{ fontSize: "0.82rem" }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: "0.8rem" }}>Waktu Pertemuan</label>
                    <input
                      type="text"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      placeholder="08:30 WIB s/d Selesai"
                      className="form-input"
                      style={{ fontSize: "0.82rem" }}
                    />
                  </div>
                </div>
              )}

              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", backgroundColor: "var(--bg-subtle)", padding: "10px", borderRadius: "var(--radius-sm)" }}>
                💡 Dokumen PDF yang dihasilkan telah memenuhi standar persuratan resmi dinas sekolah, lengkap dengan kop sekolah, nomor surat otomatis, tabel tanggal alfa, klausul pembinaan, dan blok tanda tangan Kepala Sekolah & Guru BK.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
                <button
                  type="button"
                  onClick={() => setSelectedSpSiswa(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSp}
                  className="btn btn-primary btn-sm"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "var(--color-danger)", borderColor: "var(--color-danger)" }}
                >
                  <Download size={14} />
                  <span>Unduh Surat Resmi (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Presensi Feed Table */}
      <div className="app-card" style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-app)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)" }}>
              Aktivitas Presensi Terkini
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Data presensi langsung yang tercatat hari ini melalui terminal scan dan input manual.
            </div>
          </div>

          <Link
            href="/admin/absen-siswa"
            className="btn btn-ghost btn-sm"
            style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--brand-primary)" }}
          >
            Lihat Semua Presensi <ChevronRight size={13} />
          </Link>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="app-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>Peran</th>
                <th>Nama Lengkap</th>
                <th>ID / No Induk</th>
                <th>Waktu Masuk</th>
                <th>Status</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {recentScans.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                    Belum ada presensi tercatat untuk hari ini.
                  </td>
                </tr>
              ) : (
                recentScans.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <span
                        className={`status-badge ${
                          item.role === "Guru" ? "status-badge-primary" : "status-badge-neutral"
                        }`}
                        style={{ fontSize: "0.7rem", padding: "2px 8px" }}
                      >
                        {item.role}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{item.nama}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.75rem",
                          color: "var(--text-body)",
                        }}
                      >
                        {item.identifier}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", fontWeight: 600 }}>
                        {item.jamMasuk || "-"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          item.idKehadiran === 1
                            ? "status-badge-success"
                            : item.idKehadiran === 2
                            ? "status-badge-warning"
                            : item.idKehadiran === 3
                            ? "status-badge-info"
                            : "status-badge-danger"
                        }`}
                        style={{ fontSize: "0.72rem" }}
                      >
                        {item.kehadiran?.namaKehadiran || "Hadir"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        {item.keterangan || "-"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
