import { NextResponse } from "next/server";
import { getUsersList } from "@/lib/db";

export async function GET() {
  try {
    const users = await getUsersList();
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memuat data petugas" },
      { status: 500 }
    );
  }
}
