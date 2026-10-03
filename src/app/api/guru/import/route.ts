import { NextResponse } from "next/server";
import { importGuruBatch } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Daftar data guru dalam format array wajib disediakan" },
        { status: 400 }
      );
    }

    const result = await importGuruBatch(items);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal mengimpor data guru" },
      { status: 500 }
    );
  }
}
