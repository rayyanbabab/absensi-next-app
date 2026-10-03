import { NextResponse } from "next/server";
import { actionPengajuanIzin } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.id || !body.status) {
      return NextResponse.json(
        { error: "ID dan status persetujuan diperlukan." },
        { status: 400 }
      );
    }

    if (body.status !== "Disetujui" && body.status !== "Ditolak") {
      return NextResponse.json(
        { error: "Status harus 'Disetujui' atau 'Ditolak'." },
        { status: 400 }
      );
    }

    const updated = await actionPengajuanIzin(
      Number(body.id),
      body.status,
      body.catatanAdmin
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memproses aksi pengajuan izin" },
      { status: 400 }
    );
  }
}
