"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Calendar,
  Search,
  Download,
  FileText,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { PresensiGuru, Guru } from "@/lib/types";

export default function AbsenGuruPage() {
  const [presensiList, setPresensiList] = useState<PresensiGuru[]>([]);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedTanggal, setSelectedTanggal] = useState(todayStr);
  const [search, setSearch] = useState("");

  // Modal: Catat Izin / Sakit Guru
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    idGuru: 0,
    tanggal: todayStr,
    idKehadiran: 2, // 2: Sakit, 3: Izin, 4: Alfa
    keterangan: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const url = selectedTanggal
        ? `/api/presensi/guru?tanggal=${selectedTanggal}`
        : "/api/presensi/guru";
      const [resP, resG] = await Promise.all([fetch(url), fetch("/api/guru")]);
      const [p, g] = await Promise.all([resP.json(), resG.json()]);
      setPresensiList(p);
      setGuruList(g);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedTanggal]);

  const filteredData = presensiList.filter((item) => {
    return (
      (item.namaGuru || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.nuptk || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleOpenManual = () => {
    setManualForm({
      idGuru: guruList[0]?.id || 0,
      tanggal: selectedTanggal || todayStr,
      idKehadiran: 2,
      keterangan: "",
    });
    setIsManualModalOpen(true);
  };

  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.idGuru) {
      alert("Silakan pilih data guru!");
      return;
    }

    try {
      const res = await fetch("/api/presensi/guru", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manualForm),
      });

      if (res.ok) {
        setIsManualModalOpen(false);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal mencatat kehadiran guru");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportExcel = () => {
    const rows = filteredData.map((p, idx) => ({
      No: idx + 1,
      Tanggal: p.tanggal,
      NUPTK: p.nuptk,
      "Nama Guru": p.namaGuru,
      "Jam Masuk": p.jamMasuk || "-",
      "Jam Keluar": p.jamKeluar || "-",
      Status: p.kehadiran || "Hadir",
      Keterangan: p.keterangan || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Presensi Guru");
    XLSX.writeFile(workbook, `Rekap_Presensi_Guru_${selectedTanggal || "Semua"}.xlsx`);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    doc.text("Laporan Rekap Presensi Guru", 14, 15);
    doc.setFontSize(10);
    doc.text(`Tanggal: ${selectedTanggal || "Semua"} | Total: ${filteredData.length}`, 14, 22);

    const tableData = filteredData.map((p, idx) => [
      idx + 1,
      p.tanggal,
      p.nuptk || "-",
      p.namaGuru || "-",
      p.jamMasuk || "-",
      p.jamKeluar || "-",
      p.kehadiran || "Hadir",
    ]);

    autoTable(doc, {
      startY: 28,
      head: [["No", "Tanggal", "NUPTK", "Nama Guru", "Masuk", "Keluar", "Status"]],
      body: tableData,
    });

    doc.save(`Rekap_Presensi_Guru_${selectedTanggal || "Semua"}.pdf`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header & Export Actions */}
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
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Rekap Presensi Guru</h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Data riwayat absensi kehadiran, kepulangan, serta perizinan tenaga pendidik.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={handleOpenManual} className="btn btn-primary btn-sm">
            <Plus size={14} />
            <span>Catat Izin / Sakit</span>
          </button>
          <button onClick={handleExportExcel} className="btn btn-secondary btn-sm">
            <Download size={14} />
            <span>Ekspor Excel</span>
          </button>
          <button onClick={handleExportPdf} className="btn btn-secondary btn-sm">
            <FileText size={14} />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Table Presensi Guru with Integrated Toolbar */}
      <div className="app-card" style={{ padding: 0, overflow: "hidden" }}>
        {/* Integrated Toolbar Header */}
        <div className="table-toolbar-responsive">
          <div className="table-toolbar-filters">
            {/* Date Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Calendar size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              <input
                type="date"
                value={selectedTanggal}
                onChange={(e) => setSelectedTanggal(e.target.value)}
                className="form-input"
                style={{ width: "140px", fontSize: "0.82rem", height: "36px" }}
              />
            </div>

            {/* Search */}
            <div className="table-toolbar-search" style={{ position: "relative", flex: 1, minWidth: "200px", maxWidth: "340px" }}>
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: "11px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                placeholder="Cari NUPTK atau Nama guru..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "34px", fontSize: "0.82rem", height: "36px" }}
              />
            </div>
          </div>

          <div className="table-toolbar-counter">
            <span
              className="status-badge status-badge-neutral"
              style={{ fontSize: "0.74rem", padding: "4px 10px" }}
            >
              Total: {filteredData.length} Catatan
            </span>
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 8px" }} />
            Memuat data presensi guru...
          </div>
        ) : filteredData.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Belum ada catatan presensi guru pada tanggal yang dipilih.
          </div>
        ) : (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>No</th>
                  <th>Tanggal</th>
                  <th>NUPTK</th>
                  <th>Nama Guru</th>
                  <th>Jam Masuk</th>
                  <th>Jam Keluar</th>
                  <th>Status</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((p, idx) => (
                  <tr key={p.id}>
                    <td style={{ color: "var(--text-muted)" }}>{idx + 1}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>
                      {p.tanggal}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                      {p.nuptk}
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--text-main)" }}>{p.namaGuru}</td>
                    <td>
                      <span
                        style={{
                          color: "var(--color-success)",
                          fontWeight: 600,
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {p.jamMasuk || "-"}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          color: "var(--color-warning)",
                          fontWeight: 600,
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {p.jamKeluar || "-"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          p.kehadiran === "Terlambat"
                            ? "status-badge status-badge-warning"
                            : p.kehadiran === "Izin" || p.kehadiran === "Sakit"
                            ? "status-badge status-badge-info"
                            : p.kehadiran === "Tanpa keterangan"
                            ? "status-badge status-badge-danger"
                            : "status-badge status-badge-success"
                        }
                      >
                        {p.kehadiran || "Hadir"}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                      {p.keterangan || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Catat Izin / Sakit Guru */}
      {isManualModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "460px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Catat Izin / Sakit Guru</h2>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: "4px 8px" }}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveManual} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Pilih Tenaga Pendidik</label>
                <select
                  required
                  value={manualForm.idGuru}
                  onChange={(e) => setManualForm({ ...manualForm, idGuru: Number(e.target.value) })}
                  className="form-select"
                >
                  <option value={0}>Pilih nama guru...</option>
                  {guruList.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.namaGuru} ({g.nuptk})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tanggal Tidak Hadir</label>
                <input
                  type="date"
                  required
                  value={manualForm.tanggal}
                  onChange={(e) => setManualForm({ ...manualForm, tanggal: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kategori Status</label>
                <select
                  value={manualForm.idKehadiran}
                  onChange={(e) => setManualForm({ ...manualForm, idKehadiran: Number(e.target.value) })}
                  className="form-select"
                >
                  <option value={2}>Sakit (Surat Dokter)</option>
                  <option value={3}>Izin (Dinas Luar / Kepentingan Keluarga)</option>
                  <option value={4}>Tanpa Keterangan (Alfa)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Keterangan / Alasan Lengkap</label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Mengikuti diklat kurikulum dinas pendidikan luar kota."
                  value={manualForm.keterangan}
                  onChange={(e) => setManualForm({ ...manualForm, keterangan: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
