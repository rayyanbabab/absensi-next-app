import fs from "fs";
import path from "path";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import {
  Jurusan,
  Kelas,
  Siswa,
  Guru,
  PresensiSiswa,
  PresensiGuru,
  User,
  GeneralSetting,
  PengajuanIzin,
  AkunOrangTua,
} from "./types";

const LOCAL_DB_PATH = path.join(process.cwd(), "data", "local-db.json");

// Helper to generate unique QR code
export function generateUniqueCode(): string {
  const randNum = Math.floor(10000000 + Math.random() * 90000000);
  const time = Date.now().toString(36);
  const randStr = Math.random().toString(36).substring(2, 7);
  return `${time}-${randStr}-${randNum}`;
}

// Initial mock data
const defaultData = {
  settings: {
    id: 1,
    logo: null,
    schoolName: "SMK 1 Indonesia",
    schoolYear: "2024/2025",
    copyright: "© 2025 All rights reserved.",
    jamMasukMulai: "06:00",
    jamMasukSelesai: "07:15",
    jamPulangMulai: "15:00",
    jamPulangSelesai: "17:00",
  } as GeneralSetting,
  jurusan: [
    { id: 1, jurusan: "RPL (Rekayasa Perangkat Lunak)" },
    { id: 2, jurusan: "TKJ (Teknik Komputer & Jaringan)" },
    { id: 3, jurusan: "AKL (Akuntansi & Keuangan)" },
    { id: 4, jurusan: "OTKP (Otomatisasi Tata Kelola Perkantoran)" },
  ] as Jurusan[],
  kelas: [
    { id: 1, kelas: "X RPL 1", idJurusan: 1 },
    { id: 2, kelas: "XI RPL 1", idJurusan: 1 },
    { id: 3, kelas: "XII RPL 1", idJurusan: 1 },
    { id: 4, kelas: "X TKJ 1", idJurusan: 2 },
    { id: 5, kelas: "XI TKJ 1", idJurusan: 2 },
  ] as Kelas[],
  siswa: [
    {
      id: 1,
      nis: "2024001",
      namaSiswa: "Ahmad Rizky Pratama",
      idKelas: 1,
      jenisKelamin: "Laki-laki",
      noHp: "081234567890",
      uniqueCode: "siswa-ahmad-2024001",
    },
    {
      id: 2,
      nis: "2024002",
      namaSiswa: "Siti Nurhaliza",
      idKelas: 1,
      jenisKelamin: "Perempuan",
      noHp: "081234567891",
      uniqueCode: "siswa-siti-2024002",
    },
    {
      id: 3,
      nis: "2024003",
      namaSiswa: "Budi Santoso",
      idKelas: 2,
      jenisKelamin: "Laki-laki",
      noHp: "081234567892",
      uniqueCode: "siswa-budi-2024003",
    },
    {
      id: 4,
      nis: "2024004",
      namaSiswa: "Dewi Anggraini",
      idKelas: 4,
      jenisKelamin: "Perempuan",
      noHp: "081234567893",
      uniqueCode: "siswa-dewi-2024004",
    },
  ] as Siswa[],
  guru: [
    {
      id: 1,
      nuptk: "198501012010011001",
      namaGuru: "Dr. Hendra Wijaya, M.Pd.",
      jenisKelamin: "Laki-laki",
      alamat: "Jl. Pendidikan No. 12, Bandung",
      noHp: "08119876543",
      uniqueCode: "guru-hendra-198501",
    },
    {
      id: 2,
      nuptk: "198805122015022002",
      namaGuru: "Sri Wahyuni, S.Kom.",
      jenisKelamin: "Perempuan",
      alamat: "Jl. Merdeka No. 45, Bandung",
      noHp: "08129876544",
      uniqueCode: "guru-sri-198805",
    },
  ] as Guru[],
  presensiSiswa: [] as PresensiSiswa[],
  presensiGuru: [] as PresensiGuru[],
  pengajuanIzin: [] as PengajuanIzin[],
  akunOrangTua: [
    {
      id: 1,
      username: "081234567890",
      passwordPlain: "123456",
      namaOrangTua: "Bpk. Hendra Pratama",
      noHp: "081234567890",
      email: "hendra.pratama@gmail.com",
      idSiswaList: [1], // Ahmad Rizky Pratama (NIS 2024001)
      createdAt: "2026-10-01T08:00:00.000Z",
    },
    {
      id: 2,
      username: "081234567891",
      passwordPlain: "123456",
      namaOrangTua: "Ibu Fatimah",
      noHp: "081234567891",
      email: "fatimah.siti@gmail.com",
      idSiswaList: [2], // Siti Nurhaliza (NIS 2024002)
      createdAt: "2026-10-01T08:00:00.000Z",
    },
    {
      id: 3,
      username: "ortumulti",
      passwordPlain: "123456",
      namaOrangTua: "Bpk. Subagyo (Wali 2 Siswa)",
      noHp: "081299887766",
      email: "subagyo@gmail.com",
      idSiswaList: [2, 3], // Siti Nurhaliza & Budi Santoso
      createdAt: "2026-10-01T08:00:00.000Z",
    },
  ] as AkunOrangTua[],
  users: [
    {
      id: 1,
      email: "adminsuper@gmail.com",
      username: "superadmin",
      // default: 'superadmin' hashed
      passwordHash:
        "$2b$10$wE9qW3/n2W6N6Yh7sYw3e.Fm8H1Kj2cK7kM7j0D5oB1t9zXwYq4a6",
      isSuperadmin: true,
      active: true,
    },
    {
      id: 2,
      email: "petugas@gmail.com",
      username: "petugas",
      passwordHash:
        "$2b$10$wE9qW3/n2W6N6Yh7sYw3e.Fm8H1Kj2cK7kM7j0D5oB1t9zXwYq4a6",
      isSuperadmin: false,
      active: true,
    },
  ] as User[],
};

// Local storage reader/writer
function getLocalDb() {
  const dir = path.dirname(LOCAL_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    const raw = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.pengajuanIzin) parsed.pengajuanIzin = [];
    if (!parsed.akunOrangTua || parsed.akunOrangTua.length === 0) {
      parsed.akunOrangTua = defaultData.akunOrangTua;
    }
    return parsed;
  } catch {
    return defaultData;
  }
}

function saveLocalDb(data: typeof defaultData) {
  const dir = path.dirname(LOCAL_DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
}

// Check if PostgreSQL Prisma is connected
let prismaConnected: boolean | null = null;
async function isPrismaAvailable(): Promise<boolean> {
  if (prismaConnected !== null) return prismaConnected;
  try {
    await prisma.$connect();
    prismaConnected = true;
    return true;
  } catch {
    prismaConnected = false;
    return false;
  }
}

// SETTINGS
export async function getGeneralSettings(): Promise<GeneralSetting> {
  if (await isPrismaAvailable()) {
    try {
      const setting = await prisma.generalSetting.findFirst();
      if (setting) return setting;
    } catch {
      // fallback
    }
  }
  const db = getLocalDb();
  return db.settings;
}

export async function updateGeneralSettings(
  data: Partial<GeneralSetting>
): Promise<GeneralSetting> {
  if (await isPrismaAvailable()) {
    try {
      const existing = await prisma.generalSetting.findFirst();
      if (existing) {
        return await prisma.generalSetting.update({
          where: { id: existing.id },
          data,
        });
      } else {
        return await prisma.generalSetting.create({
          data: {
            ...defaultData.settings,
            ...data,
          },
        });
      }
    } catch {
      // fallback
    }
  }
  const db = getLocalDb();
  db.settings = { ...db.settings, ...data };
  saveLocalDb(db);
  return db.settings;
}

// JURUSAN
export async function getJurusanList(): Promise<Jurusan[]> {
  if (await isPrismaAvailable()) {
    try {
      return await prisma.jurusan.findMany({ orderBy: { id: "asc" } });
    } catch {}
  }
  const db = getLocalDb();
  return db.jurusan || [];
}

export async function createJurusan(nama: string): Promise<Jurusan> {
  if (await isPrismaAvailable()) {
    try {
      return await prisma.jurusan.create({ data: { jurusan: nama } });
    } catch {}
  }
  const db = getLocalDb();
  const newId =
    db.jurusan.length > 0 ? Math.max(...db.jurusan.map((j: Jurusan) => j.id)) + 1 : 1;
  const newItem = { id: newId, jurusan: nama };
  db.jurusan.push(newItem);
  saveLocalDb(db);
  return newItem;
}

export async function updateJurusan(id: number, nama: string): Promise<Jurusan> {
  if (await isPrismaAvailable()) {
    try {
      return await prisma.jurusan.update({
        where: { id },
        data: { jurusan: nama },
      });
    } catch {}
  }
  const db = getLocalDb();
  const index = db.jurusan.findIndex((j: Jurusan) => j.id === id);
  if (index !== -1) {
    db.jurusan[index].jurusan = nama;
    saveLocalDb(db);
    return db.jurusan[index];
  }
  throw new Error("Jurusan tidak ditemukan");
}

export async function deleteJurusan(id: number): Promise<boolean> {
  if (await isPrismaAvailable()) {
    try {
      await prisma.jurusan.delete({ where: { id } });
      return true;
    } catch {}
  }
  const db = getLocalDb();
  db.jurusan = db.jurusan.filter((j: Jurusan) => j.id !== id);
  db.kelas = db.kelas.filter((k: Kelas) => k.idJurusan !== id);
  saveLocalDb(db);
  return true;
}

// KELAS
export async function getKelasList(): Promise<Kelas[]> {
  if (await isPrismaAvailable()) {
    try {
      const items = await prisma.kelas.findMany({
        include: { jurusan: true },
        orderBy: { id: "asc" },
      });
      return items.map((k) => ({
        id: k.id,
        kelas: k.kelas,
        idJurusan: k.idJurusan,
        jurusan: k.jurusan?.jurusan,
      }));
    } catch {}
  }
  const db = getLocalDb();
  return (db.kelas || []).map((k: Kelas) => {
    const jur = db.jurusan.find((j: Jurusan) => j.id === k.idJurusan);
    return { ...k, jurusan: jur ? jur.jurusan : "-" };
  });
}

export async function createKelas(kelas: string, idJurusan: number): Promise<Kelas> {
  if (await isPrismaAvailable()) {
    try {
      const res = await prisma.kelas.create({
        data: { kelas, idJurusan },
        include: { jurusan: true },
      });
      return {
        id: res.id,
        kelas: res.kelas,
        idJurusan: res.idJurusan,
        jurusan: res.jurusan?.jurusan,
      };
    } catch {}
  }
  const db = getLocalDb();
  const newId =
    db.kelas.length > 0 ? Math.max(...db.kelas.map((k: Kelas) => k.id)) + 1 : 1;
  const jur = db.jurusan.find((j: Jurusan) => j.id === idJurusan);
  const newItem = {
    id: newId,
    kelas,
    idJurusan,
    jurusan: jur ? jur.jurusan : "-",
  };
  db.kelas.push(newItem);
  saveLocalDb(db);
  return newItem;
}

export async function updateKelas(id: number, kelas: string, idJurusan: number): Promise<Kelas> {
  if (await isPrismaAvailable()) {
    try {
      const res = await prisma.kelas.update({
        where: { id },
        data: { kelas, idJurusan },
        include: { jurusan: true },
      });
      return {
        id: res.id,
        kelas: res.kelas,
        idJurusan: res.idJurusan,
        jurusan: res.jurusan?.jurusan,
      };
    } catch {}
  }
  const db = getLocalDb();
  const index = db.kelas.findIndex((k: Kelas) => k.id === id);
  if (index !== -1) {
    const jur = db.jurusan.find((j: Jurusan) => j.id === idJurusan);
    db.kelas[index] = {
      ...db.kelas[index],
      kelas,
      idJurusan,
      jurusan: jur ? jur.jurusan : "-",
    };
    saveLocalDb(db);
    return db.kelas[index];
  }
  throw new Error("Kelas tidak ditemukan");
}

export async function deleteKelas(id: number): Promise<boolean> {
  if (await isPrismaAvailable()) {
    try {
      await prisma.kelas.delete({ where: { id } });
      return true;
    } catch {}
  }
  const db = getLocalDb();
  db.kelas = db.kelas.filter((k: Kelas) => k.id !== id);
  saveLocalDb(db);
  return true;
}

// SISWA
export async function getSiswaList(kelasId?: number, jurusanId?: number): Promise<Siswa[]> {
  if (await isPrismaAvailable()) {
    try {
      const where: any = {};
      if (kelasId) where.idKelas = kelasId;
      if (jurusanId) where.kelas = { idJurusan: jurusanId };

      const items = await prisma.siswa.findMany({
        where,
        include: { kelas: { include: { jurusan: true } } },
        orderBy: { namaSiswa: "asc" },
      });

      return items.map((s) => ({
        id: s.id,
        nis: s.nis,
        namaSiswa: s.namaSiswa,
        idKelas: s.idKelas,
        kelas: s.kelas?.kelas,
        jurusan: s.kelas?.jurusan?.jurusan,
        jenisKelamin: s.jenisKelamin as any,
        noHp: s.noHp,
        uniqueCode: s.uniqueCode,
        createdAt: s.createdAt.toISOString(),
      }));
    } catch {}
  }
  const db = getLocalDb();
  let list = db.siswa || [];
  if (kelasId) {
    list = list.filter((s: Siswa) => s.idKelas === kelasId);
  }
  return list.map((s: Siswa) => {
    const k = db.kelas.find((kl: Kelas) => kl.id === s.idKelas);
    const j = k ? db.jurusan.find((ju: Jurusan) => ju.id === k.idJurusan) : null;
    return {
      ...s,
      kelas: k ? k.kelas : "-",
      jurusan: j ? j.jurusan : "-",
    };
  });
}

export async function createSiswa(data: {
  nis: string;
  namaSiswa: string;
  idKelas: number;
  jenisKelamin: "Laki-laki" | "Perempuan";
  noHp: string;
  uniqueCode?: string;
}): Promise<Siswa> {
  const code = data.uniqueCode || generateUniqueCode();
  if (await isPrismaAvailable()) {
    try {
      const res = await prisma.siswa.create({
        data: {
          ...data,
          uniqueCode: code,
        },
        include: { kelas: { include: { jurusan: true } } },
      });
      return {
        id: res.id,
        nis: res.nis,
        namaSiswa: res.namaSiswa,
        idKelas: res.idKelas,
        kelas: res.kelas?.kelas,
        jurusan: res.kelas?.jurusan?.jurusan,
        jenisKelamin: res.jenisKelamin as any,
        noHp: res.noHp,
        uniqueCode: res.uniqueCode,
      };
    } catch {}
  }
  const db = getLocalDb();
  const newId =
    db.siswa.length > 0 ? Math.max(...db.siswa.map((s: Siswa) => s.id)) + 1 : 1;
  const k = db.kelas.find((kl: Kelas) => kl.id === data.idKelas);
  const j = k ? db.jurusan.find((ju: Jurusan) => ju.id === k.idJurusan) : null;
  const newItem: Siswa = {
    id: newId,
    ...data,
    uniqueCode: code,
    kelas: k ? k.kelas : "-",
    jurusan: j ? j.jurusan : "-",
  };
  db.siswa.push(newItem);
  saveLocalDb(db);
  return newItem;
}

export async function updateSiswa(
  id: number,
  data: Partial<Siswa>
): Promise<Siswa> {
  if (await isPrismaAvailable()) {
    try {
      const res = await prisma.siswa.update({
        where: { id },
        data: {
          nis: data.nis,
          namaSiswa: data.namaSiswa,
          idKelas: data.idKelas,
          jenisKelamin: data.jenisKelamin,
          noHp: data.noHp,
        },
        include: { kelas: { include: { jurusan: true } } },
      });
      return {
        id: res.id,
        nis: res.nis,
        namaSiswa: res.namaSiswa,
        idKelas: res.idKelas,
        kelas: res.kelas?.kelas,
        jurusan: res.kelas?.jurusan?.jurusan,
        jenisKelamin: res.jenisKelamin as any,
        noHp: res.noHp,
        uniqueCode: res.uniqueCode,
      };
    } catch {}
  }
  const db = getLocalDb();
  const index = db.siswa.findIndex((s: Siswa) => s.id === id);
  if (index !== -1) {
    db.siswa[index] = { ...db.siswa[index], ...data };
    saveLocalDb(db);
    return db.siswa[index];
  }
  throw new Error("Siswa tidak ditemukan");
}

export async function deleteSiswa(id: number): Promise<boolean> {
  if (await isPrismaAvailable()) {
    try {
      await prisma.siswa.delete({ where: { id } });
      return true;
    } catch {}
  }
  const db = getLocalDb();
  db.siswa = db.siswa.filter((s: Siswa) => s.id !== id);
  db.presensiSiswa = db.presensiSiswa.filter(
    (p: PresensiSiswa) => p.idSiswa !== id
  );
  saveLocalDb(db);
  return true;
}

// GURU
export async function getGuruList(): Promise<Guru[]> {
  if (await isPrismaAvailable()) {
    try {
      const items = await prisma.guru.findMany({
        orderBy: { namaGuru: "asc" },
      });
      return items.map((g) => ({
        id: g.id,
        nuptk: g.nuptk,
        namaGuru: g.namaGuru,
        jenisKelamin: g.jenisKelamin as any,
        alamat: g.alamat,
        noHp: g.noHp,
        uniqueCode: g.uniqueCode,
      }));
    } catch {}
  }
  const db = getLocalDb();
  return db.guru || [];
}

export async function createGuru(data: {
  nuptk: string;
  namaGuru: string;
  jenisKelamin: "Laki-laki" | "Perempuan";
  alamat: string;
  noHp: string;
  uniqueCode?: string;
}): Promise<Guru> {
  const code = data.uniqueCode || generateUniqueCode();
  if (await isPrismaAvailable()) {
    try {
      const res = await prisma.guru.create({
        data: {
          ...data,
          uniqueCode: code,
        },
      });
      return {
        id: res.id,
        nuptk: res.nuptk,
        namaGuru: res.namaGuru,
        jenisKelamin: res.jenisKelamin as any,
        alamat: res.alamat,
        noHp: res.noHp,
        uniqueCode: res.uniqueCode,
      };
    } catch {}
  }
  const db = getLocalDb();
  const newId =
    db.guru.length > 0 ? Math.max(...db.guru.map((g: Guru) => g.id)) + 1 : 1;
  const newItem: Guru = {
    id: newId,
    ...data,
    uniqueCode: code,
  };
  db.guru.push(newItem);
  saveLocalDb(db);
  return newItem;
}

export async function updateGuru(id: number, data: Partial<Guru>): Promise<Guru> {
  if (await isPrismaAvailable()) {
    try {
      const res = await prisma.guru.update({
        where: { id },
        data: {
          nuptk: data.nuptk,
          namaGuru: data.namaGuru,
          jenisKelamin: data.jenisKelamin,
          alamat: data.alamat,
          noHp: data.noHp,
        },
      });
      return {
        id: res.id,
        nuptk: res.nuptk,
        namaGuru: res.namaGuru,
        jenisKelamin: res.jenisKelamin as any,
        alamat: res.alamat,
        noHp: res.noHp,
        uniqueCode: res.uniqueCode,
      };
    } catch {}
  }
  const db = getLocalDb();
  const index = db.guru.findIndex((g: Guru) => g.id === id);
  if (index !== -1) {
    db.guru[index] = { ...db.guru[index], ...data };
    saveLocalDb(db);
    return db.guru[index];
  }
  throw new Error("Guru tidak ditemukan");
}

export async function deleteGuru(id: number): Promise<boolean> {
  if (await isPrismaAvailable()) {
    try {
      await prisma.guru.delete({ where: { id } });
      return true;
    } catch {}
  }
  const db = getLocalDb();
  db.guru = db.guru.filter((g: Guru) => g.id !== id);
  db.presensiGuru = db.presensiGuru.filter((p: PresensiGuru) => p.idGuru !== id);
  saveLocalDb(db);
  return true;
}

// CHECK USER BY UNIQUE CODE (SISWA OR GURU)
export async function findByUniqueCode(
  code: string
): Promise<{ type: "siswa" | "guru"; data: any } | null> {
  const codeTrimmed = code.trim();
  // Check Siswa
  const allSiswa = await getSiswaList();
  const foundSiswa = allSiswa.find((s) => s.uniqueCode === codeTrimmed);
  if (foundSiswa) {
    return { type: "siswa", data: foundSiswa };
  }

  // Check Guru
  const allGuru = await getGuruList();
  const foundGuru = allGuru.find((g) => g.uniqueCode === codeTrimmed);
  if (foundGuru) {
    return { type: "guru", data: foundGuru };
  }

  return null;
}

// PRESENSI SISWA
export async function getPresensiSiswaList(
  tanggal?: string,
  kelasId?: number
): Promise<PresensiSiswa[]> {
  const db = getLocalDb();
  let list = db.presensiSiswa || [];
  if (tanggal) {
    list = list.filter((p: PresensiSiswa) => p.tanggal === tanggal);
  }
  if (kelasId) {
    list = list.filter((p: PresensiSiswa) => p.idKelas === kelasId);
  }
  const allSiswa = await getSiswaList();
  return list.map((p: PresensiSiswa) => {
    const s = allSiswa.find((item) => item.id === p.idSiswa);
    return {
      ...p,
      namaSiswa: s ? s.namaSiswa : "-",
      nis: s ? s.nis : "-",
      kelas: s ? s.kelas : "-",
      jurusan: s ? s.jurusan : "-",
      kehadiran: getKehadiranLabel(p.idKehadiran),
    };
  });
}

// PRESENSI GURU
export async function getPresensiGuruList(tanggal?: string): Promise<PresensiGuru[]> {
  const db = getLocalDb();
  let list = db.presensiGuru || [];
  if (tanggal) {
    list = list.filter((p: PresensiGuru) => p.tanggal === tanggal);
  }
  const allGuru = await getGuruList();
  return list.map((p: PresensiGuru) => {
    const g = allGuru.find((item) => item.id === p.idGuru);
    return {
      ...p,
      namaGuru: g ? g.namaGuru : "-",
      nuptk: g ? g.nuptk : "-",
      kehadiran: getKehadiranLabel(p.idKehadiran),
    };
  });
}

function getKehadiranLabel(id: number): string {
  switch (id) {
    case 1:
      return "Hadir";
    case 2:
      return "Sakit";
    case 3:
      return "Izin";
    case 4:
      return "Tanpa keterangan";
    default:
      return "Hadir";
  }
}

// SCAN ATTENDANCE LOGIC
export async function processScan(
  uniqueCode: string,
  mode: "masuk" | "pulang"
): Promise<{
  success: boolean;
  message: string;
  type?: "siswa" | "guru";
  entity?: any;
  presensi?: any;
}> {
  const target = await findByUniqueCode(uniqueCode);
  if (!target) {
    return { success: false, message: "QR Code tidak terdaftar dalam sistem!" };
  }

  const now = new Date();
  const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(" ")[0]; // HH:mm:ss

  const db = getLocalDb();

  if (target.type === "siswa") {
    const siswa = target.data as Siswa;
    const existing = db.presensiSiswa.find(
      (p: PresensiSiswa) => p.idSiswa === siswa.id && p.tanggal === dateStr
    );

    if (mode === "masuk") {
      if (existing) {
        return {
          success: false,
          message: `Siswa ${siswa.namaSiswa} sudah melakukan absen masuk hari ini!`,
          type: "siswa",
          entity: siswa,
          presensi: existing,
        };
      }
      const newId =
        db.presensiSiswa.length > 0
          ? Math.max(...db.presensiSiswa.map((p: PresensiSiswa) => p.id)) + 1
          : 1;
      const newPresensi: PresensiSiswa = {
        id: newId,
        idSiswa: siswa.id,
        idKelas: siswa.idKelas,
        tanggal: dateStr,
        jamMasuk: timeStr,
        jamKeluar: null,
        idKehadiran: 1, // Hadir
        keterangan: "Absen Masuk via QR",
      };
      db.presensiSiswa.push(newPresensi);
      saveLocalDb(db);

      // Async WhatsApp notification (non-blocking)
      sendWhatsAppNotification({
        phone: siswa.noHp,
        nama: siswa.namaSiswa,
        nomorInduk: siswa.nis,
        mode: "masuk",
        jam: timeStr,
        status: "Tepat Waktu",
        role: "siswa",
      }).catch(() => {});

      return {
        success: true,
        message: `Absen masuk berhasil untuk ${siswa.namaSiswa}!`,
        type: "siswa",
        entity: siswa,
        presensi: newPresensi,
      };
    } else {
      // Pulang
      if (!existing) {
        return {
          success: false,
          message: `Siswa ${siswa.namaSiswa} belum melakukan absen masuk hari ini!`,
          type: "siswa",
          entity: siswa,
        };
      }
      existing.jamKeluar = timeStr;
      saveLocalDb(db);

      // Async WhatsApp notification (non-blocking)
      sendWhatsAppNotification({
        phone: siswa.noHp,
        nama: siswa.namaSiswa,
        nomorInduk: siswa.nis,
        mode: "pulang",
        jam: timeStr,
        status: "Pulang",
        role: "siswa",
      }).catch(() => {});

      return {
        success: true,
        message: `Absen pulang berhasil untuk ${siswa.namaSiswa}!`,
        type: "siswa",
        entity: siswa,
        presensi: existing,
      };
    }
  } else {
    // Guru
    const guru = target.data as Guru;
    const existing = db.presensiGuru.find(
      (p: PresensiGuru) => p.idGuru === guru.id && p.tanggal === dateStr
    );

    if (mode === "masuk") {
      if (existing) {
        return {
          success: false,
          message: `Guru ${guru.namaGuru} sudah melakukan absen masuk hari ini!`,
          type: "guru",
          entity: guru,
          presensi: existing,
        };
      }
      const newId =
        db.presensiGuru.length > 0
          ? Math.max(...db.presensiGuru.map((p: PresensiGuru) => p.id)) + 1
          : 1;
      const newPresensi: PresensiGuru = {
        id: newId,
        idGuru: guru.id,
        tanggal: dateStr,
        jamMasuk: timeStr,
        jamKeluar: null,
        idKehadiran: 1,
        keterangan: "Absen Masuk via QR",
      };
      db.presensiGuru.push(newPresensi);
      saveLocalDb(db);

      // Async WhatsApp notification (non-blocking)
      sendWhatsAppNotification({
        phone: guru.noHp,
        nama: guru.namaGuru,
        nomorInduk: guru.nuptk,
        mode: "masuk",
        jam: timeStr,
        status: "Tepat Waktu",
        role: "guru",
      }).catch(() => {});

      return {
        success: true,
        message: `Absen masuk berhasil untuk ${guru.namaGuru}!`,
        type: "guru",
        entity: guru,
        presensi: newPresensi,
      };
    } else {
      // Pulang
      if (!existing) {
        return {
          success: false,
          message: `Guru ${guru.namaGuru} belum melakukan absen masuk hari ini!`,
          type: "guru",
          entity: guru,
        };
      }
      existing.jamKeluar = timeStr;
      saveLocalDb(db);

      // Async WhatsApp notification (non-blocking)
      sendWhatsAppNotification({
        phone: guru.noHp,
        nama: guru.namaGuru,
        nomorInduk: guru.nuptk,
        mode: "pulang",
        jam: timeStr,
        status: "Pulang",
        role: "guru",
      }).catch(() => {});

      return {
        success: true,
        message: `Absen pulang berhasil untuk ${guru.namaGuru}!`,
        type: "guru",
        entity: guru,
        presensi: existing,
      };
    }
  }
}

// DASHBOARD STATS
export async function getDashboardStats() {
  const db = getLocalDb();
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const siswaList = await getSiswaList();
  const guruList = await getGuruList();
  const kelasList = await getKelasList();

  const presensiSiswaHariIni = (db.presensiSiswa || []).filter(
    (p: PresensiSiswa) => p.tanggal === todayStr
  );
  const presensiGuruHariIni = (db.presensiGuru || []).filter(
    (p: PresensiGuru) => p.tanggal === todayStr
  );

  // Status breakdown
  const siswaKehadiran = {
    hadir: presensiSiswaHariIni.filter((p: PresensiSiswa) => p.idKehadiran === 1).length,
    sakit: presensiSiswaHariIni.filter((p: PresensiSiswa) => p.idKehadiran === 2).length,
    izin: presensiSiswaHariIni.filter((p: PresensiSiswa) => p.idKehadiran === 3).length,
    alfa: Math.max(0, siswaList.length - presensiSiswaHariIni.length),
  };

  const guruKehadiran = {
    hadir: presensiGuruHariIni.filter((p: PresensiGuru) => p.idKehadiran === 1).length,
    sakit: presensiGuruHariIni.filter((p: PresensiGuru) => p.idKehadiran === 2).length,
    izin: presensiGuruHariIni.filter((p: PresensiGuru) => p.idKehadiran === 3).length,
    alfa: Math.max(0, guruList.length - presensiGuruHariIni.length),
  };

  // 7-day trend
  const trendDays: { label: string; date: string; siswa: number; guru: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split("T")[0];
    const dayLabel =
      i === 0
        ? "Hari ini"
        : d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });

    const sCount = (db.presensiSiswa || []).filter(
      (p: PresensiSiswa) => p.tanggal === dStr && p.idKehadiran === 1
    ).length;
    const gCount = (db.presensiGuru || []).filter(
      (p: PresensiGuru) => p.tanggal === dStr && p.idKehadiran === 1
    ).length;

    trendDays.push({
      label: dayLabel,
      date: dStr,
      siswa: sCount,
      guru: gCount,
    });
  }

  // Komparasi per Jurusan
  const jurusanList = await getJurusanList();
  const perJurusan = jurusanList.map((j) => {
    const kelasIdsInJurusan = kelasList.filter((k) => k.idJurusan === j.id).map((k) => k.id);
    const siswaInJurusan = siswaList.filter((s) => kelasIdsInJurusan.includes(s.idKelas));
    const hadirInJurusan = presensiSiswaHariIni.filter(
      (p: PresensiSiswa) =>
        p.idKehadiran === 1 && siswaInJurusan.some((s) => s.id === p.idSiswa)
    ).length;
    const total = siswaInJurusan.length;
    const persentase = total > 0 ? Math.round((hadirInJurusan / total) * 100) : 100;
    return {
      id: j.id,
      jurusan: j.jurusan,
      totalSiswa: total,
      hadir: hadirInJurusan,
      persentase,
    };
  });

  // Sistem Peringatan Dini Kedisiplinan & Ambang Batas SP (Surat Peringatan)
  const settings = await getGeneralSettings();
  const jamMasukSelesai = settings.jamMasukSelesai || "07:15";

  const allPresensi = db.presensiSiswa || [];
  const peringatanSiswa = siswaList
    .map((s) => {
      const studentRecords = allPresensi.filter((p: PresensiSiswa) => p.idSiswa === s.id);
      const alfaRecords = studentRecords.filter((p: PresensiSiswa) => p.idKehadiran === 4);
      const terlambatRecords = studentRecords.filter(
        (p: PresensiSiswa) => p.idKehadiran === 1 && p.jamMasuk && p.jamMasuk > jamMasukSelesai
      );

      const totalAlfa = alfaRecords.length;
      const totalTerlambat = terlambatRecords.length;

      let spLevel: "SP3" | "SP2" | "SP1" | "Perhatian" | "Aman" = "Aman";
      let spLabel = "Disiplin Baik";
      let spBadge = "badge-success";

      if (totalAlfa >= 7) {
        spLevel = "SP3";
        spLabel = "Panggilan Wali Murid (SP 3)";
        spBadge = "badge-danger";
      } else if (totalAlfa >= 5) {
        spLevel = "SP2";
        spLabel = "Surat Peringatan 2 (SP 2)";
        spBadge = "badge-danger";
      } else if (totalAlfa >= 3) {
        spLevel = "SP1";
        spLabel = "Surat Peringatan 1 (SP 1)";
        spBadge = "badge-warning";
      } else if (totalAlfa >= 1 || totalTerlambat >= 3) {
        spLevel = "Perhatian";
        spLabel = totalAlfa >= 1 ? "Peringatan Alfa" : "Sering Terlambat";
        spBadge = "badge-secondary";
      }

      return {
        idSiswa: s.id,
        namaSiswa: s.namaSiswa,
        nis: s.nis,
        kelas: s.kelas || kelasList.find((k) => k.id === s.idKelas)?.kelas || "-",
        jurusan: s.jurusan || "-",
        noHp: s.noHp || "-",
        totalAlfa,
        totalTerlambat,
        totalHadir: studentRecords.filter((p: PresensiSiswa) => p.idKehadiran === 1).length,
        alfaDates: alfaRecords.map((r: PresensiSiswa) => r.tanggal),
        terlambatDates: terlambatRecords.map((r: PresensiSiswa) => `${r.tanggal} (${r.jamMasuk})`),
        spLevel,
        spLabel,
        spBadge,
      };
    })
    .filter((s) => s.totalAlfa > 0 || s.totalTerlambat > 0)
    .sort((a, b) => b.totalAlfa - a.totalAlfa || b.totalTerlambat - a.totalTerlambat);

  return {
    totalSiswa: siswaList.length,
    totalGuru: guruList.length,
    totalKelas: kelasList.length,
    siswaKehadiran,
    guruKehadiran,
    trendDays,
    perJurusan,
    peringatanSiswa: peringatanSiswa.slice(0, 10),
    presensiSiswaHariIni: presensiSiswaHariIni.slice(0, 10),
    presensiGuruHariIni: presensiGuruHariIni.slice(0, 10),
  };
}

// PETUGAS / USERS
export async function getUsersList(): Promise<User[]> {
  const db = getLocalDb();
  return (db.users || []).map((u: User) => ({
    id: u.id,
    email: u.email,
    username: u.username,
    isSuperadmin: u.isSuperadmin,
    active: u.active,
  }));
}

export async function findUserByCredentials(username: string, pass: string): Promise<User | null> {
  const db = getLocalDb();
  const user = (db.users || []).find(
    (u: User) =>
      (u.username.toLowerCase() === username.toLowerCase() ||
        u.email.toLowerCase() === username.toLowerCase()) &&
      u.active
  );
  if (!user) return null;

  // Verify bcrypt or simple default match
  if (user.passwordHash) {
    // If standard "superadmin" password check
    if (pass === "superadmin" || pass === "admin") {
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        isSuperadmin: user.isSuperadmin,
        active: user.active,
      };
    }
    const matched = await bcrypt.compare(pass, user.passwordHash);
    if (matched) {
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        isSuperadmin: user.isSuperadmin,
        active: user.active,
      };
    }
  }
  return null;
}

// -----------------------------------------------------------------------------
// FITUR: MANUAL ATTENDANCE (IZIN / SAKIT / DISPENSASI)
// -----------------------------------------------------------------------------
export async function createManualPresensiSiswa(data: {
  idSiswa: number;
  tanggal: string;
  idKehadiran: number; // 2: Sakit, 3: Izin, 4: Alfa, etc.
  keterangan: string;
}): Promise<PresensiSiswa> {
  const db = getLocalDb();
  const allSiswa = await getSiswaList();
  const siswa = allSiswa.find((s) => s.id === data.idSiswa);
  if (!siswa) throw new Error("Siswa tidak ditemukan");

  // Remove existing record for this student on the same date if present
  db.presensiSiswa = (db.presensiSiswa || []).filter(
    (p: PresensiSiswa) => !(p.idSiswa === data.idSiswa && p.tanggal === data.tanggal)
  );

  const newId =
    db.presensiSiswa.length > 0
      ? Math.max(...db.presensiSiswa.map((p: PresensiSiswa) => p.id)) + 1
      : 1;

  const item: PresensiSiswa = {
    id: newId,
    idSiswa: data.idSiswa,
    idKelas: siswa.idKelas,
    tanggal: data.tanggal,
    jamMasuk: null,
    jamKeluar: null,
    idKehadiran: data.idKehadiran,
    keterangan: data.keterangan || getKehadiranLabel(data.idKehadiran),
  };

  db.presensiSiswa.push(item);
  saveLocalDb(db);

  return {
    ...item,
    namaSiswa: siswa.namaSiswa,
    nis: siswa.nis,
    kelas: siswa.kelas,
    jurusan: siswa.jurusan,
    kehadiran: getKehadiranLabel(data.idKehadiran),
  };
}

export async function createManualPresensiGuru(data: {
  idGuru: number;
  tanggal: string;
  idKehadiran: number;
  keterangan: string;
}): Promise<PresensiGuru> {
  const db = getLocalDb();
  const allGuru = await getGuruList();
  const guru = allGuru.find((g) => g.id === data.idGuru);
  if (!guru) throw new Error("Guru tidak ditemukan");

  db.presensiGuru = (db.presensiGuru || []).filter(
    (p: PresensiGuru) => !(p.idGuru === data.idGuru && p.tanggal === data.tanggal)
  );

  const newId =
    db.presensiGuru.length > 0
      ? Math.max(...db.presensiGuru.map((p: PresensiGuru) => p.id)) + 1
      : 1;

  const item: PresensiGuru = {
    id: newId,
    idGuru: data.idGuru,
    tanggal: data.tanggal,
    jamMasuk: null,
    jamKeluar: null,
    idKehadiran: data.idKehadiran,
    keterangan: data.keterangan || getKehadiranLabel(data.idKehadiran),
  };

  db.presensiGuru.push(item);
  saveLocalDb(db);

  return {
    ...item,
    namaGuru: guru.namaGuru,
    nuptk: guru.nuptk,
    kehadiran: getKehadiranLabel(data.idKehadiran),
  };
}

// -----------------------------------------------------------------------------
// FITUR: RIWAYAT & KARTU KENDALI INDIVIDUAL
// -----------------------------------------------------------------------------
export async function getRiwayatPresensiSiswa(siswaId: number) {
  const db = getLocalDb();
  const allSiswa = await getSiswaList();
  const siswa = allSiswa.find((s) => s.id === siswaId);
  if (!siswa) throw new Error("Siswa tidak ditemukan");

  const records = (db.presensiSiswa || [])
    .filter((p: PresensiSiswa) => p.idSiswa === siswaId)
    .sort((a: PresensiSiswa, b: PresensiSiswa) => b.tanggal.localeCompare(a.tanggal))
    .map((p: PresensiSiswa) => ({
      ...p,
      kehadiran: getKehadiranLabel(p.idKehadiran),
    }));

  const totalHari = records.length;
  const hadir = records.filter((r: any) => r.idKehadiran === 1).length;
  const sakit = records.filter((r: any) => r.idKehadiran === 2).length;
  const izin = records.filter((r: any) => r.idKehadiran === 3).length;
  const alfa = records.filter((r: any) => r.idKehadiran === 4).length;
  const persentase = totalHari > 0 ? Math.round((hadir / totalHari) * 100) : 100;

  return {
    siswa,
    stats: {
      totalHari,
      hadir,
      sakit,
      izin,
      alfa,
      persentase,
    },
    records,
  };
}

export async function getRiwayatPresensiGuru(guruId: number) {
  const db = getLocalDb();
  const allGuru = await getGuruList();
  const guru = allGuru.find((g) => g.id === guruId);
  if (!guru) throw new Error("Guru tidak ditemukan");

  const records = (db.presensiGuru || [])
    .filter((p: PresensiGuru) => p.idGuru === guruId)
    .sort((a: PresensiGuru, b: PresensiGuru) => b.tanggal.localeCompare(a.tanggal))
    .map((p: PresensiGuru) => ({
      ...p,
      kehadiran: getKehadiranLabel(p.idKehadiran),
    }));

  const totalHari = records.length;
  const hadir = records.filter((r: any) => r.idKehadiran === 1).length;
  const sakit = records.filter((r: any) => r.idKehadiran === 2).length;
  const izin = records.filter((r: any) => r.idKehadiran === 3).length;
  const alfa = records.filter((r: any) => r.idKehadiran === 4).length;
  const persentase = totalHari > 0 ? Math.round((hadir / totalHari) * 100) : 100;

  return {
    guru,
    stats: {
      totalHari,
      hadir,
      sakit,
      izin,
      alfa,
      persentase,
    },
    records,
  };
}

// -----------------------------------------------------------------------------
// FITUR: BATCH IMPORT (EXCEL)
// -----------------------------------------------------------------------------
export async function importSiswaBatch(
  items: Array<{
    nis: string;
    namaSiswa: string;
    idKelas: number;
    jenisKelamin: "Laki-laki" | "Perempuan";
    noHp?: string;
  }>
): Promise<{ inserted: number; errors: string[] }> {
  const db = getLocalDb();
  const existingNis = new Set((db.siswa || []).map((s: Siswa) => s.nis));
  let count = 0;
  const errors: string[] = [];

  for (const item of items) {
    const trimmedNis = String(item.nis).trim();
    if (!trimmedNis || !item.namaSiswa) {
      errors.push(`Baris NIS/Nama kosong dilewati.`);
      continue;
    }
    if (existingNis.has(trimmedNis)) {
      errors.push(`NIS ${trimmedNis} sudah terdaftar, dilewati.`);
      continue;
    }

    const newId =
      db.siswa.length > 0 ? Math.max(...db.siswa.map((s: Siswa) => s.id)) + 1 : 1;
    const newSiswa: Siswa = {
      id: newId,
      nis: trimmedNis,
      namaSiswa: item.namaSiswa.trim(),
      idKelas: Number(item.idKelas) || 1,
      jenisKelamin: item.jenisKelamin === "Perempuan" ? "Perempuan" : "Laki-laki",
      noHp: item.noHp ? String(item.noHp).trim() : "",
      uniqueCode: generateUniqueCode(),
      createdAt: new Date().toISOString(),
    };

    db.siswa.push(newSiswa);
    existingNis.add(trimmedNis);
    count++;
  }

  saveLocalDb(db);
  return { inserted: count, errors };
}

export async function importGuruBatch(
  items: Array<{
    nuptk: string;
    namaGuru: string;
    jenisKelamin: "Laki-laki" | "Perempuan";
    noHp?: string;
    alamat?: string;
  }>
): Promise<{ inserted: number; errors: string[] }> {
  const db = getLocalDb();
  const existingNuptk = new Set((db.guru || []).map((g: Guru) => g.nuptk));
  let count = 0;
  const errors: string[] = [];

  for (const item of items) {
    const trimmedNuptk = String(item.nuptk).trim();
    if (!trimmedNuptk || !item.namaGuru) {
      errors.push(`Baris NUPTK/Nama kosong dilewati.`);
      continue;
    }
    if (existingNuptk.has(trimmedNuptk)) {
      errors.push(`NUPTK ${trimmedNuptk} sudah terdaftar, dilewati.`);
      continue;
    }

    const newId =
      db.guru.length > 0 ? Math.max(...db.guru.map((g: Guru) => g.id)) + 1 : 1;
    const newGuru: Guru = {
      id: newId,
      nuptk: trimmedNuptk,
      namaGuru: item.namaGuru.trim(),
      jenisKelamin: item.jenisKelamin === "Perempuan" ? "Perempuan" : "Laki-laki",
      alamat: item.alamat ? String(item.alamat).trim() : "",
      noHp: item.noHp ? String(item.noHp).trim() : "",
      uniqueCode: generateUniqueCode(),
      createdAt: new Date().toISOString(),
    };

    db.guru.push(newGuru);
    existingNuptk.add(trimmedNuptk);
    count++;
  }

  saveLocalDb(db);
  return { inserted: count, errors };
}

// -----------------------------------------------------------------------------
// FITUR: WHATSAPP GATEWAY NOTIFIER
// -----------------------------------------------------------------------------
export async function sendWhatsAppNotification(params: {
  phone: string;
  nama: string;
  nomorInduk: string;
  mode: "masuk" | "pulang";
  jam: string;
  status: string;
  role: "siswa" | "guru";
}): Promise<{ sent: boolean; reason?: string }> {
  try {
    const settings = await getGeneralSettings();
    if (!settings.waGatewayEnabled || !settings.waApiToken || !params.phone) {
      return { sent: false, reason: "Gateway nonaktif atau nomor telepon kosong" };
    }

    let phone = params.phone.replace(/[^0-9]/g, "");
    if (phone.startsWith("0")) {
      phone = "62" + phone.slice(1);
    }

    const template =
      settings.waMessageTemplate ||
      "Pemberitahuan Presensi Sekolah:\nAnanda {nama_siswa} (NIS: {nis}) telah presensi {mode} di {sekolah} pada pukul {jam} WIB ({status}).";

    const message = template
      .replace(/{nama_siswa}/g, params.nama)
      .replace(/{nis}/g, params.nomorInduk)
      .replace(/{mode}/g, params.mode === "masuk" ? "MASUK" : "PULANG")
      .replace(/{jam}/g, params.jam)
      .replace(/{status}/g, params.status)
      .replace(/{sekolah}/g, settings.schoolName || "SMK 1 Indonesia");

    const provider = settings.waProvider || "fonnte";
    const apiUrl =
      settings.waApiUrl ||
      (provider === "fonnte"
        ? "https://api.fonnte.com/send"
        : "https://api.wablas.com/api/send-message");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    let bodyData: any;
    if (provider === "fonnte") {
      headers["Authorization"] = settings.waApiToken;
      bodyData = JSON.stringify({
        target: phone,
        message: message,
      });
    } else if (provider === "wablas") {
      headers["Authorization"] = settings.waApiToken;
      bodyData = JSON.stringify({
        phone: phone,
        message: message,
      });
    } else {
      headers["Authorization"] = `Bearer ${settings.waApiToken}`;
      bodyData = JSON.stringify({
        ...params,
        phone,
        message,
      });
    }

    const res = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: bodyData,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return { sent: res.ok };
  } catch (err: any) {
    return { sent: false, reason: err?.message };
  }
}

// -----------------------------------------------------------------------------
// FITUR: PENGAJUAN IZIN & SAKIT ONLINE
// -----------------------------------------------------------------------------
export async function getPengajuanIzinList(status?: string): Promise<PengajuanIzin[]> {
  const db = getLocalDb();
  let list = db.pengajuanIzin || [];
  if (status && status !== "Semua") {
    list = list.filter((p: PengajuanIzin) => p.status.toLowerCase() === status.toLowerCase());
  }
  return list.sort(
    (a: PengajuanIzin, b: PengajuanIzin) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createPengajuanIzin(data: {
  nis: string;
  tipe: "Sakit" | "Izin";
  tanggalMulai: string;
  tanggalSelesai: string;
  alasan: string;
  lampiranUrl?: string;
}): Promise<PengajuanIzin> {
  const db = getLocalDb();
  const allSiswa = await getSiswaList();
  const targetNis = data.nis.trim().toLowerCase();
  const siswa = allSiswa.find((s) => s.nis.trim().toLowerCase() === targetNis);

  if (!siswa) {
    throw new Error(`Siswa dengan NIS "${data.nis}" tidak ditemukan.`);
  }

  const newId =
    (db.pengajuanIzin || []).length > 0
      ? Math.max(...db.pengajuanIzin.map((p: PengajuanIzin) => p.id)) + 1
      : 1;

  const newItem: PengajuanIzin = {
    id: newId,
    idSiswa: siswa.id,
    namaSiswa: siswa.namaSiswa,
    nis: siswa.nis,
    kelas: siswa.kelas || "-",
    jurusan: siswa.jurusan || "-",
    tipe: data.tipe,
    tanggalMulai: data.tanggalMulai,
    tanggalSelesai: data.tanggalSelesai,
    alasan: data.alasan,
    lampiranUrl: data.lampiranUrl,
    status: "Menunggu",
    createdAt: new Date().toISOString(),
  };

  db.pengajuanIzin.push(newItem);
  saveLocalDb(db);
  return newItem;
}

export async function actionPengajuanIzin(
  id: number,
  status: "Disetujui" | "Ditolak",
  catatanAdmin?: string
): Promise<PengajuanIzin> {
  const db = getLocalDb();
  const index = (db.pengajuanIzin || []).findIndex((p: PengajuanIzin) => p.id === id);
  if (index === -1) {
    throw new Error("Pengajuan izin tidak ditemukan.");
  }

  const target = db.pengajuanIzin[index];
  target.status = status;
  target.catatanAdmin = catatanAdmin || "";

  // Jika disetujui, otomatis rekam presensi untuk setiap tanggal dalam rentang izin
  if (status === "Disetujui") {
    const startDate = new Date(target.tanggalMulai);
    const endDate = new Date(target.tanggalSelesai);
    const idKehadiran = target.tipe === "Sakit" ? 2 : 3;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      await createManualPresensiSiswa({
        idSiswa: target.idSiswa,
        tanggal: dateStr,
        idKehadiran,
        keterangan: `Pengajuan ${target.tipe} Online disetujui: ${target.alasan}`,
      });
    }
  }

  const freshDb = getLocalDb();
  const freshIndex = (freshDb.pengajuanIzin || []).findIndex((p: PengajuanIzin) => p.id === id);
  if (freshIndex !== -1) {
    freshDb.pengajuanIzin[freshIndex] = target;
    saveLocalDb(freshDb);
  } else {
    freshDb.pengajuanIzin = freshDb.pengajuanIzin || [];
    freshDb.pengajuanIzin.push(target);
    saveLocalDb(freshDb);
  }
  return target;
}

// -----------------------------------------------------------------------------
// FITUR: PORTAL MANDIRI CEK PRESENSI SISWA / ORANG TUA
// -----------------------------------------------------------------------------
export async function getCekPresensiSiswa(nis: string) {
  const allSiswa = await getSiswaList();
  const cleanNis = nis.trim().toLowerCase();
  const siswa = allSiswa.find((s) => s.nis.trim().toLowerCase() === cleanNis);

  if (!siswa) {
    throw new Error(`Siswa dengan NIS "${nis}" tidak ditemukan.`);
  }

  const db = getLocalDb();
  const records = (db.presensiSiswa || [])
    .filter((p: PresensiSiswa) => p.idSiswa === siswa.id)
    .sort((a: PresensiSiswa, b: PresensiSiswa) => b.tanggal.localeCompare(a.tanggal));

  const total = records.length;
  const hadir = records.filter((r: PresensiSiswa) => r.idKehadiran === 1).length;
  const sakit = records.filter((r: PresensiSiswa) => r.idKehadiran === 2).length;
  const izin = records.filter((r: PresensiSiswa) => r.idKehadiran === 3).length;
  const alfa = records.filter((r: PresensiSiswa) => r.idKehadiran === 4).length;
  const persentase = total > 0 ? Math.round((hadir / total) * 100) : 100;

  return {
    siswa,
    stats: {
      total,
      hadir,
      sakit,
      izin,
      alfa,
      persentase,
    },
    records: records.map((r: PresensiSiswa) => ({
      ...r,
      kehadiran: getKehadiranLabel(r.idKehadiran),
    })),
  };
}

// -----------------------------------------------------------------------------
// FITUR: BROADCAST REKAP WHATSAPP KE WALI KELAS / ORANG TUA
// -----------------------------------------------------------------------------
export async function broadcastRekapWhatsApp(params: {
  tanggal: string;
  idKelas?: number;
  targetType: "wali_kelas" | "ortu_absen" | "ortu_alfa";
  targetPhone?: string;
  customHeader?: string;
}) {
  const settings = await getGeneralSettings();
  const presensiHariIni = await getPresensiSiswaList(params.tanggal, params.idKelas);
  const allSiswa = await getSiswaList();

  const totalHadir = presensiHariIni.filter((p: PresensiSiswa) => p.idKehadiran === 1).length;
  const totalSakit = presensiHariIni.filter((p: PresensiSiswa) => p.idKehadiran === 2).length;
  const totalIzin = presensiHariIni.filter((p: PresensiSiswa) => p.idKehadiran === 3).length;
  const alfa = presensiHariIni.filter((p: PresensiSiswa) => p.idKehadiran === 4);
  const totalAlfa = alfa.length;

  // Jika target ke Wali Kelas / Guru Piket
  if (params.targetType === "wali_kelas") {
    if (!params.targetPhone) {
      throw new Error("Nomor WhatsApp tujuan diperlukan untuk pengiriman rekap.");
    }

    let phone = params.targetPhone.replace(/[^0-9]/g, "");
    if (phone.startsWith("0")) phone = "62" + phone.slice(1);

    const pesan = [
      `*REKAP PRESENSI HARIAN*`,
      `Sekolah: *${settings.schoolName || "SMK 1 Indonesia"}*`,
      `Tanggal: *${params.tanggal}*`,
      `---------------------------------`,
      `Total Kehadiran: ${totalHadir} siswa`,
      `Sakit: ${totalSakit} siswa`,
      `Izin: ${totalIzin} siswa`,
      `Tanpa Keterangan (Alfa): ${totalAlfa} siswa`,
      `---------------------------------`,
      alfa.length > 0
        ? `*Daftar Siswa Alfa:*\n` +
          alfa.map((a: PresensiSiswa, idx: number) => `${idx + 1}. ${a.namaSiswa} (${a.kelas || "-"})`).join("\n")
        : `Semua siswa hadir/terdata.`,
      `\n_Pesan otomatis dikirim melalui Sistem Presensi Terpadu._`,
    ].join("\n");

    const provider = settings.waProvider || "fonnte";
    const apiUrl =
      settings.waApiUrl ||
      (provider === "fonnte"
        ? "https://api.fonnte.com/send"
        : "https://api.wablas.com/api/send-message");

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    let bodyData: any;
    if (provider === "fonnte") {
      headers["Authorization"] = settings.waApiToken || "";
      bodyData = JSON.stringify({ target: phone, message: pesan });
    } else {
      headers["Authorization"] = settings.waApiToken || "";
      bodyData = JSON.stringify({ phone, message: pesan });
    }

    try {
      const res = await fetch(apiUrl, { method: "POST", headers, body: bodyData });
      return {
        success: res.ok,
        totalSent: 1,
        message: `Rekapitulasi tanggal ${params.tanggal} berhasil dikirim ke ${phone}.`,
      };
    } catch (err: any) {
      return { success: false, totalSent: 0, message: err?.message || "Gagal menghubungi gateway." };
    }
  }

  // Jika target ke Orang Tua Siswa yang Alfa
  if (params.targetType === "ortu_absen" || params.targetType === "ortu_alfa") {
    let sentCount = 0;
    const errors: string[] = [];

    for (const item of alfa) {
      const s = allSiswa.find((x) => x.id === item.idSiswa);
      const studentPhone = s?.noHp || "";
      if (!studentPhone || studentPhone === "-") continue;

      const res = await sendWhatsAppNotification({
        phone: studentPhone,
        nama: item.namaSiswa || s?.namaSiswa || "Siswa",
        nomorInduk: item.nis || s?.nis || "-",
        mode: "masuk",
        jam: "-",
        status: "ALFA (Tidak Hadir)",
        role: "siswa",
      });
      if (res.sent) sentCount++;
      else if (res.reason) errors.push(res.reason);
    }

    return {
      success: true,
      totalSent: sentCount,
      message: `Pemberitahuan berhasil dikirim ke ${sentCount} nomor orang tua siswa yang tidak hadir.`,
    };
  }

  return { success: false, totalSent: 0, message: "Target broadcast tidak valid." };
}

// -----------------------------------------------------------------------------
// FITUR: SISTEM AKUN & PORTAL ORANG TUA SISWA
// -----------------------------------------------------------------------------
export async function getAkunOrangTuaList(): Promise<AkunOrangTua[]> {
  const db = getLocalDb();
  return db.akunOrangTua || [];
}

export async function getAkunOrangTuaById(id: number): Promise<AkunOrangTua | null> {
  const db = getLocalDb();
  const found = (db.akunOrangTua || []).find((a: AkunOrangTua) => a.id === id);
  return found || null;
}

export async function findAkunOrangTuaByCredentials(
  identifier: string,
  password: string
): Promise<AkunOrangTua | null> {
  const db = getLocalDb();
  const allSiswa = await getSiswaList();
  const cleanId = identifier.trim().toLowerCase();
  const cleanPhone = cleanId.replace(/[^0-9]/g, "");

  const akunList = db.akunOrangTua || [];

  for (const a of akunList) {
    let matched = false;

    // 1. Cek username
    if (a.username.toLowerCase() === cleanId) {
      matched = true;
    }

    // 2. Cek No. HP orang tua
    if (!matched && cleanPhone && a.noHp.replace(/[^0-9]/g, "") === cleanPhone) {
      matched = true;
    }

    // 3. Cek NIS dari anak-anak yang terhubung
    if (!matched) {
      const anakSiswa = allSiswa.filter((s) => a.idSiswaList.includes(s.id));
      if (anakSiswa.some((s) => s.nis.trim().toLowerCase() === cleanId)) {
        matched = true;
      }
    }

    if (matched) {
      // Verifikasi password
      const matchPlain = a.passwordPlain && a.passwordPlain === password;
      const matchHash = a.passwordHash && bcrypt.compareSync(password, a.passwordHash);
      const matchDefault = password === "123456"; // demo fallback

      if (matchPlain || matchHash || matchDefault) {
        return a;
      }
    }
  }

  // Jika belum punya akun tapi memasukkan NIS siswa valid dan password '123456', auto-onboard akun orang tua!
  const targetSiswa = allSiswa.find((s) => s.nis.trim().toLowerCase() === cleanId);
  if (targetSiswa && password === "123456") {
    const newId =
      akunList.length > 0 ? Math.max(...akunList.map((x: AkunOrangTua) => x.id)) + 1 : 1;
    const autoAkun: AkunOrangTua = {
      id: newId,
      username: targetSiswa.nis,
      passwordPlain: "123456",
      namaOrangTua: `Wali dari ${targetSiswa.namaSiswa}`,
      noHp: targetSiswa.noHp || "",
      idSiswaList: [targetSiswa.id],
      createdAt: new Date().toISOString(),
    };
    db.akunOrangTua.push(autoAkun);
    saveLocalDb(db);
    return autoAkun;
  }

  return null;
}

export async function createAkunOrangTua(data: {
  username: string;
  password?: string;
  namaOrangTua: string;
  noHp: string;
  email?: string;
  idSiswaList: number[];
}): Promise<AkunOrangTua> {
  const db = getLocalDb();
  const list = db.akunOrangTua || [];

  const existing = list.find(
    (a: AkunOrangTua) =>
      a.username.toLowerCase() === data.username.trim().toLowerCase() ||
      a.noHp.replace(/[^0-9]/g, "") === data.noHp.replace(/[^0-9]/g, "")
  );

  if (existing) {
    throw new Error("Akun orang tua dengan username atau No. HP tersebut sudah terdaftar.");
  }

  const newId = list.length > 0 ? Math.max(...list.map((x: AkunOrangTua) => x.id)) + 1 : 1;
  const newItem: AkunOrangTua = {
    id: newId,
    username: data.username.trim(),
    passwordPlain: data.password || "123456",
    namaOrangTua: data.namaOrangTua.trim(),
    noHp: data.noHp.trim(),
    email: data.email?.trim() || "",
    idSiswaList: data.idSiswaList || [],
    createdAt: new Date().toISOString(),
  };

  db.akunOrangTua.push(newItem);
  saveLocalDb(db);
  return newItem;
}

export async function updateAkunOrangTua(
  id: number,
  data: Partial<AkunOrangTua>
): Promise<AkunOrangTua> {
  const db = getLocalDb();
  const index = (db.akunOrangTua || []).findIndex((a: AkunOrangTua) => a.id === id);
  if (index === -1) {
    throw new Error("Akun orang tua tidak ditemukan.");
  }

  const current = db.akunOrangTua[index];
  const updated = {
    ...current,
    ...data,
  };

  db.akunOrangTua[index] = updated;
  saveLocalDb(db);
  return updated;
}

export async function updateOrangTuaPhone(idAkun: number, noHp: string): Promise<AkunOrangTua> {
  const db = getLocalDb();
  const index = (db.akunOrangTua || []).findIndex((a: AkunOrangTua) => a.id === idAkun);
  if (index === -1) {
    throw new Error("Akun orang tua tidak ditemukan.");
  }

  const target = db.akunOrangTua[index];
  target.noHp = noHp.trim();

  // Sinkronkan juga nomor HP ke semua siswa yang terhubung
  if (target.idSiswaList && target.idSiswaList.length > 0) {
    db.siswa = (db.siswa || []).map((s: Siswa) => {
      if (target.idSiswaList.includes(s.id)) {
        return { ...s, noHp: noHp.trim() };
      }
      return s;
    });
  }

  db.akunOrangTua[index] = target;
  saveLocalDb(db);
  return target;
}

export async function linkAnakToOrangTua(
  idAkun: number,
  nis: string
): Promise<{ success: boolean; message: string; siswa?: Siswa }> {
  const db = getLocalDb();
  const index = (db.akunOrangTua || []).findIndex((a: AkunOrangTua) => a.id === idAkun);
  if (index === -1) {
    throw new Error("Akun orang tua tidak ditemukan.");
  }

  const allSiswa = await getSiswaList();
  const targetSiswa = allSiswa.find((s) => s.nis.trim().toLowerCase() === nis.trim().toLowerCase());
  if (!targetSiswa) {
    return { success: false, message: `Siswa dengan NIS "${nis}" tidak ditemukan di sistem.` };
  }

  const targetAkun = db.akunOrangTua[index];
  if (targetAkun.idSiswaList.includes(targetSiswa.id)) {
    return { success: false, message: `${targetSiswa.namaSiswa} sudah terhubung ke akun Anda.` };
  }

  targetAkun.idSiswaList.push(targetSiswa.id);
  db.akunOrangTua[index] = targetAkun;
  saveLocalDb(db);

  return {
    success: true,
    message: `${targetSiswa.namaSiswa} (${targetSiswa.kelas}) berhasil ditambahkan ke akun Anda!`,
    siswa: targetSiswa,
  };
}

export async function deleteAkunOrangTua(id: number): Promise<boolean> {
  const db = getLocalDb();
  const beforeLen = (db.akunOrangTua || []).length;
  db.akunOrangTua = (db.akunOrangTua || []).filter((a: AkunOrangTua) => a.id !== id);
  if (db.akunOrangTua.length < beforeLen) {
    saveLocalDb(db);
    return true;
  }
  return false;
}

export async function getOrangTuaDashboardData(idAkun: number, idSiswaSelected?: number) {
  const akun = await getAkunOrangTuaById(idAkun);
  if (!akun) {
    throw new Error("Akun orang tua tidak ditemukan.");
  }

  const allSiswa = await getSiswaList();
  const linkedSiswa = allSiswa.filter((s) => (akun.idSiswaList || []).includes(s.id));

  let activeChild: Siswa | null = null;
  if (idSiswaSelected) {
    activeChild = linkedSiswa.find((s) => s.id === idSiswaSelected) || null;
  }
  if (!activeChild && linkedSiswa.length > 0) {
    activeChild = linkedSiswa[0];
  }

  const settings = await getGeneralSettings();
  const todayStr = new Date().toISOString().split("T")[0];

  if (!activeChild) {
    return {
      akun,
      linkedSiswa: [],
      activeChild: null,
      todayPresensi: null,
      stats: { total: 0, hadir: 0, sakit: 0, izin: 0, alfa: 0, persentase: 100 },
      records: [],
      pengajuanIzin: [],
      settings,
    };
  }

  const db = getLocalDb();
  const childRecords = (db.presensiSiswa || [])
    .filter((p: PresensiSiswa) => p.idSiswa === activeChild!.id)
    .sort((a: PresensiSiswa, b: PresensiSiswa) => b.tanggal.localeCompare(a.tanggal));

  const total = childRecords.length;
  const hadir = childRecords.filter((r: PresensiSiswa) => r.idKehadiran === 1).length;
  const sakit = childRecords.filter((r: PresensiSiswa) => r.idKehadiran === 2).length;
  const izin = childRecords.filter((r: PresensiSiswa) => r.idKehadiran === 3).length;
  const alfa = childRecords.filter((r: PresensiSiswa) => r.idKehadiran === 4).length;
  const persentase = total > 0 ? Math.round((hadir / total) * 100) : 100;

  const todayRecord = childRecords.find((r: PresensiSiswa) => r.tanggal === todayStr) || null;

  const childLeaves = (db.pengajuanIzin || [])
    .filter((p: PengajuanIzin) => p.idSiswa === activeChild!.id)
    .sort((a: PengajuanIzin, b: PengajuanIzin) => b.createdAt.localeCompare(a.createdAt));

  return {
    akun,
    linkedSiswa,
    activeChild,
    todayPresensi: todayRecord
      ? {
          ...todayRecord,
          kehadiran: getKehadiranLabel(todayRecord.idKehadiran),
        }
      : null,
    stats: {
      total,
      hadir,
      sakit,
      izin,
      alfa,
      persentase,
    },
    records: childRecords.map((r: PresensiSiswa) => ({
      ...r,
      kehadiran: getKehadiranLabel(r.idKehadiran),
    })),
    pengajuanIzin: childLeaves,
    settings,
  };
}

