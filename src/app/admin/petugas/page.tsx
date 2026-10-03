"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, UserCheck, Key, Loader2 } from "lucide-react";
import { User } from "@/lib/types";

export default function PetugasPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/petugas")
      .then((r) => r.json())
      .then((data) => setUsers(data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Petugas & Administrator</h1>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
          Daftar akun pengelola sistem presensi, peran otorisasi, dan hak akses.
        </p>
      </div>

      <div className="app-card" style={{ padding: "0" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 8px" }} />
            Memuat data petugas...
          </div>
        ) : (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>No</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Peran / Wewenang</th>
                  <th>Status Akun</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u.id}>
                    <td style={{ color: "var(--text-muted)" }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600, color: "var(--text-main)" }}>{u.username}</td>
                    <td style={{ color: "var(--text-muted)" }}>{u.email}</td>
                    <td>
                      {u.isSuperadmin ? (
                        <span className="status-badge status-badge-info" style={{ display: "inline-flex", gap: "4px" }}>
                          <ShieldAlert size={12} />
                          <span>Super Administrator</span>
                        </span>
                      ) : (
                        <span className="status-badge status-badge-neutral" style={{ display: "inline-flex", gap: "4px" }}>
                          <UserCheck size={12} />
                          <span>Petugas Piket</span>
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="status-badge status-badge-success">Aktif</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info card */}
      <div
        className="app-card"
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          background: "var(--bg-sunken)",
        }}
      >
        <Key size={20} style={{ color: "var(--color-primary)", flexShrink: 0, marginTop: "2px" }} />
        <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          <strong style={{ color: "var(--text-main)" }}>Catatan Otorisasi Sistem:</strong>
          <br />
          Akun dengan peran <strong>Super Administrator</strong> berhak memodifikasi struktur data master sekolah, kelas, siswa, tenaga pendidik, dan pengaturan jadwal presensi. Akun <strong>Petugas Piket</strong> difokuskan untuk operasional monitor kamera pemindaian dan pemeriksaan kehadiran harian.
        </div>
      </div>
    </div>
  );
}
