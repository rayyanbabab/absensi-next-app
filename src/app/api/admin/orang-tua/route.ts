import { NextResponse } from "next/server";
import {
  getAkunOrangTuaList,
  createAkunOrangTua,
  updateAkunOrangTua,
  deleteAkunOrangTua,
  getSiswaList,
} from "@/lib/db";
import { AkunOrangTua } from "@/lib/types";

export async function GET() {
  try {
    const list = await getAkunOrangTuaList();
    const allSiswa = await getSiswaList();

    const populated = list.map((a: AkunOrangTua) => ({
      ...a,
      siswaList: allSiswa.filter((s) => (a.idSiswaList || []).includes(s.id)),
    }));

    return NextResponse.json(populated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memuat daftar akun orang tua." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.username || !body.namaOrangTua || !body.noHp) {
      return NextResponse.json(
        { error: "Username, Nama Orang Tua, dan No. HP wajib diisi." },
        { status: 400 }
      );
    }

    const created = await createAkunOrangTua({
      username: body.username,
      password: body.password || "123456",
      namaOrangTua: body.namaOrangTua,
      noHp: body.noHp,
      email: body.email,
      idSiswaList: body.idSiswaList || [],
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal membuat akun orang tua." },
      { status: 400 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "ID Akun wajib disertakan." }, { status: 400 });
    }

    const updated = await updateAkunOrangTua(Number(body.id), {
      namaOrangTua: body.namaOrangTua,
      noHp: body.noHp,
      email: body.email,
      passwordPlain: body.password || undefined,
      idSiswaList: body.idSiswaList,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memperbarui akun orang tua." },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Parameter ID diperlukan." }, { status: 400 });
    }

    const success = await deleteAkunOrangTua(Number(id));
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal menghapus akun orang tua." },
      { status: 500 }
    );
  }
}
