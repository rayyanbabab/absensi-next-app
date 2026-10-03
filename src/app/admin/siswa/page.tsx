"use client";

import { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import * as XLSX from "xlsx";
import {
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
  CheckCircle,
} from "lucide-react";
import { Siswa, Kelas, Jurusan } from "@/lib/types";

export default function SiswaPage() {
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [jurusanList, setJurusanList] = useState<Jurusan[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedJurusan, setSelectedJurusan] = useState("");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Feature: Import Excel
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importRows, setImportRows] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Feature: Kartu Kendali / Riwayat Presensi Individual
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyData, setHistoryData] = useState<{
    siswa: Siswa;
    stats: any;
    records: any[];
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    id: 0,
    nis: "",
    namaSiswa: "",
    idKelas: 1,
    jenisKelamin: "Laki-laki" as "Laki-laki" | "Perempuan",
    noHp: "",
  });

  // QR Preview Modal
  const [selectedSiswaQr, setSelectedSiswaQr] = useState<Siswa | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [resSiswa, resKelas, resJurusan] = await Promise.all([
        fetch("/api/siswa"),
        fetch("/api/kelas"),
        fetch("/api/jurusan"),
      ]);
      const [siswa, kelas, jurusan] = await Promise.all([
        resSiswa.json(),
        resKelas.json(),
        resJurusan.json(),
      ]);
      setSiswaList(siswa);
      setKelasList(kelas);
      setJurusanList(jurusan);
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
      nis: "",
      namaSiswa: "",
      idKelas: kelasList[0]?.id || 1,
      jenisKelamin: "Laki-laki",
      noHp: "",
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (siswa: Siswa) => {
    setFormData({
      id: siswa.id,
      nis: siswa.nis,
      namaSiswa: siswa.namaSiswa,
      idKelas: siswa.idKelas,
      jenisKelamin: siswa.jenisKelamin,
      noHp: siswa.noHp,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenQr = async (siswa: Siswa) => {
    setSelectedSiswaQr(siswa);
    try {
      const url = await QRCode.toDataURL(siswa.uniqueCode, {
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

  const handleOpenHistory = async (siswa: Siswa) => {
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);
    setHistoryData(null);
    try {
      const res = await fetch(`/api/presensi/siswa?siswaId=${siswa.id}`);
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
      const res = await fetch("/api/siswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menambahkan siswa");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/siswa", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal memperbarui siswa");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Hapus data siswa "${nama}"?`)) return;
    try {
      const res = await fetch(`/api/siswa?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportExcel = () => {
    const rows = filteredSiswa.map((s, idx) => ({
      No: idx + 1,
      NIS: s.nis,
      "Nama Siswa": s.namaSiswa,
      Kelas: s.kelas,
      Jurusan: s.jurusan,
      "Jenis Kelamin": s.jenisKelamin,
      "No HP": s.noHp,
      "Unique QR Code": s.uniqueCode,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Siswa");
    XLSX.writeFile(
      workbook,
      `Data_Siswa_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // Download Template Excel
  const handleDownloadTemplate = () => {
    const sample = [
      {
        NIS: "2024101",
        "Nama Lengkap": "Budi Santoso",
        "Nama Kelas": kelasList[0]?.kelas || "X RPL 1",
        "Jenis Kelamin (L/P)": "L",
        "No HP / WA Ortu": "081234567890",
      },
      {
        NIS: "2024102",
        "Nama Lengkap": "Siti Nurhaliza",
        "Nama Kelas": kelasList[0]?.kelas || "X RPL 1",
        "Jenis Kelamin (L/P)": "P",
        "No HP / WA Ortu": "081234567891",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Siswa");
    XLSX.writeFile(wb, "Template_Import_Siswa.xlsx");
  };

  // Handle File Upload for Import
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

        const kelasMap = new Map<string, number>();
        kelasList.forEach((k) => kelasMap.set(k.kelas.toLowerCase().trim(), k.id));

        const parsed = rawJson.map((row) => {
          const rawKelas = String(
            row["Nama Kelas"] || row["Kelas"] || ""
          ).toLowerCase().trim();
          const idKelas = kelasMap.get(rawKelas) || kelasList[0]?.id || 1;
          const rawJK = String(
            row["Jenis Kelamin (L/P)"] || row["Jenis Kelamin"] || "L"
          ).toUpperCase();

          return {
            nis: String(row["NIS"] || "").trim(),
            namaSiswa: String(row["Nama Lengkap"] || row["Nama Siswa"] || "").trim(),
            idKelas,
            kelasNama: row["Nama Kelas"] || row["Kelas"] || kelasList[0]?.kelas,
            jenisKelamin: rawJK.startsWith("P") ? "Perempuan" : "Laki-laki",
            noHp: String(row["No HP / WA Ortu"] || row["No HP"] || "").trim(),
          };
        }).filter((item) => item.nis && item.namaSiswa);

        setImportRows(parsed);
        setImportErrors([]);
      } catch (err: any) {
        alert("Gagal membaca file Excel: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExecuteImport = async () => {
    if (importRows.length === 0) return;
    setIsImporting(true);
    setImportErrors([]);
    try {
      const res = await fetch("/api/siswa/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: importRows }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Berhasil mengimpor ${data.inserted} data siswa baru!`);
        setIsImportModalOpen(false);
        setImportRows([]);
        loadData();
      } else {
        alert(data.error || "Gagal mengimpor data");
      }
    } catch (e: any) {
      alert("Terjadi kesalahan: " + e.message);
    } finally {
      setIsImporting(false);
    }
  };

  const filteredSiswa = siswaList.filter((s) => {
    const matchSearch =
      s.namaSiswa.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.toLowerCase().includes(search.toLowerCase());
    const matchKelas = selectedKelas ? s.kelas === selectedKelas : true;
    const matchJurusan = selectedJurusan ? s.jurusan === selectedJurusan : true;
    return matchSearch && matchKelas && matchJurusan;
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
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Data Siswa</h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Daftar siswa aktif, penempatan kelas, kartu kendali kehadiran, dan impor Excel.
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
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Table Data Siswa Card with Integrated Toolbar */}
      <div className="app-card" style={{ padding: 0, overflow: "hidden" }}>
        {/* Integrated Toolbar Header */}
        <div className="table-toolbar-responsive">
          <div className="table-toolbar-filters">
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
                placeholder="Cari NIS atau Nama siswa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "34px", fontSize: "0.82rem", height: "36px" }}
              />
            </div>

            <div className="table-toolbar-select-group">
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="form-select"
                style={{ fontSize: "0.82rem", height: "36px", width: "100%" }}
              >
                <option value="">Semua Kelas</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.kelas}>
                    {k.kelas}
                  </option>
                ))}
              </select>

              <select
                value={selectedJurusan}
                onChange={(e) => setSelectedJurusan(e.target.value)}
                className="form-select"
                style={{ fontSize: "0.82rem", height: "36px", width: "100%" }}
              >
                <option value="">Semua Jurusan</option>
                {jurusanList.map((j) => (
                  <option key={j.id} value={j.jurusan}>
                    {j.jurusan}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-toolbar-counter">
            <span
              className="status-badge status-badge-neutral"
              style={{ fontSize: "0.74rem", padding: "4px 10px" }}
            >
              Total: {filteredSiswa.length} Siswa
            </span>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 8px" }} />
            Memuat data siswa...
          </div>
        ) : filteredSiswa.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Tidak ada data siswa yang cocok dengan filter atau pencarian.
          </div>
        ) : (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>No</th>
                  <th style={{ width: "130px" }}>NIS</th>
                  <th>Nama Lengkap</th>
                  <th>Kelas & Jurusan</th>
                  <th>L/P</th>
                  <th>Kontak Ortu</th>
                  <th style={{ width: "90px" }}>Kartu QR</th>
                  <th style={{ textAlign: "right", width: "130px" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredSiswa.map((siswa, idx) => (
                  <tr key={siswa.id}>
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
                        {siswa.nis}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
                          {siswa.namaSiswa}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "1px" }}>
                          {siswa.jenisKelamin}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge status-badge-info" style={{ fontSize: "0.72rem" }}>
                        {siswa.kelas || "-"}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.78rem", color: "var(--text-body)" }}>
                      {siswa.jenisKelamin === "Laki-laki" ? "L" : "P"}
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>
                      {siswa.noHp || "-"}
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenQr(siswa)}
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
                          onClick={() => handleOpenHistory(siswa)}
                          className="btn btn-secondary btn-sm"
                          title="Kartu Kendali & Riwayat Presensi"
                          style={{ padding: "5px 7px" }}
                        >
                          <CalendarCheck size={14} style={{ color: "var(--brand-primary)" }} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(siswa)}
                          className="btn btn-secondary btn-sm"
                          title="Edit"
                          style={{ padding: "5px 7px" }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(siswa.id, siswa.namaSiswa)}
                          className="btn btn-secondary btn-sm"
                          title="Hapus"
                          style={{ padding: "5px 7px", color: "var(--status-danger-text)" }}
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

      {/* Modal: Tambah Siswa */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Tambah Data Siswa</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: "4px 8px" }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Nomor Induk Siswa (NIS)</label>
                <input
                  type="text"
                  required
                  value={formData.nis}
                  onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                  placeholder="Contoh: 2024001"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={formData.namaSiswa}
                  onChange={(e) => setFormData({ ...formData, namaSiswa: e.target.value })}
                  placeholder="Contoh: Muhammad Farhan"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kelas</label>
                <select
                  value={formData.idKelas}
                  onChange={(e) =>
                    setFormData({ ...formData, idKelas: Number(e.target.value) })
                  }
                  className="form-select"
                >
                  {kelasList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.kelas} ({k.jurusan})
                    </option>
                  ))}
                </select>
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
                <label className="form-label">Nomor WhatsApp / HP Orang Tua</label>
                <input
                  type="text"
                  value={formData.noHp}
                  onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                  placeholder="Contoh: 081234567890"
                  className="form-input"
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
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Siswa */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Edit Data Siswa</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: "4px 8px" }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">NIS</label>
                <input
                  type="text"
                  required
                  value={formData.nis}
                  onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={formData.namaSiswa}
                  onChange={(e) => setFormData({ ...formData, namaSiswa: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kelas</label>
                <select
                  value={formData.idKelas}
                  onChange={(e) =>
                    setFormData({ ...formData, idKelas: Number(e.target.value) })
                  }
                  className="form-select"
                >
                  {kelasList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.kelas} ({k.jurusan})
                    </option>
                  ))}
                </select>
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
                <label className="form-label">Nomor WhatsApp / HP Orang Tua</label>
                <input
                  type="text"
                  value={formData.noHp}
                  onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                  className="form-input"
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
      {isQrModalOpen && selectedSiswaQr && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "340px", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Kartu Presensi Siswa</h2>
              <button onClick={() => setIsQrModalOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: "4px 8px" }}>
                <X size={15} />
              </button>
            </div>

            <div
              style={{
                backgroundColor: "#ffffff",
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
                  alt={`QR ${selectedSiswaQr.namaSiswa}`}
                  style={{ width: "200px", height: "200px", display: "block" }}
                />
              )}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-main)" }}>
                {selectedSiswaQr.namaSiswa}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
                NIS: {selectedSiswaQr.nis} &bull; {selectedSiswaQr.kelas}
              </div>
            </div>

            <a
              href={qrDataUrl}
              download={`QR_${selectedSiswaQr.nis}_${selectedSiswaQr.namaSiswa}.png`}
              className="btn btn-primary btn-sm"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <Download size={14} />
              <span>Unduh File Gambar QR</span>
            </a>
          </div>
        </div>
      )}

      {/* Modal: Impor Excel */}
      {isImportModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Impor Siswa Massal dari Excel</h2>
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
                    ✓ Terbaca {importRows.length} data siswa siap diimpor:
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
                          <th>NIS</th>
                          <th>Nama</th>
                          <th>Kelas</th>
                          <th>L/P</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importRows.slice(0, 10).map((r, i) => (
                          <tr key={i}>
                            <td>{r.nis}</td>
                            <td>{r.namaSiswa}</td>
                            <td>{r.kelasNama}</td>
                            <td>{r.jenisKelamin === "Laki-laki" ? "L" : "P"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {importRows.length > 10 && (
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "4px" }}>
                      ... dan {importRows.length - 10} baris lainnya.
                    </div>
                  )}
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
                  {isImporting ? "Mengimpor..." : `Impor ${importRows.length} Siswa`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Kartu Kendali & Riwayat Presensi Individual */}
      {isHistoryModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "680px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Kartu Kendali Kehadiran</h2>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Catatan riwayat presensi individual peserta didik
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
                {/* Header Profil Siswa */}
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
                      {historyData.siswa.namaSiswa}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      NIS: {historyData.siswa.nis} &bull; {historyData.siswa.kelas || "-"} ({historyData.siswa.jurusan || "-"})
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
