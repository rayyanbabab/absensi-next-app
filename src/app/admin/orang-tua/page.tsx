"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  PlusCircle,
  Key,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
  GraduationCap,
} from "lucide-react";
import { Siswa } from "@/lib/types";

interface AkunOrangTuaPopulated {
  id: number;
  username: string;
  passwordPlain?: string;
  namaOrangTua: string;
  noHp: string;
  email?: string;
  idSiswaList: number[];
  siswaList: Siswa[];
  createdAt: string;
}

export default function AdminOrangTuaPage() {
  const [list, setList] = useState<AkunOrangTuaPopulated[]>([]);
  const [allSiswa, setAllSiswa] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("123456");
  const [formNama, setFormNama] = useState("");
  const [formNoHp, setFormNoHp] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSiswaIds, setFormSiswaIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = async () => {
    try {
      const [resAkun, resSiswa] = await Promise.all([
        fetch("/api/admin/orang-tua"),
        fetch("/api/siswa"),
      ]);
      const dataAkun = await resAkun.json();
      const dataSiswa = await resSiswa.json();
      setList(Array.isArray(dataAkun) ? dataAkun : []);
      setAllSiswa(Array.isArray(dataSiswa) ? dataSiswa : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormUsername("");
    setFormPassword("123456");
    setFormNama("");
    setFormNoHp("");
    setFormEmail("");
    setFormSiswaIds([]);
    setShowModal(true);
  };

  const handleOpenEdit = (item: AkunOrangTuaPopulated) => {
    setEditingId(item.id);
    setFormUsername(item.username);
    setFormPassword(item.passwordPlain || "123456");
    setFormNama(item.namaOrangTua);
    setFormNoHp(item.noHp);
    setFormEmail(item.email || "");
    setFormSiswaIds(item.idSiswaList || []);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const url = "/api/admin/orang-tua";
      const method = editingId ? "PUT" : "POST";
      const body = {
        id: editingId || undefined,
        username: formUsername,
        password: formPassword,
        namaOrangTua: formNama,
        noHp: formNoHp,
        email: formEmail,
        idSiswaList: formSiswaIds,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const resData = await res.json();
      if (res.ok) {
        setMsg({ type: "success", text: "Data akun orang tua berhasil disimpan!" });
        setShowModal(false);
        fetchData();
      } else {
        setMsg({ type: "error", text: resData.error || "Gagal menyimpan akun orang tua." });
      }
    } catch (err: any) {
      setMsg({ type: "error", text: err?.message || "Kesalahan jaringan." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Hapus akun orang tua "${nama}"?`)) return;
    try {
      const res = await fetch(`/api/admin/orang-tua?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMsg({ type: "success", text: "Akun orang tua berhasil dihapus." });
        fetchData();
      } else {
        alert("Gagal menghapus akun.");
      }
    } catch {
      alert("Kesalahan koneksi.");
    }
  };

  const filtered = list.filter((a) => {
    const q = search.toLowerCase();
    const matchNama = a.namaOrangTua.toLowerCase().includes(q);
    const matchPhone = a.noHp.includes(q);
    const matchUser = a.username.toLowerCase().includes(q);
    const matchSiswa = (a.siswaList || []).some(
      (s) => s.namaSiswa.toLowerCase().includes(q) || s.nis.includes(q)
    );
    return matchNama || matchPhone || matchUser || matchSiswa;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Title & Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Akun Orang Tua Siswa</h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Kelola data autentikasi login wali murid, anak yang terhubung, dan sinkronisasi WhatsApp
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.85rem" }}
        >
          <PlusCircle size={15} />
          <span>Tambah Akun Orang Tua</span>
        </button>
      </div>

      {msg && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            backgroundColor: msg.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${msg.type === "success" ? "var(--color-success)" : "var(--color-danger)"}`,
            color: msg.type === "success" ? "var(--color-success)" : "var(--color-danger)",
            fontSize: "0.84rem",
          }}
        >
          {msg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="app-card" style={{ padding: "14px 18px" }}>
        <div style={{ position: "relative", maxWidth: "400px" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama wali, nomor HP, atau nama siswa..."
            className="form-input"
            style={{ paddingLeft: "34px", fontSize: "0.84rem" }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="app-card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 8px" }} />
            Memuat data akun orang tua...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)" }}>
            <Users size={36} style={{ margin: "0 auto 10px", opacity: 0.5 }} />
            <p style={{ fontSize: "0.88rem" }}>Tidak ada akun orang tua yang sesuai kriteria pencarian.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="app-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>No</th>
                  <th>Nama Wali Murid</th>
                  <th>Username / Login ID</th>
                  <th>No. WhatsApp</th>
                  <th>Siswa Terhubung</th>
                  <th>Password</th>
                  <th style={{ textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={{ color: "var(--text-muted)" }}>{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--text-main)" }}>
                        {item.namaOrangTua}
                      </div>
                      {item.email && (
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          {item.email}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.84rem", fontWeight: 600 }}>
                        {item.username}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "0.82rem" }}>
                        <Phone size={13} style={{ color: "var(--color-success)" }} />
                        <span style={{ fontFamily: "var(--font-mono)" }}>{item.noHp}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {item.siswaList && item.siswaList.length > 0 ? (
                          item.siswaList.map((s) => (
                            <span
                              key={s.id}
                              className="badge badge-primary"
                              style={{ fontSize: "0.74rem" }}
                            >
                              {s.namaSiswa} ({s.kelas})
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                            Belum terhubung
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {item.passwordPlain || "••••••"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "4px 8px" }}
                          title="Edit Akun"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.namaOrangTua)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: "4px 8px", color: "var(--color-danger)" }}
                          title="Hapus Akun"
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

      {/* CREATE / EDIT MODAL */}
      {showModal && (
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
              maxWidth: "520px",
              width: "100%",
              padding: "26px",
              borderRadius: "var(--radius-lg, 16px)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>
                {editingId ? "Edit Akun Orang Tua" : "Tambah Akun Orang Tua Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--text-muted)" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: "0.8rem" }}>Nama Lengkap Wali Murid</label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Contoh: Ibu Fatimah / Bpk. Hendra"
                  className="form-input"
                  style={{ fontSize: "0.85rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.8rem" }}>Username / ID Login</label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="Contoh: 081234567891"
                    className="form-input"
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.8rem" }}>Password</label>
                  <input
                    type="text"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="123456"
                    className="form-input"
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.8rem" }}>No. WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={formNoHp}
                    onChange={(e) => setFormNoHp(e.target.value)}
                    placeholder="Contoh: 081234567891"
                    className="form-input"
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.8rem" }}>Email (Opsional)</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="wali@gmail.com"
                    className="form-input"
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: "0.8rem" }}>
                  Hubungkan ke Siswa (Pilih satu atau lebih):
                </label>
                <div
                  style={{
                    maxHeight: "150px",
                    overflowY: "auto",
                    padding: "8px",
                    backgroundColor: "var(--bg-subtle)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-app)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {allSiswa.map((s) => {
                    const isChecked = formSiswaIds.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "0.82rem",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormSiswaIds([...formSiswaIds, s.id]);
                            } else {
                              setFormSiswaIds(formSiswaIds.filter((id) => id !== s.id));
                            }
                          }}
                        />
                        <span>
                          <strong>{s.namaSiswa}</strong> &mdash; NIS {s.nis} ({s.kelas})
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary btn-sm"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                  <span>{editingId ? "Simpan Perubahan" : "Buat Akun"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
