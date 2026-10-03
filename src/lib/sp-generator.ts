import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface GenerateSpParams {
  siswa: {
    namaSiswa: string;
    nis: string;
    kelas?: string;
    jurusan?: string;
    namaOrangTua?: string;
  };
  spLevel: "SP1" | "SP2" | "SP3";
  totalAlfa: number;
  alfaDates: string[];
  nomorSurat?: string;
  tanggalPertemuan?: string;
  jamPertemuan?: string;
  schoolName?: string;
  kepalaSekolah?: string;
  nipKepalaSekolah?: string;
  waliKelas?: string;
}

export function generateSuratPeringatanPdf(params: GenerateSpParams) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const schoolName = params.schoolName || "SMK NEGERI 1 INDONESIA";
  const kepalaSekolah = params.kepalaSekolah || "Dr. Hendra Wijaya, M.Pd.";
  const nipKepalaSekolah = params.nipKepalaSekolah || "198501012010011001";
  const waliKelas = params.waliKelas || "Wali Kelas " + (params.siswa.kelas || "");

  const today = new Date();
  const todayFormatted = today.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const currentYear = today.getFullYear();

  const nomorUrut = params.nomorSurat || Math.floor(100 + Math.random() * 900).toString();
  const nomorSuratLengkap = `421.5 / ${nomorUrut} / SMKN-1 / ${currentYear}`;

  let spTitle = "SURAT PERINGATAN I (SP-1)";
  let spPerihal = "Peringatan Ketidakhadiran Siswa (SP-1)";
  if (params.spLevel === "SP2") {
    spTitle = "SURAT PERINGATAN II (SP-2)";
    spPerihal = "Peringatan Keras Ketidakhadiran Siswa (SP-2)";
  } else if (params.spLevel === "SP3") {
    spTitle = "SURAT PEMANGGILAN ORANG TUA / WALI (SP-3)";
    spPerihal = "Panggilan Wali Murid Terkait Ketidakhadiran (SP-3)";
  }

  // -------------------------------------------------------------
  // 1. KOP SURAT RESMI DINAS PENDIDIKAN
  // -------------------------------------------------------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("PEMERINTAH DAERAH PROVINSI JAWA BARAT", pageWidth / 2, 16, { align: "center" });
  doc.text("DINAS PENDIDIKAN DAN KEBUDAYAAN", pageWidth / 2, 21, { align: "center" });

  doc.setFontSize(14);
  doc.text(schoolName.toUpperCase(), pageWidth / 2, 27, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(
    "Jl. Pendidikan No. 12, Bandung, Jawa Barat | Telp: (022) 7654321 | Web: https://smkn1.sch.id",
    pageWidth / 2,
    32,
    { align: "center" }
  );

  // Decorative Double Lines
  doc.setLineWidth(0.8);
  doc.line(16, 35, pageWidth - 16, 35);
  doc.setLineWidth(0.2);
  doc.line(16, 36, pageWidth - 16, 36);

  // -------------------------------------------------------------
  // 2. NOMOR & TANGGAL SURAT
  // -------------------------------------------------------------
  let currentY = 44;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);

  doc.text(`Nomor     : ${nomorSuratLengkap}`, 18, currentY);
  doc.text(`Bandung, ${todayFormatted}`, pageWidth - 18, currentY, { align: "right" });
  currentY += 5;
  doc.text(`Lampiran : -`, 18, currentY);
  currentY += 5;
  doc.setFont("helvetica", "bold");
  doc.text(`Perihal    : ${spPerihal}`, 18, currentY);

  // -------------------------------------------------------------
  // 3. TUJUAN SURAT
  // -------------------------------------------------------------
  currentY += 10;
  doc.setFont("helvetica", "normal");
  doc.text("Kepada Yth.", 18, currentY);
  currentY += 5;
  doc.setFont("helvetica", "bold");
  doc.text(
    params.siswa.namaOrangTua
      ? `Bapak / Ibu ${params.siswa.namaOrangTua}`
      : "Bapak / Ibu Orang Tua / Wali Murid",
    18,
    currentY
  );
  currentY += 5;
  doc.setFont("helvetica", "normal");
  doc.text("di Tempat", 18, currentY);

  // -------------------------------------------------------------
  // 4. ISI SURAT & BIODATA SISWA
  // -------------------------------------------------------------
  currentY += 10;
  doc.text(
    "Dengan hormat, sehubungan dengan hasil rekapitulasi presensi elektronik kehadiran siswa di sekolah kami,",
    18,
    currentY
  );
  currentY += 5;
  doc.text("dengan ini kami memberitahukan perkembangan kedisiplinan putra/putri Bapak/Ibu sebagai berikut:", 18, currentY);

  currentY += 7;
  const bioLeft = 24;
  doc.setFont("helvetica", "normal");
  doc.text("Nama Siswa", bioLeft, currentY);
  doc.text(`:   ${params.siswa.namaSiswa}`, bioLeft + 35, currentY);
  currentY += 5;

  doc.text("Nomor Induk Siswa (NIS)", bioLeft, currentY);
  doc.text(`:   ${params.siswa.nis}`, bioLeft + 35, currentY);
  currentY += 5;

  doc.text("Kelas / Jurusan", bioLeft, currentY);
  doc.text(
    `:   ${params.siswa.kelas || "-"} (${params.siswa.jurusan || "-"})`,
    bioLeft + 35,
    currentY
  );
  currentY += 5;

  doc.text("Total Ketidakhadiran (Alfa)", bioLeft, currentY);
  doc.setFont("helvetica", "bold");
  doc.text(`:   ${params.totalAlfa} Hari Belajar Tanpa Keterangan`, bioLeft + 35, currentY);

  // -------------------------------------------------------------
  // 5. RINCIAN TANGGAL KETIDAKHADIRAN (TABEL MINI)
  // -------------------------------------------------------------
  currentY += 7;
  doc.setFont("helvetica", "normal");
  doc.text("Adapun catatan tanggal ketidakhadiran siswa yang bersangkutan tercatat pada:", 18, currentY);

  currentY += 3;
  const tableData = (params.alfaDates || []).map((tgl, idx) => [
    idx + 1,
    tgl,
    "Alfa (Tanpa Keterangan)",
    "Tidak ada surat sakit / izin dari orang tua",
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: 18, right: 18 },
    theme: "grid",
    head: [["No", "Tanggal Ketidakhadiran", "Status Kehadiran", "Catatan Verifikator"]],
    body: tableData.length > 0 ? tableData : [[1, "-", "Alfa", "Ketidakhadiran tanpa izin sah"]],
    styles: { fontSize: 8.5, cellPadding: 2 },
    headStyles: { fillColor: [40, 50, 70], textColor: [255, 255, 255], fontStyle: "bold" },
  });

  currentY = (doc as any).lastAutoTable.finalY + 7;

  // -------------------------------------------------------------
  // 6. KLAUSUL TINDAK LANJUT / JADWAL PANGGILAN
  // -------------------------------------------------------------
  doc.setFont("helvetica", "normal");
  if (params.spLevel === "SP3") {
    doc.text(
      "Mengingat ketidakhadiran telah mencapai batas maksimal pembinaan awal, maka melalui surat ini kami",
      18,
      currentY
    );
    currentY += 5;
    doc.text(
      "MENGUNDANG Bapak/Ibu Wali Murid untuk hadir ke sekolah guna musyawarah pembinaan pada:",
      18,
      currentY
    );

    currentY += 6;
    const meetingLeft = 24;
    const meetingDate = params.tanggalPertemuan || "Hari Senin berikutnya";
    const meetingTime = params.jamPertemuan || "08.30 WIB s/d Selesai";

    doc.setFont("helvetica", "normal");
    doc.text("Hari / Tanggal", meetingLeft, currentY);
    doc.setFont("helvetica", "bold");
    doc.text(`:   ${meetingDate}`, meetingLeft + 35, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.text("Waktu", meetingLeft, currentY);
    doc.setFont("helvetica", "bold");
    doc.text(`:   ${meetingTime}`, meetingLeft + 35, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.text("Tempat", meetingLeft, currentY);
    doc.text(":   Ruang Bimbingan & Konseling (BP/BK) Lt. 1", meetingLeft + 35, currentY);
    currentY += 5;

    doc.text("Menghadap", meetingLeft, currentY);
    doc.text(`:   ${waliKelas} & Tim Konseling Sekolah`, meetingLeft + 35, currentY);
    currentY += 8;
  } else {
    doc.text(
      "Kami memohon perhatian sungguh-sungguh dari Bapak/Ibu untuk memberikan motivasi dan pengawasan belajar",
      18,
      currentY
    );
    currentY += 5;
    doc.text(
      "kepada ananda di rumah agar tidak mengulangi ketidakhadiran tanpa izin yang dapat berakibat pada sanksi akademik.",
      18,
      currentY
    );
    currentY += 8;
  }

  doc.text(
    "Demikian surat ini kami sampaikan. Atas perhatian, pengertian, dan kerja sama Bapak/Ibu kami haturkan terima kasih.",
    18,
    currentY
  );

  // -------------------------------------------------------------
  // 7. BLOK TANDA TANGAN (KIRI: WALI KELAS, KANAN: KEPALA SEKOLAH)
  // -------------------------------------------------------------
  currentY += 12;
  const colLeft = 22;
  const colRight = pageWidth - 80;

  doc.setFont("helvetica", "normal");
  doc.text("Mengetahui / Memeriksa,", colLeft, currentY);
  doc.text("Kepala Sekolah,", colRight, currentY);

  currentY += 5;
  doc.text("Wali Kelas & Guru BK,", colLeft, currentY);
  doc.text(schoolName, colRight, currentY);

  currentY += 24; // Space for signature / stamp
  doc.setFont("helvetica", "bold");
  doc.text("__________________________", colLeft, currentY);
  doc.text("__________________________", colRight, currentY);

  currentY += 5;
  doc.text(waliKelas, colLeft, currentY);
  doc.text(kepalaSekolah, colRight, currentY);

  currentY += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("NIP. -", colLeft, currentY);
  doc.text(`NIP. ${nipKepalaSekolah}`, colRight, currentY);

  // Save PDF
  const cleanFileName = `Surat_Peringatan_${params.spLevel}_${params.siswa.nis}_${params.siswa.namaSiswa.replace(
    /\s+/g,
    "_"
  )}.pdf`;
  doc.save(cleanFileName);
}
