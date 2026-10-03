import { NextResponse } from "next/server";
import { getPengajuanIzinList, createPengajuanIzin } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const list = await getPengajuanIzinList(status);
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memuat daftar pengajuan izin" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.nis || !body.tipe || !body.tanggalMulai || !body.tanggalSelesai || !body.alasan) {
      return NextResponse.json(
        { error: "Mohon lengkapi seluruh formulir pengajuan izin." },
        { status: 400 }
      );
    }

    const created = await createPengajuanIzin({
      nis: body.nis,
      tipe: body.tipe,
      tanggalMulai: body.tanggalMulai,
      tanggalSelesai: body.tanggalSelesai,
      alasan: body.alasan,
      lampiranUrl: body.lampiranUrl,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal mengajukan izin" },
      { status: 400 }
    );
  }
}
