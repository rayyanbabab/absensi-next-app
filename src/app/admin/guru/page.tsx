"use client";

import { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import * as XLSX from "xlsx";
import {
  Users,
  Plus,
  Search,
  Download,
  Trash2,
  Edit2,
  QrCode,
  X,
  Loader2,
  Upload,
  CalendarCheck,
  FileSpreadsheet,
} from "lucide-react";
import { Guru } from "@/lib/types";

export default function GuruPage() {
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Feature: Import Excel
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importRows, setImportRows] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Feature: Kartu Kendali / Riwayat Presensi Individual
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyData, setHistoryData] = useState<{
    guru: Guru;
    stats: any;
    records: any[];
  } | null>(null);

  const [formData, setFormData] = useState({
    id: 0,
    nuptk: "",
    namaGuru: "",
    jenisKelamin: "Laki-laki" as "Laki-laki" | "Perempuan",
    alamat: "",
    noHp: "",
  });

  const [selectedGuruQr, setSelectedGuruQr] = useState<Guru | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/guru");
      const data = await res.json();
      setGuruList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      id: 0,
      nuptk: "",
      namaGuru: "",
      jenisKelamin: "Laki-laki",
      alamat: "",
      noHp: "",
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (guru: Guru) => {
    setFormData({
      id: guru.id,
      nuptk: guru.nuptk,
      namaGuru: guru.namaGuru,
      jenisKelamin: guru.jenisKelamin,
      alamat: guru.alamat,
      noHp: guru.noHp,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenQr = async (guru: Guru) => {
    setSelectedGuruQr(guru);
    try {
      const url = await QRCode.toDataURL(guru.uniqueCode, {
        width: 260,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      });
      setQrDataUrl(url);
      setIsQrModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenHistory = async (guru: Guru) => {
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);
    setHistoryData(null);
    try {
      const res = await fetch(`/api/presensi/guru?guruId=${guru.id}`);
      const data = await res.json();
      setHistoryData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/guru", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menambahkan guru");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/guru", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal memperbarui guru");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Hapus data guru "${nama}"?`)) return;
    try {
      const res = await fetch(`/api/guru?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportExcel = () => {
    const rows = filteredGuru.map((g, idx) => ({
      No: idx + 1,
      NUPTK: g.nuptk,
      "Nama Guru": g.namaGuru,
      "Jenis Kelamin": g.jenisKelamin,
      "No HP": g.noHp,
      Alamat: g.alamat,
      "Unique QR Code": g.uniqueCode,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Guru");
    XLSX.writeFile(workbook, `Data_Guru_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Download Template Excel Guru
  const handleDownloadTemplate = () => {
    const sample = [
      {
        NUPTK: "198501012010011001",
        "Nama Lengkap": "Budi Santoso, S.Pd.",
        "Jenis Kelamin (L/P)": "L",
        "No HP": "081234567890",
        Alamat: "Jl. Pendidikan No. 12",
      },
      {
        NUPTK: "199002022015022002",
        "Nama Lengkap": "Siti Rahmawati, M.Pd.",
        "Jenis Kelamin (L/P)": "P",
        "No HP": "081234567891",
        Alamat: "Jl. Merdeka No. 45",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Guru");
    XLSX.writeFile(wb, "Template_Import_Guru.xlsx");
  };

  // Handle File Upload for Guru
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const rawJson: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wsName]);

        const parsed = rawJson.map((row) => {
          const rawJK = String(
            row["Jenis Kelamin (L/P)"] || row["Jenis Kelamin"] || "L"
          ).toUpperCase();

          return {
            nuptk: String(row["NUPTK"] || "").trim(),
            namaGuru: String(row["Nama Lengkap"] || row["Nama Guru"] || "").trim(),
            jenisKelamin: rawJK.startsWith("P") ? "Perempuan" : "Laki-laki",
            noHp: String(row["No HP"] || "").trim(),
            alamat: String(row["Alamat"] || "").trim(),
          };
        }).filter((item) => item.nuptk && item.namaGuru);

        setImportRows(parsed);
      } catch (err: any) {
        alert("Gagal membaca file Excel: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExecuteImport = async () => {
    if (importRows.length === 0) return;
    setIsImporting(true);
    try {
      const res = await fetch("/api/guru/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: importRows }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Berhasil mengimpor ${data.inserted} data guru baru!`);
        setIsImportModalOpen(false);
        setImportRows([]);
        loadData();
      } else {
        alert(data.error || "Gagal mengimpor data guru");
      }
    } catch (e: any) {
      alert("Terjadi kesalahan: " + e.message);
    } finally {
      setIsImporting(false);
    }
  };

  const filteredGuru = guruList.filter((g) => {
    return (
      g.namaGuru.toLowerCase().includes(search.toLowerCase()) ||
      g.nuptk.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Page Title & Actions */}
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
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Data Guru</h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Daftar tenaga pendidik dan staf pengajar aktif, kartu kendali, serta impor data Excel.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={() => setIsImportModalOpen(true)} className="btn btn-secondary btn-sm">
            <Upload size={14} />
            <span>Impor Excel</span>
          </button>
          <button onClick={handleExportExcel} className="btn btn-secondary btn-sm">
            <Download size={14} />
            <span>Ekspor Excel</span>
          </button>
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <Plus size={14} />
            <span>Tambah Guru</span>
          </button>
        </div>
      </div>

      {/* Table Data Guru Card with Integrated Toolbar */}
      <div className="app-card" style={{ padding: 0, overflow: "hidden" }}>
        {/* Integrated Toolbar Header */}
        <div className="table-toolbar-responsive">
          <div className="table-toolbar-filters">
            <div className="table-toolbar-search" style={{ position: "relative", flex: 1, minWidth: "220px", maxWidth: "360px" }}>
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
              Total: {filteredGuru.length} Guru
            </span>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 8px" }} />
            Memuat data guru...
          </div>
        ) : filteredGuru.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Tidak ada data guru yang cocok dengan pencarian.
          </div>
        ) : (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>No</th>
                  <th style={{ width: "160px" }}>NUPTK</th>
                  <th>Nama Lengkap</th>
                  <th>L/P</th>
                  <th>No. WhatsApp / HP</th>
                  <th>Alamat Domisili</th>
                  <th style={{ width: "90px" }}>Kartu QR</th>
                  <th style={{ textAlign: "right", width: "130px" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuru.map((guru, idx) => (
                  <tr key={guru.id}>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{idx + 1}</td>
                    <td>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: "var(--text-main)",
                          backgroundColor: "var(--bg-subtle)",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          border: "1px solid var(--border-app)",
                        }}
                      >
                        {guru.nuptk}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
                          {guru.namaGuru}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "1px" }}>
                          Tenaga Pendidik Aktif
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: "0.78rem", color: "var(--text-body)" }}>
                      {guru.jenisKelamin === "Laki-laki" ? "L" : "P"}
                    </td>
                    <td style={{ color: "var(--text-body)", fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>
                      {guru.noHp || "-"}
                    </td>
                    <td style={{ color: "var(--text-muted)", maxWidth: "220px", fontSize: "0.78rem" }}>
                      {guru.alamat || "-"}
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenQr(guru)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "4px 8px", fontSize: "0.74rem", display: "inline-flex", gap: "4px" }}
                      >
                        <QrCode size={13} />
                        <span>Lihat</span>
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "4px" }}>
                        <button
                          onClick={() => handleOpenHistory(guru)}
                          className="btn btn-secondary btn-sm"
                          title="Kartu Kendali & Riwayat Presensi"
                          style={{ padding: "5px 7px" }}
                        >
                          <CalendarCheck size={14} style={{ color: "var(--brand-primary)" }} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(guru)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "5px 7px" }}
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(guru.id, guru.namaGuru)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "5px 7px", color: "var(--status-danger-text)" }}
                          title="Hapus"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Tambah Guru */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Tambah Data Guru</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: "4px 8px" }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">NUPTK</label>
                <input
                  type="text"
                  required
                  value={formData.nuptk}
                  onChange={(e) => setFormData({ ...formData, nuptk: e.target.value })}
                  placeholder="Contoh: 198501012010011001"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={formData.namaGuru}
                  onChange={(e) => setFormData({ ...formData, namaGuru: e.target.value })}
                  placeholder="Contoh: Budi Santoso, S.Pd."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Jenis Kelamin</label>
                <select
                  value={formData.jenisKelamin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jenisKelamin: e.target.value as "Laki-laki" | "Perempuan",
                    })
                  }
                  className="form-select"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nomor Handphone / WhatsApp</label>
                <input
                  type="text"
                  value={formData.noHp}
                  onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                  placeholder="Contoh: 081234567890"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alamat Tinggal</label>
                <textarea
                  rows={3}
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Alamat lengkap tempat tinggal"
                  className="form-textarea"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Simpan Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Guru */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Edit Data Guru</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: "4px 8px" }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">NUPTK</label>
                <input
                  type="text"
                  required
                  value={formData.nuptk}
                  onChange={(e) => setFormData({ ...formData, nuptk: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={formData.namaGuru}
                  onChange={(e) => setFormData({ ...formData, namaGuru: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Jenis Kelamin</label>
                <select
                  value={formData.jenisKelamin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jenisKelamin: e.target.value as "Laki-laki" | "Perempuan",
                    })
                  }
                  className="form-select"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nomor Handphone</label>
                <input
                  type="text"
                  value={formData.noHp}
                  onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alamat Tinggal</label>
                <textarea
                  rows={3}
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View QR Code */}
      {isQrModalOpen && selectedGuruQr && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "340px", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Kartu Presensi Guru</h2>
              <button onClick={() => setIsQrModalOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: "4px 8px" }}>
                <X size={15} />
              </button>
            </div>

            <div
              style={{
                background: "#ffffff",
                padding: "16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-app)",
                display: "inline-block",
                margin: "0 auto 14px",
              }}
            >
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt={`QR ${selectedGuruQr.namaGuru}`}
                  style={{ width: "200px", height: "200px", display: "block" }}
                />
              )}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                {selectedGuruQr.namaGuru}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
                NUPTK: {selectedGuruQr.nuptk}
              </div>
            </div>

            <a
              href={qrDataUrl}
              download={`QR_${selectedGuruQr.nuptk}_${selectedGuruQr.namaGuru}.png`}
              className="btn btn-primary btn-sm"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <Download size={14} />
              <span>Unduh File Gambar QR</span>
            </a>
          </div>
        </div>
      )}

      {/* Modal: Impor Excel Guru */}
      {isImportModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Impor Guru Massal dari Excel</h2>
              <button onClick={() => setIsImportModalOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: "4px 8px" }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div
                style={{
                  background: "var(--bg-sunken)",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-app)",
                  fontSize: "0.82rem",
                  color: "var(--text-muted)",
                }}
              >
                Gunakan template standar agar format kolom sesuai:
                <div style={{ marginTop: "6px" }}>
                  <button onClick={handleDownloadTemplate} className="btn btn-secondary btn-sm">
                    <FileSpreadsheet size={14} />
                    <span>Unduh Template Excel (.xlsx)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label">Pilih File Spreadsheet (.xlsx / .csv)</label>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="form-input"
                  style={{ fontSize: "0.82rem" }}
                />
              </div>

              {importRows.length > 0 && (
                <div style={{ fontSize: "0.82rem" }}>
                  <div style={{ fontWeight: 600, color: "var(--color-success)", marginBottom: "6px" }}>
                    ✓ Terbaca {importRows.length} data guru siap diimpor:
                  </div>
                  <div
                    style={{
                      maxHeight: "140px",
                      overflowY: "auto",
                      border: "1px solid var(--border-app)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <table className="app-table" style={{ fontSize: "0.75rem" }}>
                      <thead>
                        <tr>
                          <th>NUPTK</th>
                          <th>Nama</th>
                          <th>L/P</th>
                          <th>No. HP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importRows.slice(0, 10).map((r, i) => (
                          <tr key={i}>
                            <td>{r.nuptk}</td>
                            <td>{r.namaGuru}</td>
                            <td>{r.jenisKelamin === "Laki-laki" ? "L" : "P"}</td>
                            <td>{r.noHp || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={importRows.length === 0 || isImporting}
                  onClick={handleExecuteImport}
                  className="btn btn-primary btn-sm"
                >
                  {isImporting ? "Mengimpor..." : `Impor ${importRows.length} Guru`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Kartu Kendali & Riwayat Presensi Guru */}
      {isHistoryModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "680px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Kartu Kendali Presensi Guru</h2>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Catatan riwayat kehadiran individual tenaga pendidik
                </div>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: "4px 8px" }}>
                <X size={15} />
              </button>
            </div>

            {historyLoading ? (
              <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
                <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 8px" }} />
                Memuat riwayat kehadiran...
              </div>
            ) : historyData ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Header Profil Guru */}
                <div
                  style={{
                    background: "var(--bg-sunken)",
                    padding: "12px 16px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-app)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                      {historyData.guru.namaGuru}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      NUPTK: {historyData.guru.nuptk} &bull; Tenaga Pendidik
                    </div>
                  </div>
                  <span className="status-badge status-badge-info">
                    Tingkat Kehadiran: {historyData.stats.persentase}%
                  </span>
                </div>

                {/* Summary Stat Cards */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "10px",
                  }}
                >
                  <div style={{ padding: "10px", border: "1px solid var(--border-app)", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Hadir</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-success)" }}>
                      {historyData.stats.hadir}
                    </div>
                  </div>
                  <div style={{ padding: "10px", border: "1px solid var(--border-app)", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Sakit</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-warning)" }}>
                      {historyData.stats.sakit}
                    </div>
                  </div>
                  <div style={{ padding: "10px", border: "1px solid var(--border-app)", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Izin</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-primary)" }}>
                      {historyData.stats.izin}
                    </div>
                  </div>
                  <div style={{ padding: "10px", border: "1px solid var(--border-app)", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Alfa</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-danger)" }}>
                      {historyData.stats.alfa}
                    </div>
                  </div>
                </div>

                {/* Table Riwayat */}
                <div style={{ maxHeight: "240px", overflowY: "auto", border: "1px solid var(--border-app)", borderRadius: "var(--radius-sm)" }}>
                  <table className="app-table" style={{ fontSize: "0.78rem" }}>
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th>Masuk</th>
                        <th>Pulang</th>
                        <th>Status</th>
                        <th>Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.records.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
                            Belum ada riwayat kehadiran tercatat.
                          </td>
                        </tr>
                      ) : (
                        historyData.records.map((r, idx) => (
                          <tr key={idx}>
                            <td style={{ fontFamily: "var(--font-mono)" }}>{r.tanggal}</td>
                            <td style={{ fontFamily: "var(--font-mono)", color: "var(--color-success)" }}>
                              {r.jamMasuk || "-"}
                            </td>
                            <td style={{ fontFamily: "var(--font-mono)", color: "var(--color-warning)" }}>
                              {r.jamKeluar || "-"}
                            </td>
                            <td>
                              <span
                                className={
                                  r.idKehadiran === 1
                                    ? "status-badge status-badge-success"
                                    : r.idKehadiran === 2 || r.idKehadiran === 3
                                    ? "status-badge status-badge-warning"
                                    : "status-badge status-badge-danger"
                                }
                              >
                                {r.kehadiran}
                              </span>
                            </td>
                            <td style={{ color: "var(--text-muted)" }}>{r.keterangan || "-"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
