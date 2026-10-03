import { NextResponse } from "next/server";
import { importSiswaBatch } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Daftar data siswa dalam format array wajib disediakan" },
        { status: 400 }
      );
    }

    const result = await importSiswaBatch(items);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal mengimpor data siswa" },
      { status: 500 }
    );
  }
}
