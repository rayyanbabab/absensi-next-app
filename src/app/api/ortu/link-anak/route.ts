import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { linkAnakToOrangTua } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("ortu_session");

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: "Sesi orang tua telah berakhir." },
        { status: 401 }
      );
    }

    const session = JSON.parse(sessionCookie.value);
    const body = await req.json();
    const nis = body.nis?.trim();

    if (!nis) {
      return NextResponse.json(
        { error: "Nomor Induk Siswa (NIS) wajib diisi." },
        { status: 400 }
      );
    }

    const result = await linkAnakToOrangTua(session.id, nis);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    // Refresh cookie session with new idSiswa
    if (result.siswa && !session.idSiswaList.includes(result.siswa.id)) {
      session.idSiswaList.push(result.siswa.id);
    }

    const response = NextResponse.json({
      success: true,
      message: result.message,
      siswa: result.siswa,
    });

    response.cookies.set("ortu_session", JSON.stringify(session), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal menghubungkan siswa." },
      { status: 500 }
    );
  }
}
