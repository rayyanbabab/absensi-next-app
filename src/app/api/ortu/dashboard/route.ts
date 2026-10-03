import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getOrangTuaDashboardData } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("ortu_session");

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: "Sesi orang tua telah berakhir. Silakan login kembali." },
        { status: 401 }
      );
    }

    const session = JSON.parse(sessionCookie.value);
    const { searchParams } = new URL(req.url);
    const idSiswaParam = searchParams.get("idSiswa");
    const idSiswa = idSiswaParam ? Number(idSiswaParam) : undefined;

    const data = await getOrangTuaDashboardData(session.id, idSiswa);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memuat dashboard orang tua." },
      { status: 500 }
    );
  }
}
