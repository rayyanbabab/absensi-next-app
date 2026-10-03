"use client";

import { useEffect, useState } from "react";
import {
  Save,
  CheckCircle2,
  School,
  Clock,
  Loader2,
  MessageSquare,
  Send,
  AlertCircle,
} from "lucide-react";
import { GeneralSetting } from "@/lib/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<GeneralSetting>({
    id: 1,
    logo: null,
    schoolName: "",
    schoolYear: "",
    copyright: "",
    jamMasukMulai: "06:00",
    jamMasukSelesai: "07:15",
    jamPulangMulai: "15:00",
    jamPulangSelesai: "17:00",
    waGatewayEnabled: false,
    waProvider: "fonnte",
    waApiToken: "",
    waApiUrl: "https://api.fonnte.com/send",
    waMessageTemplate:
      "Pemberitahuan Presensi:\nAnanda {nama_siswa} (NIS: {nis}) telah presensi {mode} di {sekolah} pada pukul {jam} WIB ({status}).",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Test WhatsApp State
  const [testPhone, setTestPhone] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings((prev) => ({
          ...prev,
          ...data,
          waGatewayEnabled: data.waGatewayEnabled ?? false,
          waProvider: data.waProvider ?? "fonnte",
          waApiToken: data.waApiToken ?? "",
          waApiUrl:
            data.waApiUrl ||
            (data.waProvider === "wablas"
              ? "https://api.wablas.com/api/send-message"
              : "https://api.fonnte.com/send"),
          waMessageTemplate:
            data.waMessageTemplate ||
            "Pemberitahuan Presensi:\nAnanda {nama_siswa} (NIS: {nis}) telah presensi {mode} di {sekolah} pada pukul {jam} WIB ({status}).",
        }));
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleTestWhatsApp = async () => {
    if (!testPhone) {
      alert("Masukkan nomor WhatsApp uji coba terlebih dahulu!");
      return;
    }
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings/test-wa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPhone: testPhone }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ success: true, message: data.message });
      } else {
        setTestResult({
          success: false,
          message: data.error || "Gagal mengirim pesan uji coba.",
        });
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message });
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-card" style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
        <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 8px" }} />
        Memuat konfigurasi sistem...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Pengaturan Umum & Integrasi</h1>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
          Konfigurasi identitas sekolah, aturan jam presensi, dan notifikasi WhatsApp Gateway ke orang tua.
        </p>
      </div>

      {savedSuccess && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 16px",
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid var(--color-success)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-success)",
            fontSize: "0.85rem",
          }}
        >
          <CheckCircle2 size={16} />
          <span>Pengaturan berhasil disimpan dan langsung diterapkan ke seluruh sistem.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Identitas Sekolah */}
        <div className="app-card" style={{ padding: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
              paddingBottom: "10px",
              borderBottom: "1px solid var(--border-app)",
            }}
          >
            <School size={18} style={{ color: "var(--color-primary)" }} />
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Identitas Sekolah</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="form-group">
              <label className="form-label">Nama Sekolah / Lembaga</label>
              <input
                type="text"
                required
                value={settings.schoolName}
                onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                className="form-input"
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px",
              }}
            >
              <div className="form-group">
                <label className="form-label">Tahun Pelajaran</label>
                <input
                  type="text"
                  required
                  value={settings.schoolYear}
                  onChange={(e) => setSettings({ ...settings, schoolYear: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Teks Hak Cipta Footer</label>
                <input
                  type="text"
                  value={settings.copyright}
                  onChange={(e) => setSettings({ ...settings, copyright: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Konfigurasi Jam Presensi */}
        <div className="app-card" style={{ padding: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
              paddingBottom: "10px",
              borderBottom: "1px solid var(--border-app)",
            }}
          >
            <Clock size={18} style={{ color: "var(--color-warning)" }} />
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Jadwal Presensi Masuk & Pulang</h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            {/* Jam Masuk */}
            <div
              style={{
                background: "var(--bg-sunken)",
                padding: "16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-app)",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "var(--text-main)",
                  marginBottom: "12px",
                }}
              >
                Aturan Jam Masuk
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div className="form-group">
                  <label className="form-label">Mulai Buka Scan</label>
                  <input
                    type="time"
                    value={settings.jamMasukMulai}
                    onChange={(e) => setSettings({ ...settings, jamMasukMulai: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Batas Tepat Waktu</label>
                  <input
                    type="time"
                    value={settings.jamMasukSelesai}
                    onChange={(e) => setSettings({ ...settings, jamMasukSelesai: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Jam Pulang */}
            <div
              style={{
                background: "var(--bg-sunken)",
                padding: "16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-app)",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "var(--text-main)",
                  marginBottom: "12px",
                }}
              >
                Aturan Jam Pulang
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div className="form-group">
                  <label className="form-label">Mulai Buka Scan Pulang</label>
                  <input
                    type="time"
                    value={settings.jamPulangMulai}
                    onChange={(e) => setSettings({ ...settings, jamPulangMulai: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Batas Akhir Scan Pulang</label>
                  <input
                    type="time"
                    value={settings.jamPulangSelesai}
                    onChange={(e) => setSettings({ ...settings, jamPulangSelesai: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Konfigurasi WhatsApp Gateway */}
        <div className="app-card" style={{ padding: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
              paddingBottom: "10px",
              borderBottom: "1px solid var(--border-app)",
            }}
          >
            <MessageSquare size={18} style={{ color: "var(--color-success)" }} />
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Integrasi WhatsApp Gateway</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Toggle Gateway */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                userSelect: "none",
                fontSize: "0.88rem",
                fontWeight: 600,
                color: "var(--text-main)",
              }}
            >
              <input
                type="checkbox"
                checked={settings.waGatewayEnabled ?? false}
                onChange={(e) =>
                  setSettings({ ...settings, waGatewayEnabled: e.target.checked })
                }
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              <span>Aktifkan Pengiriman Notifikasi WhatsApp ke Nomor Orang Tua</span>
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px",
              }}
            >
              <div className="form-group">
                <label className="form-label">Penyedia Layanan (Provider)</label>
                <select
                  value={settings.waProvider || "fonnte"}
                  onChange={(e) => {
                    const prov = e.target.value as "fonnte" | "wablas" | "custom";
                    setSettings({
                      ...settings,
                      waProvider: prov,
                      waApiUrl:
                        prov === "fonnte"
                          ? "https://api.fonnte.com/send"
                          : prov === "wablas"
                          ? "https://api.wablas.com/api/send-message"
                          : settings.waApiUrl || "",
                    });
                  }}
                  className="form-select"
                >
                  <option value="fonnte">Fonnte (Rekomendasi Indonesia)</option>
                  <option value="wablas">Wablas Gateway</option>
                  <option value="custom">Kustom HTTP Webhook Endpoint</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">API Token / Secret Key</label>
                <input
                  type="password"
                  placeholder="Masukkan token dari penyedia gateway"
                  value={settings.waApiToken || ""}
                  onChange={(e) => setSettings({ ...settings, waApiToken: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Endpoint URL Gateway</label>
              <input
                type="text"
                placeholder="https://api.fonnte.com/send"
                value={settings.waApiUrl || ""}
                onChange={(e) => setSettings({ ...settings, waApiUrl: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Template Pesan WhatsApp</label>
              <textarea
                rows={3}
                value={settings.waMessageTemplate || ""}
                onChange={(e) =>
                  setSettings({ ...settings, waMessageTemplate: e.target.value })
                }
                className="form-textarea"
                placeholder="Template format pesan..."
              />
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  marginTop: "4px",
                  lineHeight: 1.4,
                }}
              >
                Variabel yang tersedia: <code>{"{nama_siswa}"}</code>, <code>{"{nis}"}</code>, <code>{"{mode}"}</code> (Masuk/Pulang), <code>{"{jam}"}</code>, <code>{"{status}"}</code>, <code>{"{sekolah}"}</code>.
              </div>
            </div>

            {/* Test WhatsApp Container */}
            <div
              style={{
                marginTop: "6px",
                padding: "14px 16px",
                background: "var(--bg-sunken)",
                border: "1px solid var(--border-app)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-main)" }}>
                Uji Coba Pengiriman WhatsApp
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="Nomor tujuan (Contoh: 081234567890)"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="form-input"
                  style={{ flex: "1 1 200px", maxWidth: "340px", fontSize: "0.82rem", height: "36px" }}
                />
                <button
                  type="button"
                  onClick={handleTestWhatsApp}
                  disabled={testLoading}
                  className="btn btn-secondary btn-sm"
                  style={{ height: "36px" }}
                >
                  <Send size={13} />
                  <span>{testLoading ? "Mengirim..." : "Kirim Pesan Tes"}</span>
                </button>
              </div>

              {testResult && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    color: testResult.success
                      ? "var(--color-success)"
                      : "var(--color-danger)",
                  }}
                >
                  {testResult.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ padding: "10px 22px", fontSize: "0.85rem" }}
          >
            <Save size={15} />
            <span>{saving ? "Menyimpan..." : "Simpan Semua Pengaturan"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
