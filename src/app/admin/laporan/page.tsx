"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Download,
  FileText,
  GraduationCap,
  Users,
  Loader2,
  FileWarning,
  Printer,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import { Kelas, Siswa } from "@/lib/types";
import { generateSuratPeringatanPdf } from "@/lib/sp-generator";

export default function LaporanPage() {
  const [targetTipe, setTargetTipe] = useState<"siswa" | "guru">("siswa");
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelas, setSelectedKelas] = useState("");

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const today = now.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(today);

  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // SP Generator State
  const [allSiswaList, setAllSiswaList] = useState<any[]>([]);
  const [showSpModal, setShowSpModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | "">("");
  const [spLevel, setSpLevel] = useState<"SP1" | "SP2" | "SP3">("SP1");
  const [spMeetingDate, setSpMeetingDate] = useState("");
  const [spMeetingTime, setSpMeetingTime] = useState("08:30 WIB s/d Selesai");

  useEffect(() => {
    fetch("/api/kelas")
      .then((r) => r.json())
      .then((k) => setKelasList(k))
      .catch((e) => console.error(e));

    // Load siswa & presensi for SP calculation
    Promise.all([fetch("/api/siswa"), fetch("/api/presensi/siswa")])
      .then(async ([resSiswa, resPresensi]) => {
        const siswa = await resSiswa.json();
        const presensi = await resPresensi.json();
        if (Array.isArray(siswa) && Array.isArray(presensi)) {
          const populated = siswa.map((s) => {
            const alfaRecords = presensi.filter(
              (p: any) => p.idSiswa === s.id && p.idKehadiran === 4
            );
            return {
              ...s,
              totalAlfa: alfaRecords.length,
              alfaDates: alfaRecords.map((a: any) => a.tanggal),
            };
          });
          setAllSiswaList(populated);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const endpoint =
        targetTipe === "siswa" ? "/api/presensi/siswa" : "/api/presensi/guru";
      const res = await fetch(endpoint);
      const data = await res.json();

      const filtered = data.filter((item: any) => {
        const inDate = item.tanggal >= startDate && item.tanggal <= endDate;
        const inKelas =
          targetTipe === "siswa" && selectedKelas
            ? item.kelas === selectedKelas
            : true;
        return inDate && inKelas;
      });

      setDataList(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerate();
  }, [targetTipe, startDate, endDate, selectedKelas]);

  // Aggregated Stats
  const totalHadir = dataList.filter((d) => d.idKehadiran === 1).length;
  const totalSakit = dataList.filter((d) => d.idKehadiran === 2).length;
  const totalIzin = dataList.filter((d) => d.idKehadiran === 3).length;
  const totalAlfa = dataList.filter((d) => d.idKehadiran === 4).length;
  const totalSemua = dataList.length || 1;
  const persentaseHadir = Math.round((totalHadir / totalSemua) * 100);

  const handleExportExcel = () => {
    const rows = dataList.map((item, idx) => ({
      No: idx + 1,
      Tanggal: item.tanggal,
      Nomor: item.nis || item.nuptk,
      Nama: item.namaSiswa || item.namaGuru,
      Kelas: item.kelas || "Guru / Pengajar",
      "Jam Masuk": item.jamMasuk || "-",
      "Jam Keluar": item.jamKeluar || "-",
      Status: item.kehadiran || "Hadir",
      Keterangan: item.keterangan || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Absensi");
    XLSX.writeFile(
      workbook,
      `Laporan_Absensi_${targetTipe}_${startDate}_sd_${endDate}.xlsx`
    );
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("LAPORAN REKAPITULASI PRESENSI RESMI", 14, 16);
    doc.setFontSize(10);
    doc.text("SMK NEGERI 1 INDONESIA", 14, 22);
    doc.text(
      `Periode: ${startDate} s/d ${endDate} | Kategori: ${targetTipe.toUpperCase()} | Total Data: ${dataList.length}`,
      14,
      28
    );

    const tableRows = dataList.map((item, idx) => [
      idx + 1,
      item.tanggal,
      item.nis || item.nuptk || "-",
      item.namaSiswa || item.namaGuru,
      item.kelas || "Guru",
      item.jamMasuk || "-",
      item.jamKeluar || "-",
      item.kehadiran || "Hadir",
    ]);

    autoTable(doc, {
      startY: 34,
      head: [
        [
          "No",
          "Tanggal",
          "Nomor Induk",
          "Nama Lengkap",
          "Kelas / Peran",
          "Masuk",
          "Keluar",
          "Status",
        ],
      ],
      body: tableRows,
    });

    const finalY = (doc as any).lastAutoTable.finalY + 16;
    doc.text("Mengetahui,", 140, finalY);
    doc.text("Kepala SMK Negeri 1 Indonesia", 140, finalY + 6);
    doc.text("__________________________", 140, finalY + 26);
    doc.text("Dr. Hendra Wijaya, M.Pd.", 140, finalY + 32);

    doc.save(`Laporan_Presensi_${targetTipe}_${startDate}_sd_${endDate}.pdf`);
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
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Laporan Absensi</h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Rekapitulasi kehadiran berkala siswa dan tenaga pendidik untuk arsip resmi dan evaluasi.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => {
              const nextMon = new Date();
              nextMon.setDate(nextMon.getDate() + ((1 + 7 - nextMon.getDay()) % 7 || 7));
              setSpMeetingDate(
                nextMon.toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              );
              setShowSpModal(true);
            }}
            className="btn btn-secondary btn-sm"
            style={{ color: "var(--color-danger)", borderColor: "rgba(239, 68, 68, 0.3)" }}
            title="Cetak Surat Peringatan & Panggilan Orang Tua Resmi"
          >
            <FileWarning size={14} />
            <span>Cetak Surat Peringatan (SP)</span>
          </button>
          <button onClick={handleExportExcel} className="btn btn-secondary btn-sm">
            <Download size={14} />
            <span>Unduh Excel</span>
          </button>
          <button onClick={handleExportPdf} className="btn btn-primary btn-sm">
            <FileText size={14} />
            <span>Cetak Dokumen PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Parameters Card */}
      <div
        className="app-card"
        style={{
          padding: "16px 20px",
          display: "flex",
          gap: "16px",
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        {/* Tipe Segmented Control */}
        <div>
          <label className="form-label" style={{ marginBottom: "6px" }}>Kategori</label>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "3px",
              backgroundColor: "var(--bg-subtle)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-app)",
            }}
          >
            <button
              type="button"
              onClick={() => setTargetTipe("siswa")}
              style={{
                padding: "6px 14px",
                borderRadius: "calc(var(--radius-md) - 2px)",
                fontSize: "0.82rem",
                fontWeight: targetTipe === "siswa" ? 600 : 500,
                color: targetTipe === "siswa" ? "var(--text-main)" : "var(--text-muted)",
                backgroundColor: targetTipe === "siswa" ? "var(--bg-surface)" : "transparent",
                boxShadow: targetTipe === "siswa" ? "var(--shadow-xs)" : "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease",
              }}
            >
              <GraduationCap size={15} />
              <span>Siswa</span>
            </button>
            <button
              type="button"
              onClick={() => setTargetTipe("guru")}
              style={{
                padding: "6px 14px",
                borderRadius: "calc(var(--radius-md) - 2px)",
                fontSize: "0.82rem",
                fontWeight: targetTipe === "guru" ? 600 : 500,
                color: targetTipe === "guru" ? "var(--text-main)" : "var(--text-muted)",
                backgroundColor: targetTipe === "guru" ? "var(--bg-surface)" : "transparent",
                boxShadow: targetTipe === "guru" ? "var(--shadow-xs)" : "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease",
              }}
            >
              <Users size={15} />
              <span>Guru</span>
            </button>
          </div>
        </div>

        {/* Tanggal Mulai */}
        <div style={{ flex: "1 1 140px", minWidth: "130px" }}>
          <label className="form-label" style={{ marginBottom: "6px" }}>Tanggal Mulai</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-input"
            style={{ fontSize: "0.82rem", height: "36px", width: "100%" }}
          />
        </div>

        {/* Tanggal Selesai */}
        <div style={{ flex: "1 1 140px", minWidth: "130px" }}>
          <label className="form-label" style={{ marginBottom: "6px" }}>Tanggal Selesai</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-input"
            style={{ fontSize: "0.82rem", height: "36px", width: "100%" }}
          />
        </div>

        {/* Filter Kelas jika Siswa */}
        {targetTipe === "siswa" && (
          <div style={{ flex: "1 1 160px", minWidth: "150px" }}>
            <label className="form-label" style={{ marginBottom: "6px" }}>Pilih Kelas</label>
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
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "12px",
        }}
      >
        <div className="app-card" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--text-muted)" }}>Hadir</span>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-success)" }} />
          </div>
          <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--color-success)", marginTop: "4px" }}>
            {totalHadir}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Tepat waktu & tertib
          </div>
        </div>

        <div className="app-card" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--text-muted)" }}>Izin</span>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-primary)" }} />
          </div>
          <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--color-primary)", marginTop: "4px" }}>
            {totalIzin}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Surat dispensasi
          </div>
        </div>

        <div className="app-card" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--text-muted)" }}>Sakit</span>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-warning)" }} />
          </div>
          <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--color-warning)", marginTop: "4px" }}>
            {totalSakit}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Keterangan medis
          </div>
        </div>

        <div className="app-card" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--text-muted)" }}>Alfa</span>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-danger)" }} />
          </div>
          <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--color-danger)", marginTop: "4px" }}>
            {totalAlfa}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Tanpa keterangan
          </div>
        </div>

        <div className="app-card" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--text-muted)" }}>Rasio Hadir</span>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-primary)" }} />
          </div>
          <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-main)", marginTop: "4px" }}>
            {persentaseHadir}%
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Tingkat kehadiran
          </div>
        </div>
      </div>

      {/* Table Data Preview */}
      <div className="app-card" style={{ padding: "0", overflow: "hidden" }}>
        {/* Table Header Bar */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-app)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
            backgroundColor: "var(--bg-surface)",
          }}
        >
          <div>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)" }}>
              Pratinjau Data Presensi
            </span>
            <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginLeft: "8px" }}>
              Periode {startDate} s/d {endDate}
            </span>
          </div>
          <span
            className="status-badge status-badge-neutral"
            style={{ fontSize: "0.74rem", padding: "4px 10px" }}
          >
            Total: {dataList.length} Data
          </span>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 8px" }} />
            Menyusun data laporan...
          </div>
        ) : dataList.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Tidak ada riwayat presensi yang sesuai pada rentang tanggal ini.
          </div>
        ) : (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>No</th>
                  <th>Tanggal</th>
                  <th>Nomor Induk</th>
                  <th>Nama Lengkap</th>
                  <th>Kelas / Peran</th>
                  <th>Jam Masuk</th>
                  <th>Jam Keluar</th>
                  <th>Status</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {dataList.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ color: "var(--text-muted)" }}>{idx + 1}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>
                      {item.tanggal}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                      {item.nis || item.nuptk}
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--text-main)" }}>
                      {item.namaSiswa || item.namaGuru}
                    </td>
                    <td>
                      <span className="status-badge status-badge-info">
                        {item.kelas || "Guru"}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          color: "var(--color-success)",
                          fontWeight: 600,
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {item.jamMasuk || "-"}
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
                        {item.jamKeluar || "-"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          item.idKehadiran === 4
                            ? "status-badge status-badge-danger"
                            : item.idKehadiran === 2 || item.idKehadiran === 3
                            ? "status-badge status-badge-warning"
                            : "status-badge status-badge-success"
                        }
                      >
                        {item.kehadiran || "Hadir"}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                      {item.keterangan || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: GENERATOR SURAT PERINGATAN (SP) RESMI */}
      {showSpModal && (
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
              maxWidth: "520px",
              width: "100%",
              padding: "26px",
              borderRadius: "var(--radius-lg, 16px)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileWarning size={20} style={{ color: "var(--color-danger)" }} />
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>
                  Generator Surat Peringatan (SP)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSpModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--text-muted)" }}
              >
                &times;
              </button>
            </div>

            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "16px" }}>
              Pilih siswa untuk menerbitkan dokumen resmi Surat Peringatan Ketidakhadiran (SP 1, SP 2, atau SP 3 Panggilan Orang Tua) berstandar kedinasan.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: "0.8rem" }}>Pilih Siswa</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    const idVal = e.target.value ? Number(e.target.value) : "";
                    setSelectedStudentId(idVal);
                    if (idVal) {
                      const target = allSiswaList.find((s) => s.id === idVal);
                      if (target) {
                        if (target.totalAlfa >= 7) setSpLevel("SP3");
                        else if (target.totalAlfa >= 5) setSpLevel("SP2");
                        else setSpLevel("SP1");
                      }
                    }
                  }}
                  className="form-input"
                  style={{ fontSize: "0.84rem" }}
                >
                  <option value="">-- Pilih Siswa yang Dikenakan Peringatan --</option>
                  {allSiswaList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.namaSiswa} (NIS: {s.nis} - {s.kelas}) &mdash; {s.totalAlfa}x Alfa
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudentId && (
                <>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: "0.8rem" }}>Tingkat Surat Peringatan</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                      {(["SP1", "SP2", "SP3"] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSpLevel(lvl)}
                          style={{
                            padding: "8px",
                            borderRadius: "var(--radius-sm)",
                            border: spLevel === lvl ? "2px solid var(--color-danger)" : "1px solid var(--border-app)",
                            backgroundColor: spLevel === lvl ? "rgba(239, 68, 68, 0.1)" : "var(--bg-surface)",
                            color: spLevel === lvl ? "var(--color-danger)" : "var(--text-main)",
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

                  {spLevel === "SP3" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: "0.8rem" }}>Jadwal Pemanggilan</label>
                        <input
                          type="text"
                          value={spMeetingDate}
                          onChange={(e) => setSpMeetingDate(e.target.value)}
                          placeholder="Hari Senin, 6 Okt 2026"
                          className="form-input"
                          style={{ fontSize: "0.82rem" }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: "0.8rem" }}>Waktu Pertemuan</label>
                        <input
                          type="text"
                          value={spMeetingTime}
                          onChange={(e) => setSpMeetingTime(e.target.value)}
                          placeholder="08:30 WIB s/d Selesai"
                          className="form-input"
                          style={{ fontSize: "0.82rem" }}
                        />
                      </div>
                    </div>
                  )}

                  <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", backgroundColor: "var(--bg-subtle)", padding: "10px", borderRadius: "var(--radius-sm)" }}>
                    💡 Berkas PDF menyertakan kop resmi sekolah, nomor surat otomatis, tabel riwayat tanggal ketidakhadiran, klausul pemanggilan orang tua, dan blok tanda tangan Kepala Sekolah & Guru BK.
                  </div>
                </>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowSpModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!selectedStudentId}
                  onClick={() => {
                    const target = allSiswaList.find((s) => s.id === selectedStudentId);
                    if (!target) return;
                    generateSuratPeringatanPdf({
                      siswa: {
                        namaSiswa: target.namaSiswa,
                        nis: target.nis,
                        kelas: target.kelas,
                        jurusan: target.jurusan,
                      },
                      spLevel,
                      totalAlfa: target.totalAlfa || 1,
                      alfaDates: target.alfaDates || [],
                      tanggalPertemuan: spMeetingDate,
                      jamPertemuan: spMeetingTime,
                    });
                    setShowSpModal(false);
                  }}
                  className="btn btn-primary btn-sm"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: "var(--color-danger)",
                    borderColor: "var(--color-danger)",
                  }}
                >
                  <Download size={14} />
                  <span>Unduh Surat Peringatan (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
