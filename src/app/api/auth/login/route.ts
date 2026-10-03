import { NextResponse } from "next/server";
import { findUserByCredentials } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    const user = await findUserByCredentials(username, password);
    if (!user) {
      return NextResponse.json(
        { error: "Username atau password salah." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user,
      message: "Login berhasil!",
    });

    // Set secure auth cookie
    response.cookies.set("absensi_session", JSON.stringify(user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
