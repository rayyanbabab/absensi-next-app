import { NextResponse } from "next/server";
import {
  getJurusanList,
  createJurusan,
  updateJurusan,
  deleteJurusan,
} from "@/lib/db";

export async function GET() {
  try {
    const data = await getJurusanList();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memuat data jurusan" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.jurusan) {
      return NextResponse.json(
        { error: "Nama jurusan wajib diisi" },
        { status: 400 }
      );
    }
    const created = await createJurusan(body.jurusan);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal menambah jurusan" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id || !body.jurusan) {
      return NextResponse.json(
        { error: "ID dan nama jurusan wajib diisi" },
        { status: 400 }
      );
    }
    const updated = await updateJurusan(Number(body.id), body.jurusan);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memperbarui jurusan" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID Jurusan diperlukan" }, { status: 400 });
    }
    await deleteJurusan(Number(id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal menghapus jurusan" },
      { status: 500 }
    );
  }
}
