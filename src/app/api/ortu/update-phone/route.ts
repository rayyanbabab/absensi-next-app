import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { updateOrangTuaPhone } from "@/lib/db";

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
    const noHp = body.noHp?.trim();

    if (!noHp) {
      return NextResponse.json(
        { error: "Nomor WhatsApp wajib diisi." },
        { status: 400 }
      );
    }

    const updated = await updateOrangTuaPhone(session.id, noHp);

    // Update cookie session with new phone
    const updatedSession = { ...session, noHp: updated.noHp };
    const response = NextResponse.json({
      success: true,
      message: "Nomor WhatsApp berhasil diperbarui dan disinkronkan ke data siswa.",
      user: updatedSession,
    });

    response.cookies.set("ortu_session", JSON.stringify(updatedSession), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memperbarui nomor telepon." },
      { status: 500 }
    );
  }
}
