import { NextResponse } from "next/server";
import {
  getGuruList,
  createGuru,
  updateGuru,
  deleteGuru,
} from "@/lib/db";

export async function GET() {
  try {
    const data = await getGuruList();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memuat data guru" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.nuptk || !body.namaGuru || !body.jenisKelamin) {
      return NextResponse.json(
        { error: "Mohon lengkapi NUPTK, Nama Guru, dan Jenis Kelamin" },
        { status: 400 }
      );
    }
    const created = await createGuru({
      nuptk: body.nuptk,
      namaGuru: body.namaGuru,
      jenisKelamin: body.jenisKelamin,
      alamat: body.alamat || "-",
      noHp: body.noHp || "-",
      uniqueCode: body.uniqueCode,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal menambah guru" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "ID Guru diperlukan" }, { status: 400 });
    }
    const updated = await updateGuru(Number(body.id), {
      nuptk: body.nuptk,
      namaGuru: body.namaGuru,
      jenisKelamin: body.jenisKelamin,
      alamat: body.alamat,
      noHp: body.noHp,
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memperbarui guru" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID Guru diperlukan" }, { status: 400 });
    }
    await deleteGuru(Number(id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal menghapus guru" },
      { status: 500 }
    );
  }
}
