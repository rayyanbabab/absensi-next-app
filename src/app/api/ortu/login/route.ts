import { NextResponse } from "next/server";
import { findAkunOrangTuaByCredentials, getSiswaList } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();
    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Nomor HP / NIS dan password wajib diisi." },
        { status: 400 }
      );
    }

    const akun = await findAkunOrangTuaByCredentials(identifier, password);
    if (!akun) {
      return NextResponse.json(
        {
          error:
            "Akun orang tua tidak ditemukan atau password salah. Pastikan memasukkan No. HP terdaftar atau NIS anak dengan password default (123456).",
        },
        { status: 401 }
      );
    }

    const allSiswa = await getSiswaList();
    const linkedSiswa = allSiswa.filter((s) => (akun.idSiswaList || []).includes(s.id));

    const sessionData = {
      id: akun.id,
      username: akun.username,
      namaOrangTua: akun.namaOrangTua,
      noHp: akun.noHp,
      email: akun.email,
      idSiswaList: akun.idSiswaList,
      role: "orang_tua",
    };

    const response = NextResponse.json({
      success: true,
      user: sessionData,
      linkedSiswa,
      message: "Login orang tua berhasil!",
    });

    response.cookies.set("ortu_session", JSON.stringify(sessionData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan saat memproses login." },
      { status: 500 }
    );
  }
}
