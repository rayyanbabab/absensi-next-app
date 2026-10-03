"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import {
  Printer,
  School,
  GraduationCap,
  Users,
  Loader2,
  FileDown,
} from "lucide-react";
import { Siswa, Guru, Kelas } from "@/lib/types";

interface CardItem {
  id: number;
  nama: string;
  nomorInduk: string;
  tipeLabel: string;
  subLabel: string;
  detail: string;
  uniqueCode: string;
  qrDataUrl?: string;
}

export default function GenerateQrPage() {
  const [tipe, setTipe] = useState<"siswa" | "guru">("siswa");
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<string>("");
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resK, resS, resG] = await Promise.all([
        fetch("/api/kelas"),
        fetch("/api/siswa"),
        fetch("/api/guru"),
      ]);
      const [kData, sData, gData] = await Promise.all([
        resK.json(),
        resS.json(),
        resG.json(),
      ]);
      setKelasList(kData);

      let rawItems: CardItem[] = [];
      if (tipe === "siswa") {
        let filteredSiswa = sData;
        if (selectedKelas) {
          filteredSiswa = sData.filter((s: Siswa) => s.kelas === selectedKelas);
        }
        rawItems = filteredSiswa.map((s: Siswa) => ({
          id: s.id,
          nama: s.namaSiswa,
          nomorInduk: s.nis,
          tipeLabel: "KARTU TANDA PELAJAR",
          subLabel: s.kelas,
          detail: s.jurusan,
          uniqueCode: s.uniqueCode,
        }));
      } else {
        rawItems = gData.map((g: Guru) => ({
          id: g.id,
          nama: g.namaGuru,
          nomorInduk: g.nuptk,
          tipeLabel: "KARTU IDENTITAS GURU",
          subLabel: "Tenaga Pendidik",
          detail: g.jenisKelamin,
          uniqueCode: g.uniqueCode,
        }));
      }

      // Generate clean QR codes
      const itemsWithQr = await Promise.all(
        rawItems.map(async (item) => {
          const url = await QRCode.toDataURL(item.uniqueCode, {
            width: 180,
            margin: 1,
            color: { dark: "#0f172a", light: "#ffffff" },
          });
          return { ...item, qrDataUrl: url };
        })
      );

      setCards(itemsWithQr);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tipe, selectedKelas]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdfGrid = async () => {
    if (cards.length === 0) return;
    setExportingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const cardW = 86;
      const cardH = 54;
      const marginX = 14;
      const marginY = 16;
      const gapX = 10;
      const gapY = 12;

      const cols = 2;
      const rows = 4;
      const cardsPerPage = cols * rows;

      cards.forEach((card, idx) => {
        const cardOnPage = idx % cardsPerPage;

        if (idx > 0 && cardOnPage === 0) {
          doc.addPage();
        }

        const col = cardOnPage % cols;
        const row = Math.floor(cardOnPage / cols);

        const x = marginX + col * (cardW + gapX);
        const y = marginY + row * (cardH + gapY);

        // Card background & rounded border
        doc.setDrawColor(203, 213, 225);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, y, cardW, cardH, 2.5, 2.5, "FD");

        // Header band
        doc.setFillColor(30, 41, 59); // slate-800
        doc.rect(x, y, cardW, 11, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("SMK 1 INDONESIA", x + 5, y + 5);

        doc.setFontSize(5.5);
        doc.setFont("helvetica", "normal");
        doc.text("KARTU PRESENSI RESMI", x + 5, y + 8.5);

        // QR Code image
        if (card.qrDataUrl) {
          doc.addImage(card.qrDataUrl, "PNG", x + cardW - 30, y + 14, 25, 25);
        }

        // Student Info
        doc.setTextColor(15, 23, 42); // slate-900
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        const truncatedName = card.nama.length > 20 ? card.nama.slice(0, 20) + "..." : card.nama;
        doc.text(truncatedName, x + 5, y + 20);

        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(`${card.tipeLabel}: ${card.nomorInduk}`, x + 5, y + 26);

        if (card.subLabel) {
          doc.text(card.subLabel, x + 5, y + 31);
        }
        if (card.detail) {
          doc.text(card.detail, x + 5, y + 36);
        }

        // Bottom footer banner
        doc.setDrawColor(226, 232, 240);
        doc.line(x + 4, y + cardH - 8, x + cardW - 4, y + cardH - 8);

        doc.setFontSize(5);
        doc.setTextColor(148, 163, 184);
        doc.text("Gunakan saat pemindaian mesin presensi masuk & pulang", x + 5, y + cardH - 3.5);
      });

      doc.save(`Kartu_QR_${tipe.toUpperCase()}_A4_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Gagal mencetak dokumen PDF.");
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header toolbar */}
      <div
        className="no-print"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Cetak Kartu QR Presensi</h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Format kartu identitas standar cetak siap potong untuk siswa dan tenaga pendidik.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={handleExportPdfGrid}
            disabled={exportingPdf || cards.length === 0}
            className="btn btn-secondary btn-sm"
          >
            {exportingPdf ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <FileDown size={14} />
            )}
            <span>Unduh PDF Lembar A4 (Grid)</span>
          </button>
          <button onClick={handlePrint} className="btn btn-primary btn-sm">
            <Printer size={14} />
            <span>Cetak Semua Kartu ({cards.length})</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div
        className="app-card no-print"
        style={{
          padding: "12px 18px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Segmented Siswa / Guru switch */}
          <div
            style={{
              display: "inline-flex",
              backgroundColor: "var(--bg-subtle)",
              padding: "3px",
              borderRadius: "8px",
              border: "1px solid var(--border-app)",
            }}
          >
            <button
              onClick={() => setTipe("siswa")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "0.82rem",
                fontWeight: tipe === "siswa" ? 600 : 500,
                color: tipe === "siswa" ? "#ffffff" : "var(--text-muted)",
                backgroundColor: tipe === "siswa" ? "var(--brand-primary)" : "transparent",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <GraduationCap size={14} />
              <span>Kartu Siswa</span>
            </button>
            <button
              onClick={() => setTipe("guru")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "0.82rem",
                fontWeight: tipe === "guru" ? 600 : 500,
                color: tipe === "guru" ? "#ffffff" : "var(--text-muted)",
                backgroundColor: tipe === "guru" ? "var(--brand-primary)" : "transparent",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <Users size={14} />
              <span>Kartu Guru</span>
            </button>
          </div>

          {tipe === "siswa" && (
            <div style={{ minWidth: "160px" }}>
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="form-select"
                style={{ fontSize: "0.82rem", height: "34px" }}
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

        <span
          className="status-badge status-badge-neutral"
          style={{ fontSize: "0.74rem", padding: "4px 10px" }}
        >
          {cards.length} Kartu Siap Cetak
        </span>
      </div>

      {/* Cards Grid Preview */}
      {loading ? (
        <div className="app-card" style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
          <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 8px" }} />
          Menyiapkan format kartu identitas...
        </div>
      ) : cards.length === 0 ? (
        <div className="app-card" style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Tidak ada data kartu yang tersedia untuk ditampilkan.
        </div>
      ) : (
        <div
          id="printable-cards-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "16px",
          }}
        >
          {cards.map((c) => (
            <div
              key={c.id}
              className="id-card"
              style={{
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                color: "#0f172a",
              }}
            >
              {/* Card Header (Official Institutional Style) */}
              <div
                style={{
                  background: "#1e3a8a",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "#ffffff",
                  borderBottom: "2px solid #f59e0b",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      letterSpacing: "0.06em",
                      fontWeight: 700,
                      opacity: 0.9,
                      textTransform: "uppercase",
                    }}
                  >
                    SMK NEGERI 1 INDONESIA
                  </div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 800 }}>{c.tipeLabel}</div>
                </div>
                <School size={20} style={{ opacity: 0.9 }} />
              </div>

              {/* Card Body */}
              <div
                style={{
                  padding: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  background: "#ffffff",
                }}
              >
                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "#0f172a",
                      lineHeight: "1.2",
                    }}
                  >
                    {c.nama}
                  </div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "#475569",
                      fontFamily: "var(--font-mono)",
                      marginTop: "3px",
                    }}
                  >
                    {tipe === "siswa" ? "NIS" : "NUPTK"}: {c.nomorInduk}
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      marginTop: "6px",
                      padding: "2px 6px",
                      background: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#1e293b",
                    }}
                  >
                    {c.subLabel}
                  </div>
                  {c.detail && (
                    <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "2px" }}>
                      {c.detail}
                    </div>
                  )}
                </div>

                {/* QR Code */}
                <div
                  style={{
                    background: "#ffffff",
                    padding: "6px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    flexShrink: 0,
                    textAlign: "center",
                  }}
                >
                  {c.qrDataUrl && (
                    <img
                      src={c.qrDataUrl}
                      alt={`QR ${c.nama}`}
                      style={{ width: "80px", height: "80px", display: "block" }}
                    />
                  )}
                  <span style={{ fontSize: "0.58rem", color: "#64748b", fontWeight: 600, display: "block", marginTop: "2px" }}>
                    SCAN ABSEN
                  </span>
                </div>
              </div>

              {/* Card Footer Bar */}
              <div
                style={{
                  padding: "6px 14px",
                  background: "#f8fafc",
                  borderTop: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.68rem",
                  color: "#64748b",
                }}
              >
                <span>Sistem Presensi Resmi</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem" }}>
                  {c.uniqueCode.slice(0, 16)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Print Media Query Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          aside,
          header,
          .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
          }
          #printable-cards-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .id-card {
            border: 1px solid #000000 !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
