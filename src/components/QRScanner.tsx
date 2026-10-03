"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle, ArrowRightLeft, RefreshCw } from "lucide-react";

interface QRScannerProps {
  onScanSuccess: (code: string) => void;
  mode: "masuk" | "pulang";
  setMode: (mode: "masuk" | "pulang") => void;
  isProcessing: boolean;
}

export default function QRScanner({
  onScanSuccess,
  mode,
  setMode,
  isProcessing,
}: QRScannerProps) {
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const html5QrCodeRef = useRef<any>(null);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initScanner() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (!isMounted) return;

        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices.map((d) => ({ id: d.id, label: d.label || `Kamera ${d.id}` })));
          const defaultCam = devices[0].id;
          setSelectedCamera(defaultCam);
          startScanning(Html5Qrcode, defaultCam);
        } else {
          setCameraError("Tidak ada kamera yang terdeteksi di perangkat Anda.");
        }
      } catch (err: any) {
        if (!isMounted) return;
        setCameraError("Izin kamera belum diberikan atau kamera sedang digunakan aplikasi lain.");
      }
    }

    initScanner();

    return () => {
      isMounted = false;
      stopScanning();
    };
  }, []);

  const startScanning = async (Html5QrcodeClass: any, cameraId: string) => {
    try {
      if (html5QrCodeRef.current) {
        await stopScanning();
      }

      const qr = new Html5QrcodeClass("qr-reader-container");
      html5QrCodeRef.current = qr;

      await qr.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
        },
        (decodedText: string) => {
          if (!isProcessing) {
            playBeep();
            onScanSuccess(decodedText);
          }
        },
        () => {}
      );
      setCameraError(null);
    } catch (e: any) {
      setCameraError("Gagal membuka kamera: " + (e?.message || "Periksa izin kamera"));
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn("Stop scanner warning:", err);
      }
      html5QrCodeRef.current = null;
    }
  };

  const handleCameraChange = async (cameraId: string) => {
    setSelectedCamera(cameraId);
    const { Html5Qrcode } = await import("html5-qrcode");
    await startScanning(Html5Qrcode, cameraId);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      playBeep();
      onScanSuccess(manualCode.trim());
      setManualCode("");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Mode Switcher */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4px",
          padding: "4px",
          backgroundColor: "var(--bg-subtle)",
          borderRadius: "10px",
          border: "1px solid var(--border-app)",
        }}
      >
        <button
          type="button"
          onClick={() => setMode("masuk")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "9px 14px",
            borderRadius: "7px",
            fontSize: "0.84rem",
            fontWeight: mode === "masuk" ? 600 : 500,
            color: mode === "masuk" ? "#ffffff" : "var(--text-muted)",
            backgroundColor: mode === "masuk" ? "var(--brand-primary)" : "transparent",
            boxShadow: mode === "masuk" ? "0 1px 3px rgba(15, 23, 42, 0.15)" : "none",
            border: "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: mode === "masuk" ? "#10b981" : "var(--text-subtle)",
            }}
          />
          <span>Presensi Masuk</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("pulang")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "9px 14px",
            borderRadius: "7px",
            fontSize: "0.84rem",
            fontWeight: mode === "pulang" ? 600 : 500,
            color: mode === "pulang" ? "#ffffff" : "var(--text-muted)",
            backgroundColor: mode === "pulang" ? "var(--brand-primary)" : "transparent",
            boxShadow: mode === "pulang" ? "0 1px 3px rgba(15, 23, 42, 0.15)" : "none",
            border: "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: mode === "pulang" ? "#f59e0b" : "var(--text-subtle)",
            }}
          />
          <span>Presensi Pulang</span>
        </button>
      </div>

      {/* Camera Selection */}
      {cameras.length > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Camera size={15} style={{ color: "var(--text-muted)" }} />
          <select
            value={selectedCamera}
            onChange={(e) => handleCameraChange(e.target.value)}
            className="form-select"
            style={{ fontSize: "0.8rem", padding: "5px 10px", height: "34px" }}
          >
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Video Viewport Container */}
      <div
        className="scanner-viewport-clean"
        style={{
          margin: "0 auto",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="scanner-target-box" />

        {/* HTML5 QR Video Element */}
        <div id="qr-reader-container" style={{ width: "100%", height: "100%" }} />

        {cameraError && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
              textAlign: "center",
              backgroundColor: "var(--bg-surface)",
              zIndex: 20,
              gap: "8px",
            }}
          >
            <Camera size={34} style={{ color: "var(--text-muted)" }} />
            <p style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text-main)" }}>
              {cameraError}
            </p>
            <p style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
              Anda dapat menginput NIS siswa atau NUPTK guru pada kolom di bawah.
            </p>
          </div>
        )}

        {isProcessing && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(15, 23, 42, 0.85)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 30,
              gap: "8px",
              color: "#ffffff",
              backdropFilter: "blur(2px)",
            }}
          >
            <RefreshCw size={26} className="animate-spin" />
            <span style={{ fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.02em" }}>
              Memvalidasi data presensi...
            </span>
          </div>
        )}
      </div>

      {/* Manual Input Fallback */}
      <form onSubmit={handleManualSubmit} style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          placeholder="Ketik NIS siswa atau NUPTK guru..."
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          className="form-input"
          style={{ fontSize: "0.82rem", height: "36px" }}
        />
        <button
          type="submit"
          className="btn btn-secondary"
          disabled={isProcessing}
          style={{ height: "36px", fontSize: "0.82rem", fontWeight: 600, flexShrink: 0 }}
        >
          Kirim
        </button>
      </form>
    </div>
  );
}
