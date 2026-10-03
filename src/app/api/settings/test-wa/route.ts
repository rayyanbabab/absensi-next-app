import { NextResponse } from "next/server";
import { sendWhatsAppNotification, getGeneralSettings } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { targetPhone } = body;

    if (!targetPhone) {
      return NextResponse.json(
        { error: "Nomor tujuan WhatsApp wajib diisi" },
        { status: 400 }
      );
    }

    const settings = await getGeneralSettings();
    if (!settings.waApiToken) {
      return NextResponse.json(
        { error: "API Token WhatsApp Gateway belum diatur di pengaturan!" },
        { status: 400 }
      );
    }

    const result = await sendWhatsAppNotification({
      phone: targetPhone,
      nama: "Uji Coba Pengurus",
      nomorInduk: "TEST-001",
      mode: "masuk",
      jam: new Date().toTimeString().split(" ")[0],
      status: "Uji Coba Koneksi Gateway Berhasil",
      role: "siswa",
    });

    if (result.sent) {
      return NextResponse.json({ success: true, message: "Pesan WhatsApp berhasil dikirim!" });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.reason || "Koneksi gateway gagal, pastikan token dan endpoint benar.",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan saat menguji WhatsApp gateway" },
      { status: 500 }
    );
  }
}
