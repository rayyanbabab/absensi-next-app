import { NextResponse } from "next/server";
import { getGeneralSettings, updateGeneralSettings } from "@/lib/db";

export async function GET() {
  try {
    const settings = await getGeneralSettings();
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memuat pengaturan umum" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updated = await updateGeneralSettings(body);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memperbarui pengaturan umum" },
      { status: 500 }
    );
  }
}
