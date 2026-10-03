import { NextResponse } from "next/server";
import {
  getKelasList,
  createKelas,
  updateKelas,
  deleteKelas,
} from "@/lib/db";

export async function GET() {
  try {
    const data = await getKelasList();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memuat data kelas" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.kelas || !body.idJurusan) {
      return NextResponse.json(
        { error: "Nama kelas dan jurusan wajib diisi" },
        { status: 400 }
      );
    }
    const created = await createKelas(body.kelas, Number(body.idJurusan));
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal menambah kelas" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id || !body.kelas || !body.idJurusan) {
      return NextResponse.json(
        { error: "ID, Nama Kelas, dan Jurusan wajib diisi" },
        { status: 400 }
      );
    }
    const updated = await updateKelas(
      Number(body.id),
      body.kelas,
      Number(body.idJurusan)
    );
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memperbarui kelas" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID Kelas diperlukan" }, { status: 400 });
    }
    await deleteKelas(Number(id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal menghapus kelas" },
      { status: 500 }
    );
  }
}
