"use client";

import { useEffect, useState } from "react";
import { Layers, Plus, Trash2, Edit2, X, Loader2 } from "lucide-react";
import { Kelas, Jurusan } from "@/lib/types";

export default function KelasJurusanPage() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [jurusanList, setJurusanList] = useState<Jurusan[]>([]);
  const [loading, setLoading] = useState(true);

  // Kelas Modal
  const [isKelasModalOpen, setIsKelasModalOpen] = useState(false);
  const [kelasForm, setKelasForm] = useState({ id: 0, kelas: "", idJurusan: 1 });
  const [isEditKelas, setIsEditKelas] = useState(false);

  // Jurusan Modal
  const [isJurusanModalOpen, setIsJurusanModalOpen] = useState(false);
  const [jurusanForm, setJurusanForm] = useState({ id: 0, jurusan: "" });
  const [isEditJurusan, setIsEditJurusan] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resK, resJ] = await Promise.all([
        fetch("/api/kelas"),
        fetch("/api/jurusan"),
      ]);
      const [k, j] = await Promise.all([resK.json(), resJ.json()]);
      setKelasList(k);
      setJurusanList(j);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // KELAS HANDLERS
  const handleOpenAddKelas = () => {
    setKelasForm({ id: 0, kelas: "", idJurusan: jurusanList[0]?.id || 1 });
    setIsEditKelas(false);
    setIsKelasModalOpen(true);
  };

  const handleOpenEditKelas = (k: Kelas) => {
    setKelasForm({ id: k.id, kelas: k.kelas, idJurusan: k.idJurusan });
    setIsEditKelas(true);
    setIsKelasModalOpen(true);
  };

  const handleSaveKelas = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = isEditKelas ? "PUT" : "POST";
      const res = await fetch("/api/kelas", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kelasForm),
      });
      if (res.ok) {
        setIsKelasModalOpen(false);
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteKelas = async (id: number, nama: string) => {
    if (!confirm(`Hapus kelas "${nama}"?`)) return;
    try {
      const res = await fetch(`/api/kelas?id=${id}`, { method: "DELETE" });
      if (res.ok) loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // JURUSAN HANDLERS
  const handleOpenAddJurusan = () => {
    setJurusanForm({ id: 0, jurusan: "" });
    setIsEditJurusan(false);
    setIsJurusanModalOpen(true);
  };

  const handleOpenEditJurusan = (j: Jurusan) => {
    setJurusanForm({ id: j.id, jurusan: j.jurusan });
    setIsEditJurusan(true);
    setIsJurusanModalOpen(true);
  };

  const handleSaveJurusan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = isEditJurusan ? "PUT" : "POST";
      const res = await fetch("/api/jurusan", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jurusanForm),
      });
      if (res.ok) {
        setIsJurusanModalOpen(false);
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteJurusan = async (id: number, nama: string) => {
    if (!confirm(`Hapus jurusan "${nama}"? Semua kelas di jurusan ini juga akan terhapus.`)) return;
    try {
      const res = await fetch(`/api/jurusan?id=${id}`, { method: "DELETE" });
      if (res.ok) loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Kelas & Jurusan</h1>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
          Pengaturan tingkatan rombongan belajar dan program keahlian sekolah.
        </p>
      </div>

      {loading ? (
        <div className="app-card" style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
          <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 8px" }} />
          Memuat data kelas dan jurusan...
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* Kolom Kelas */}
          <div className="app-card" style={{ padding: "0" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-app)",
              }}
            >
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Data Kelas</h2>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  {kelasList.length} Kelas Terdaftar
                </span>
              </div>
              <button onClick={handleOpenAddKelas} className="btn btn-primary btn-sm">
                <Plus size={14} />
                <span>Tambah Kelas</span>
              </button>
            </div>

            <div className="table-container">
              <table className="app-table">
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}>No</th>
                    <th>Nama Kelas</th>
                    <th>Jurusan</th>
                    <th style={{ textAlign: "right", width: "90px" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {kelasList.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "28px", color: "var(--text-muted)" }}>
                        Belum ada kelas yang didaftarkan.
                      </td>
                    </tr>
                  ) : (
                    kelasList.map((k, idx) => (
                      <tr key={k.id}>
                        <td style={{ color: "var(--text-muted)" }}>{idx + 1}</td>
                        <td style={{ fontWeight: 600 }}>{k.kelas}</td>
                        <td>
                          <span className="status-badge status-badge-info">{k.jurusan}</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "4px" }}>
                            <button
                              onClick={() => handleOpenEditKelas(k)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: "4px 8px" }}
                              title="Edit"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteKelas(k.id, k.kelas)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: "4px 8px", color: "var(--color-danger)" }}
                              title="Hapus"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kolom Jurusan */}
          <div className="app-card" style={{ padding: "0" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-app)",
              }}
            >
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Data Jurusan</h2>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  {jurusanList.length} Program Keahlian
                </span>
              </div>
              <button onClick={handleOpenAddJurusan} className="btn btn-secondary btn-sm">
                <Plus size={14} />
                <span>Tambah Jurusan</span>
              </button>
            </div>

            <div className="table-container">
              <table className="app-table">
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}>No</th>
                    <th>Nama Jurusan</th>
                    <th style={{ textAlign: "right", width: "90px" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {jurusanList.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center", padding: "28px", color: "var(--text-muted)" }}>
                        Belum ada jurusan yang didaftarkan.
                      </td>
                    </tr>
                  ) : (
                    jurusanList.map((j, idx) => (
                      <tr key={j.id}>
                        <td style={{ color: "var(--text-muted)" }}>{idx + 1}</td>
                        <td style={{ fontWeight: 600 }}>{j.jurusan}</td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "4px" }}>
                            <button
                              onClick={() => handleOpenEditJurusan(j)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: "4px 8px" }}
                              title="Edit"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteJurusan(j.id, j.jurusan)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: "4px 8px", color: "var(--color-danger)" }}
                              title="Hapus"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Kelas */}
      {isKelasModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "400px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>
                {isEditKelas ? "Edit Kelas" : "Tambah Kelas Baru"}
              </h2>
              <button onClick={() => setIsKelasModalOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: "4px 8px" }}>
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleSaveKelas} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Nama Kelas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: X RPL 1"
                  value={kelasForm.kelas}
                  onChange={(e) => setKelasForm({ ...kelasForm, kelas: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Jurusan</label>
                <select
                  value={kelasForm.idJurusan}
                  onChange={(e) =>
                    setKelasForm({ ...kelasForm, idJurusan: Number(e.target.value) })
                  }
                  className="form-select"
                >
                  {jurusanList.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.jurusan}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsKelasModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Jurusan */}
      {isJurusanModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "400px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>
                {isEditJurusan ? "Edit Jurusan" : "Tambah Jurusan Baru"}
              </h2>
              <button onClick={() => setIsJurusanModalOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: "4px 8px" }}>
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleSaveJurusan} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Nama Jurusan / Program Keahlian</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rekayasa Perangkat Lunak"
                  value={jurusanForm.jurusan}
                  onChange={(e) => setJurusanForm({ ...jurusanForm, jurusan: e.target.value })}
                  className="form-input"
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsJurusanModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
