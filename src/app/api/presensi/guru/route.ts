import { NextResponse } from "next/server";
import {
  getPresensiGuruList,
  createManualPresensiGuru,
  getRiwayatPresensiGuru,
} from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const guruId = searchParams.get("guruId");
    if (guruId) {
      const history = await getRiwayatPresensiGuru(parseInt(guruId));
      return NextResponse.json(history);
    }

    const tanggal = searchParams.get("tanggal") || undefined;
    const data = await getPresensiGuruList(tanggal);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memuat rekap presensi guru" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { idGuru, tanggal, idKehadiran, keterangan } = body;

    if (!idGuru || !tanggal || !idKehadiran) {
      return NextResponse.json(
        { error: "Data guru, tanggal, dan status kehadiran wajib diisi" },
        { status: 400 }
      );
    }

    const result = await createManualPresensiGuru({
      idGuru: Number(idGuru),
      tanggal,
      idKehadiran: Number(idKehadiran),
      keterangan: keterangan || "",
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal mencatat kehadiran manual guru" },
      { status: 500 }
    );
  }
}
