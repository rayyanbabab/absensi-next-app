"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Layers,
  CalendarCheck,
  QrCode,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  LogOut,
  Camera,
  School,
  ExternalLink,
  CheckCircle2,
  Menu,
  X,
  FileCheck,
  MessageSquare,
  HeartHandshake,
} from "lucide-react";
import { useEffect, useState } from "react";

interface NavGroup {
  category: string;
  items: {
    label: string;
    href: string;
    icon: any;
  }[];
}

const navGroups: NavGroup[] = [
  {
    category: "Utama",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    category: "Data Master",
    items: [
      { label: "Data Siswa", href: "/admin/siswa", icon: GraduationCap },
      { label: "Data Guru", href: "/admin/guru", icon: Users },
      { label: "Kelas & Jurusan", href: "/admin/kelas", icon: Layers },
    ],
  },
  {
    category: "Presensi & Rekap",
    items: [
      { label: "Presensi Siswa", href: "/admin/absen-siswa", icon: CalendarCheck },
      { label: "Presensi Guru", href: "/admin/absen-guru", icon: CalendarCheck },
      { label: "Pengajuan Izin", href: "/admin/izin", icon: FileCheck },
      { label: "Laporan Kehadiran", href: "/admin/laporan", icon: FileSpreadsheet },
      { label: "Cetak Kartu QR", href: "/admin/generate-qr", icon: QrCode },
    ],
  },
  {
    category: "Sistem & Notifikasi",
    items: [
      { label: "Broadcast WhatsApp", href: "/admin/broadcast", icon: MessageSquare },
      { label: "Akun Orang Tua", href: "/admin/orang-tua", icon: HeartHandshake },
      { label: "Data Petugas", href: "/admin/petugas", icon: ShieldCheck },
      { label: "Pengaturan Sistem", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("");

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleDateString("id-ID", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }) +
          " • " +
          now.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/login");
  };

  // Determine current page title
  const getCurrentPageTitle = () => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (pathname === item.href) return item.label;
      }
    }
    return "Portal Administrasi";
  };

  return (
    <div className="admin-layout-shell">
      {/* Mobile Drawer Backdrop */}
      <div
        className={`mobile-menu-backdrop ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar Drawer */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <div
          style={{
            padding: "18px 18px",
            borderBottom: "1px solid var(--border-app)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                backgroundColor: "var(--brand-primary)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 2px 4px rgba(15, 23, 42, 0.12)",
              }}
            >
              <QrCode size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "0.98rem",
                  color: "var(--text-main)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                Presensi QR
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginTop: "3px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#10b981",
                    display: "inline-block",
                  }}
                />
                <span>SMK 1 Indonesia</span>
              </div>
            </div>
          </div>

          {/* Close button inside mobile drawer */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="btn btn-ghost btn-sm"
            style={{ padding: "6px", display: mobileMenuOpen ? "inline-flex" : "none" }}
            aria-label="Tutup Menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Launch to Scanner Terminal */}
        <div style={{ padding: "14px 14px 8px 14px", flexShrink: 0 }}>
          <Link
            href="/"
            target="_blank"
            className="btn btn-secondary"
            style={{
              width: "100%",
              justifyContent: "space-between",
              fontSize: "0.82rem",
              padding: "8px 12px",
              border: "1px solid var(--border-app)",
              backgroundColor: "var(--bg-subtle)",
              fontWeight: 600,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Camera size={15} style={{ color: "var(--brand-primary)" }} />
              <span>Buka Terminal Scan</span>
            </div>
            <ExternalLink size={13} style={{ color: "var(--text-muted)" }} />
          </Link>
        </div>

        {/* Navigation Groups */}
        <nav
          className="admin-sidebar-nav"
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "8px 12px 16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            minHeight: 0,
          }}
        >
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <div
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-muted)",
                  padding: "4px 10px",
                }}
              >
                {group.category}
              </div>

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      fontSize: "0.84rem",
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "#ffffff" : "var(--text-body)",
                      backgroundColor: isActive ? "var(--brand-primary)" : "transparent",
                      transition: "all 0.15s ease",
                      boxShadow: isActive ? "0 1px 3px rgba(15, 23, 42, 0.15)" : "none",
                    }}
                  >
                    <Icon
                      size={16}
                      style={{
                        color: isActive ? "#ffffff" : "var(--text-muted)",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer with Operator Identity & Logout */}
        <div
          style={{
            padding: "14px 16px",
            borderTop: "1px solid var(--border-app)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "var(--bg-surface)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-subtle)",
                border: "1px solid var(--border-app)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "var(--text-main)",
                flexShrink: 0,
              }}
            >
              SA
            </div>
            <div style={{ minWidth: 0, overflow: "hidden" }}>
              <div
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--text-main)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Administrator
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  whiteSpace: "nowrap",
                }}
              >
                Superadmin Sekolah
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Keluar dari Aplikasi"
            className="btn btn-ghost btn-sm"
            style={{
              padding: "6px 8px",
              color: "var(--text-muted)",
              borderRadius: "6px",
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="admin-main-wrapper">
        {/* Top Header */}
        <header
          className="admin-header"
          style={{
            height: "60px",
            borderBottom: "1px solid var(--border-app)",
            backgroundColor: "var(--bg-surface)",
            padding: "0 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            gap: "12px",
          }}
        >
          {/* Left: Mobile Hamburger & Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="btn btn-ghost btn-sm mobile-hamburger-btn"
              style={{
                padding: "6px 8px",
                color: "var(--text-main)",
                borderRadius: "6px",
              }}
              title="Buka Navigasi"
              aria-label="Buka Navigasi"
            >
              <Menu size={20} />
            </button>

            <div
              style={{
                fontSize: "0.92rem",
                fontWeight: 700,
                color: "var(--text-main)",
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
              }}
            >
              {getCurrentPageTitle()}
            </div>
            <span style={{ color: "var(--border-strong)", fontSize: "0.85rem" }}>/</span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                whiteSpace: "nowrap",
              }}
            >
              <School size={13} />
              <span>SMK 1</span>
            </div>
          </div>

          {/* Right Header: Clock, Status, ThemeToggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {currentDateTime && (
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-body)",
                  fontFamily: "var(--font-mono)",
                  backgroundColor: "var(--bg-subtle)",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-app)",
                  whiteSpace: "nowrap",
                }}
              >
                {currentDateTime}
              </div>
            )}

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "#059669",
                backgroundColor: "var(--status-success-bg)",
                border: "1px solid var(--status-success-border)",
                padding: "3px 8px",
                borderRadius: "9999px",
                whiteSpace: "nowrap",
              }}
            >
              <CheckCircle2 size={12} />
              <span>Siap</span>
            </div>

            <ThemeToggle />
          </div>
        </header>

        {/* Child Pages Container */}
        <main className="admin-main-content">
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>{children}</div>
        </main>
      </div>
    </div>
  );
}
