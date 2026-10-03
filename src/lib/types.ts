export interface Jurusan {
  id: number;
  jurusan: string;
}

export interface Kelas {
  id: number;
  kelas: string;
  idJurusan: number;
  jurusan?: string;
}

export interface Kehadiran {
  id: number;
  kehadiran: "Hadir" | "Sakit" | "Izin" | "Tanpa keterangan";
}

export interface Guru {
  id: number;
  nuptk: string;
  namaGuru: string;
  jenisKelamin: "Laki-laki" | "Perempuan";
  alamat: string;
  noHp: string;
  uniqueCode: string;
  createdAt?: string;
}

export interface Siswa {
  id: number;
  nis: string;
  namaSiswa: string;
  idKelas: number;
  kelas?: string;
  jurusan?: string;
  jenisKelamin: "Laki-laki" | "Perempuan";
  noHp: string;
  uniqueCode: string;
  createdAt?: string;
}

export interface PresensiGuru {
  id: number;
  idGuru: number | null;
  namaGuru?: string;
  nuptk?: string;
  tanggal: string; // YYYY-MM-DD
  jamMasuk: string | null;
  jamKeluar: string | null;
  idKehadiran: number;
  kehadiran?: string;
  keterangan: string;
}

export interface PresensiSiswa {
  id: number;
  idSiswa: number;
  namaSiswa?: string;
  nis?: string;
  idKelas: number | null;
  kelas?: string;
  jurusan?: string;
  tanggal: string; // YYYY-MM-DD
  jamMasuk: string | null;
  jamKeluar: string | null;
  idKehadiran: number;
  kehadiran?: string;
  keterangan: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  passwordHash?: string;
  isSuperadmin: boolean;
  active: boolean;
}

export interface GeneralSetting {
  id: number;
  logo: string | null;
  schoolName: string;
  schoolYear: string;
  copyright: string;
  jamMasukMulai: string;
  jamMasukSelesai: string;
  jamPulangMulai: string;
  jamPulangSelesai: string;
  waGatewayEnabled?: boolean;
  waProvider?: "fonnte" | "wablas" | "custom";
  waApiToken?: string;
  waApiUrl?: string;
  waMessageTemplate?: string;
}

export interface PengajuanIzin {
  id: number;
  idSiswa: number;
  namaSiswa?: string;
  nis?: string;
  kelas?: string;
  jurusan?: string;
  tipe: "Sakit" | "Izin";
  tanggalMulai: string; // YYYY-MM-DD
  tanggalSelesai: string; // YYYY-MM-DD
  alasan: string;
  lampiranUrl?: string;
  status: "Menunggu" | "Disetujui" | "Ditolak";
  catatanAdmin?: string;
  createdAt: string;
}

export interface AkunOrangTua {
  id: number;
  username: string; // Bisa berupa No. HP, NIS siswa, atau username unik
  passwordHash?: string;
  passwordPlain?: string; // Untuk kemudahan demo / PIN
  namaOrangTua: string;
  noHp: string;
  email?: string;
  idSiswaList: number[]; // ID siswa yang terhubung (bisa multi-anak)
  createdAt: string;
}

export interface OrtuSession {
  id: number;
  username: string;
  namaOrangTua: string;
  noHp: string;
  email?: string;
  idSiswaList: number[];
  role: "orang_tua";
}
