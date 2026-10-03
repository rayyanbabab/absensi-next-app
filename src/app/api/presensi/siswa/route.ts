import { NextResponse } from "next/server";
import {
  getPresensiSiswaList,
  createManualPresensiSiswa,
  getRiwayatPresensiSiswa,
} from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const siswaId = searchParams.get("siswaId");
    if (siswaId) {
      const history = await getRiwayatPresensiSiswa(parseInt(siswaId));
      return NextResponse.json(history);
    }

    const tanggal = searchParams.get("tanggal") || undefined;
    const kelasId = searchParams.get("kelasId")
      ? parseInt(searchParams.get("kelasId")!)
      : undefined;

    const data = await getPresensiSiswaList(tanggal, kelasId);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memuat rekap presensi siswa" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { idSiswa, tanggal, idKehadiran, keterangan } = body;

    if (!idSiswa || !tanggal || !idKehadiran) {
      return NextResponse.json(
        { error: "Data siswa, tanggal, dan status kehadiran wajib diisi" },
        { status: 400 }
      );
    }

    const result = await createManualPresensiSiswa({
      idSiswa: Number(idSiswa),
      tanggal,
      idKehadiran: Number(idKehadiran),
      keterangan: keterangan || "",
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal mencatat kehadiran manual siswa" },
      { status: 500 }
    );
  }
}
