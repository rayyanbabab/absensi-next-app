import { NextResponse } from "next/server";
import { getCekPresensiSiswa } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const nis = searchParams.get("nis");
    if (!nis) {
      return NextResponse.json({ error: "Parameter NIS diperlukan" }, { status: 400 });
    }

    const data = await getCekPresensiSiswa(nis);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memuat data presensi siswa" },
      { status: 404 }
    );
  }
}
