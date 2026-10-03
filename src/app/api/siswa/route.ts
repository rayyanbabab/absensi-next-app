import { NextResponse } from "next/server";
import {
  getSiswaList,
  createSiswa,
  updateSiswa,
  deleteSiswa,
} from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const kelasId = searchParams.get("kelasId")
      ? parseInt(searchParams.get("kelasId")!)
      : undefined;
    const jurusanId = searchParams.get("jurusanId")
      ? parseInt(searchParams.get("jurusanId")!)
      : undefined;

    const data = await getSiswaList(kelasId, jurusanId);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memuat data siswa" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.nis || !body.namaSiswa || !body.idKelas || !body.jenisKelamin) {
      return NextResponse.json(
        { error: "Mohon lengkapi NIS, Nama, Kelas, dan Jenis Kelamin" },
        { status: 400 }
      );
    }
    const created = await createSiswa({
      nis: body.nis,
      namaSiswa: body.namaSiswa,
      idKelas: Number(body.idKelas),
      jenisKelamin: body.jenisKelamin,
      noHp: body.noHp || "-",
      uniqueCode: body.uniqueCode,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal menambah siswa" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "ID Siswa diperlukan" }, { status: 400 });
    }
    const updated = await updateSiswa(Number(body.id), {
      nis: body.nis,
      namaSiswa: body.namaSiswa,
      idKelas: Number(body.idKelas),
      jenisKelamin: body.jenisKelamin,
      noHp: body.noHp,
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memperbarui siswa" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID Siswa diperlukan" }, { status: 400 });
    }
    await deleteSiswa(Number(id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal menghapus siswa" },
      { status: 500 }
    );
  }
}
