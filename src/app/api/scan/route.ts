import { NextResponse } from "next/server";
import { processScan } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { uniqueCode, mode } = await req.json();
    if (!uniqueCode) {
      return NextResponse.json(
        { success: false, message: "QR Code kosong!" },
        { status: 400 }
      );
    }

    const scanMode = mode === "pulang" ? "pulang" : "masuk";
    const result = await processScan(uniqueCode, scanMode);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Kesalahan server saat memproses scan." },
      { status: 500 }
    );
  }
}
