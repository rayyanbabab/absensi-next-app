"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Loader2,
  X,
  Filter,
} from "lucide-react";
import { PengajuanIzin } from "@/lib/types";

export default function AdminIzinPage() {
  const [list, setList] = useState<PengajuanIzin[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Modal View Detail
  const [selectedItem, setSelectedItem] = useState<PengajuanIzin | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const url = statusFilter === "Semua" ? "/api/izin" : `/api/izin?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleAction = async (id: number, status: "Disetujui" | "Ditolak") => {
    const confirmMsg =
      status === "Disetujui"
        ? "Setujui pengajuan izin ini? Sistem akan otomatis mencatat presensi siswa sesuai rentang tanggal tersebut."
        : "Tolak pengajuan izin ini?";

    if (!confirm(confirmMsg)) return;

    setActionLoading(id);
    try {
      const res = await fetch("/api/izin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        if (selectedItem?.id === id) setSelectedItem(null);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal memproses aksi.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Title */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Persetujuan Izin & Sakit Online</h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Daftar permohonan surat izin dan sakit siswa yang diajukan secara digital dari portal mandiri.
          </p>
        </div>

        {/* Status Filter Pills */}
        <div
          style={{
            display: "inline-flex",
            backgroundColor: "var(--bg-subtle)",
            padding: "3px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-app)",
          }}
        >
          {["Semua", "Menunggu", "Disetujui", "Ditolak"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              style={{
                padding: "6px 12px",
                borderRadius: "calc(var(--radius-md) - 2px)",
                fontSize: "0.8rem",
                fontWeight: statusFilter === tab ? 600 : 500,
                color: statusFilter === tab ? "var(--text-main)" : "var(--text-muted)",
                backgroundColor: statusFilter === tab ? "var(--bg-surface)" : "transparent",
                boxShadow: statusFilter === tab ? "var(--shadow-xs)" : "none",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Card */}
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
          <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>
            Pengajuan Izin Masuk
          </div>
          <span className="status-badge status-badge-neutral" style={{ fontSize: "0.74rem" }}>
            Total: {list.length} Pengajuan
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 8px" }} />
            Memuat pengajuan izin...
          </div>
        ) : list.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Tidak ada permohonan izin dengan status yang dipilih.
          </div>
        ) : (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th style={{ width: "45px" }}>No</th>
                  <th>Tanggal Pengajuan</th>
                  <th>Siswa</th>
                  <th>Kelas</th>
                  <th>Kategori</th>
                  <th>Rentang Waktu</th>
                  <th>Alasan</th>
                  <th>Lampiran</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right", width: "130px" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{idx + 1}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
                      {item.createdAt.slice(0, 10)}
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
                          {item.namaSiswa}
                        </div>
                        <div style={{ fontSize: "0.74rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                          NIS: {item.nis}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge status-badge-info">{item.kelas}</span>
                    </td>
                    <td>
                      <span
                        className={
                          item.tipe === "Sakit"
                            ? "status-badge status-badge-warning"
                            : "status-badge status-badge-info"
                        }
                      >
                        {item.tipe}
                      </span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
                      {item.tanggalMulai} s/d {item.tanggalSelesai}
                    </td>
                    <td style={{ maxWidth: "200px", fontSize: "0.8rem", color: "var(--text-main)" }}>
                      <span className="truncate block">{item.alasan}</span>
                    </td>
                    <td>
                      {item.lampiranUrl ? (
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "3px 8px", fontSize: "0.74rem" }}
                        >
                          <Eye size={12} />
                          <span>Lihat</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>-</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={
                          item.status === "Disetujui"
                            ? "status-badge status-badge-success"
                            : item.status === "Ditolak"
                            ? "status-badge status-badge-danger"
                            : "status-badge status-badge-warning"
                        }
                      >
                        {item.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {item.status === "Menunggu" ? (
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            onClick={() => handleAction(item.id, "Disetujui")}
                            disabled={actionLoading === item.id}
                            className="btn btn-primary btn-sm"
                            style={{ padding: "4px 8px" }}
                            title="Setujui Izin"
                          >
                            <CheckCircle size={13} />
                            <span>Setujui</span>
                          </button>
                          <button
                            onClick={() => handleAction(item.id, "Ditolak")}
                            disabled={actionLoading === item.id}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: "4px 8px", color: "var(--color-danger)" }}
                            title="Tolak Izin"
                          >
                            <XCircle size={13} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          Selesai
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal View Detail & Lampiran */}
      {selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "520px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Detail Pengajuan Izin</h2>
              <button onClick={() => setSelectedItem(null)} className="btn btn-secondary btn-sm" style={{ padding: "4px 8px" }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Siswa:</span>{" "}
                <strong>{selectedItem.namaSiswa}</strong> (NIS: {selectedItem.nis})
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Kelas & Jurusan:</span>{" "}
                <strong>{selectedItem.kelas}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Periode:</span>{" "}
                <strong>{selectedItem.tanggalMulai}</strong> s/d <strong>{selectedItem.tanggalSelesai}</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)" }}>Alasan:</span>
                <p style={{ marginTop: "4px", padding: "10px", backgroundColor: "var(--bg-sunken)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-app)" }}>
                  {selectedItem.alasan}
                </p>
              </div>

              {selectedItem.lampiranUrl && (
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Lampiran Bukti:</span>
                  <img
                    src={selectedItem.lampiranUrl}
                    alt="Lampiran Surat"
                    style={{
                      maxHeight: "260px",
                      width: "100%",
                      objectFit: "contain",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-app)",
                    }}
                  />
                </div>
              )}

              {selectedItem.status === "Menunggu" && (
                <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                  <button
                    onClick={() => handleAction(selectedItem.id, "Disetujui")}
                    disabled={actionLoading === selectedItem.id}
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    <CheckCircle size={15} />
                    <span>Setujui Pengajuan</span>
                  </button>
                  <button
                    onClick={() => handleAction(selectedItem.id, "Ditolak")}
                    disabled={actionLoading === selectedItem.id}
                    className="btn btn-secondary"
                    style={{ color: "var(--color-danger)" }}
                  >
                    <XCircle size={15} />
                    <span>Tolak</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
