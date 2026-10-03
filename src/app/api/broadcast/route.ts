import { NextResponse } from "next/server";
import { broadcastRekapWhatsApp } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.tanggal || !body.targetType) {
      return NextResponse.json(
        { error: "Tanggal dan jenis target broadcast diperlukan." },
        { status: 400 }
      );
    }

    const result = await broadcastRekapWhatsApp({
      tanggal: body.tanggal,
      idKelas: body.idKelas ? Number(body.idKelas) : undefined,
      targetType: body.targetType,
      targetPhone: body.targetPhone,
      customHeader: body.customHeader,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal melakukan broadcast presensi" },
      { status: 500 }
    );
  }
}
