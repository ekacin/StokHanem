"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import "barcode-detector";
// Polyfill globally defines window.BarcodeDetector using Zbar WASM 

interface ScannerProps {
    onScan: (barcode: string) => void;
    onClose?: () => void;
}

function extractBarcode(raw: string): string {
    try {
        const url = new URL(raw);
        const segments = url.pathname.split("/").filter(Boolean);
        const barcodeSegment = segments.find((s) => /^\d{8,14}$/.test(s));
        if (barcodeSegment) return barcodeSegment;
        const param = url.searchParams.get("barcode") || url.searchParams.get("code");
        if (param) return param;
    } catch {
        //
    }
    return raw;
}

export function Scanner({ onScan, onClose }: ScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [started, setStarted] = useState(false);
    const [error, setError] = useState("");

    const detectorRef = useRef<any>(null);
    const scanningLoopRef = useRef<number | null>(null);
    const isScanningRef = useRef(false);

    const stopCamera = useCallback(() => {
        isScanningRef.current = false;
        if (scanningLoopRef.current) {
            cancelAnimationFrame(scanningLoopRef.current);
            scanningLoopRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) videoRef.current.srcObject = null;
        setStarted(false);
    }, []);

    const scanLoop = useCallback(async () => {
        if (!videoRef.current || !detectorRef.current || !isScanningRef.current) return;

        if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            try {
                if (!canvasRef.current) {
                    canvasRef.current = document.createElement("canvas");
                }
                const canvas = canvasRef.current;
                const video = videoRef.current;

                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                const ctx = canvas.getContext("2d", { willReadFrequently: true });
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                    const barcodes = await detectorRef.current.detect(imageData);

                    if (barcodes && barcodes.length > 0) {
                        const rawCode = barcodes[0].rawValue;
                        const normalized = extractBarcode(rawCode);
                        stopCamera();
                        onScan(normalized);
                        return; // Dur ve çık
                    }
                }
            } catch (err) {
                // Hataları görmezden gel, sonraki frame'i dene
            }
        }

        // Sürekli döngü için
        if (isScanningRef.current) {
            scanningLoopRef.current = requestAnimationFrame(scanLoop);
        }
    }, [onScan, stopCamera]);

    const startCamera = async () => {
        setError("");
        try {
            if (!detectorRef.current) {
                if (typeof window.BarcodeDetector !== "undefined") {
                    // @ts-ignore
                    detectorRef.current = new window.BarcodeDetector({
                        formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "itf", "qr_code"]
                    });
                } else {
                    throw new Error("Tarayıcınız veya kurulu modüller Barkod Okuma API'sini desteklemiyor.");
                }
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.setAttribute("playsinline", "true"); // iOS Safari için
                await videoRef.current.play();

                setStarted(true);
                isScanningRef.current = true;
                scanLoop(); // Görüntü akmaya başladığında sürekli tarama döngüsünü başlat
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes("permission") || msg.includes("NotAllowed")) {
                setError("Kamera izni verilmedi. Lütfen izin verin.");
            } else {
                setError("Kamera başlatılamadı: " + msg);
            }
        }
    };

    useEffect(() => {
        return () => stopCamera();
    }, [stopCamera]);

    return (
        <div className="fade-in">
            <div className="scanner-wrap">
                {!started && !error && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            gap: "1rem",
                            background: "rgba(0,0,0,0.7)",
                        }}
                    >
                        <span style={{ fontSize: "3rem" }}>📷</span>
                        <p style={{ color: "var(--text-secondary)", fontSize: ".9rem" }}>Kamera kapalı</p>
                    </div>
                )}

                <video
                    ref={videoRef}
                    playsInline
                    muted
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: started ? "block" : "none",
                    }}
                />

                {started && (
                    <div className="scanner-overlay">
                        <div className="scanner-frame" />
                    </div>
                )}
            </div>

            {error && (
                <div className="alert-bar alert-bar-warning fade-up" style={{ marginTop: ".75rem" }}>
                    ⚠️ {error}
                </div>
            )}

            <div style={{ display: "flex", gap: ".75rem", marginTop: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                {!started ? (
                    <button className="btn btn-primary btn-lg" onClick={startCamera}>
                        📷 Kamerayı Aç (Anlık Tarama)
                    </button>
                ) : (
                    <button className="btn btn-ghost" onClick={stopCamera}>
                        Durdur
                    </button>
                )}

                {onClose && (
                    <button
                        className="btn btn-ghost"
                        onClick={() => { stopCamera(); onClose(); }}
                    >
                        İptal
                    </button>
                )}
            </div>
            <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: ".8rem", marginTop: ".75rem" }}>
                Zbar WASM Motoru ⚡: Kodu vizöre odakla, sistem barkodu tespit ettiği an otomatik okuyacaktır.
            </p>
        </div>
    );
}
