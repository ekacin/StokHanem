"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Scanner } from "@/components/Scanner";

interface ProductInfo {
    id: string;
    barcode: string;
    name: string;
    brand?: string;
    category?: string;
    imageUrl?: string;
    stocks: { quantity: number }[];
}

type Step = "scan" | "confirm";

export default function StockDecreasePage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("scan");
    const [scanning, setScanning] = useState(false);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form state
    const [product, setProduct] = useState<ProductInfo | null>(null);
    const [amount, setAmount] = useState(1);
    const [manualBarcode, setManualBarcode] = useState("");

    const handleScan = async (barcode: string) => {
        setScanning(false);
        setLookupLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await fetch(`/api/product-lookup?barcode=${encodeURIComponent(barcode)}`);
            const data = await res.json();

            if (data.found && data.product) {
                const stockRes = await fetch(`/api/stock?search=${encodeURIComponent(barcode)}`);
                const stockData = await stockRes.json();
                const existing = stockData.items.find((i: any) => i.product.barcode === barcode);

                if (existing) {
                    setProduct({ ...existing.product, stocks: [{ quantity: existing.quantity }] });
                    setStep("confirm");
                } else {
                    setError("⚠️ Bu ürün stokta bulunamadı, stoktan düşme yapılamaz.");
                }
            } else {
                setError("⚠️ Ürün bulunamadı.");
            }
        } catch {
            setError("Ürün sorgulanamadı. Lütfen manual deneyin.");
        } finally {
            setLookupLoading(false);
        }
    };

    const handleManualSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (manualBarcode.trim()) handleScan(manualBarcode.trim());
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!product) return;

        const currentQty = product.stocks?.[0]?.quantity ?? 0;
        if (amount > currentQty) {
            setError(`❌ Stok yetersiz! Mevcut stok: ${currentQty}`);
            return;
        }

        setError("");
        setSaving(true);

        try {
            const res = await fetch("/api/stock/adjust", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    barcode: product.barcode,
                    amount: -amount, // Negative for decrease
                }),
            });

            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || "Kaydetme başarısız");
            }

            setSuccess(`✅ ${amount} adet başarıyla düşüldü!`);
            setProduct(null);
            setAmount(1);
            setStep("scan");

            setTimeout(() => setSuccess(""), 3000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Bir hata oluştu");
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="page" style={{ maxWidth: 680 }}>
            <div className="page-header fade-up">
                <h1 style={{ color: "var(--danger)" }}>➖ Stok Düşür</h1>
                <p style={{ color: "var(--text-secondary)" }}>Ürün tarayarak veya manuel barkod ile stoktan düşüm yapın.</p>
            </div>

            {success && (
                <div className="alert-bar alert-bar-success fade-in" style={{ marginBottom: "1.5rem" }}>
                    {success}
                </div>
            )}

            {error && (
                <div className="alert-bar alert-bar-danger fade-in" style={{ marginBottom: "1.5rem" }}>
                    ⚠️ {error}
                </div>
            )}

            {step === "scan" && (
                <div className="card fade-in" style={{ marginBottom: "1.5rem" }}>
                    {scanning ? (
                        <Scanner
                            onScan={handleScan}
                            onClose={() => setScanning(false)}
                        />
                    ) : (
                        <div style={{ textAlign: "center", padding: "1.5rem" }}>
                            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📷</div>
                            <button
                                className="btn btn-primary btn-lg"
                                style={{ width: "100%", marginBottom: "1.5rem", background: "var(--danger)", borderColor: "var(--danger)" }}
                                onClick={() => setScanning(true)}
                                disabled={lookupLoading}
                            >
                                {lookupLoading ? <><span className="spinner" /> Aranıyor...</> : "📷 Barkod Tara"}
                            </button>

                            <div className="divider" style={{ margin: "1.5rem 0" }}>veya</div>

                            <form onSubmit={handleManualSubmit} style={{ display: "flex", gap: ".5rem" }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Barkod No Girin"
                                    value={manualBarcode}
                                    onChange={(e) => setManualBarcode(e.target.value)}
                                />
                                <button type="submit" className="btn btn-ghost">Ara</button>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {step === "confirm" && product && (
                <div className="card fade-in">
                    <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                        {product.imageUrl && (
                            <img src={product.imageUrl} alt={product.name} style={{ width: 80, height: 80, objectFit: "contain", borderRadius: 8, background: "white" }} />
                        )}
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: 0 }}>{product.name}</h3>
                            <p style={{ color: "var(--text-muted)", margin: ".25rem 0", fontSize: ".9rem" }}>{product.brand || "Markasız"} | {product.barcode}</p>
                            <div style={{ marginTop: ".75rem", padding: ".5rem .75rem", borderRadius: 8, background: "rgba(239,68,68,0.1)", display: "inline-block" }}>
                                <span style={{ color: "var(--text-secondary)", fontSize: ".8rem" }}>Mevcut Stok:</span>
                                <strong style={{ marginLeft: ".5rem", color: "var(--danger)" }}>
                                    {product.stocks?.[0]?.quantity ?? 0}
                                </strong>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div className="form-group">
                            <label className="form-label">Düşülecek Miktar</label>
                            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                <button type="button" className="btn btn-ghost" style={{ padding: "0 1rem", fontSize: "1.5rem" }} onClick={() => setAmount(Math.max(1, amount - 1))}>-</button>
                                <input
                                    type="number"
                                    className="form-input"
                                    style={{ textAlign: "center", fontSize: "1.5rem", height: "auto", padding: ".5rem", color: "var(--danger)" }}
                                    min={1}
                                    max={product.stocks?.[0]?.quantity ?? 1}
                                    value={amount}
                                    onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
                                    required
                                />
                                <button type="button" className="btn btn-ghost" style={{ padding: "0 1rem", fontSize: "1.5rem" }} onClick={() => setAmount(Math.min(product.stocks?.[0]?.quantity ?? 1, amount + 1))}>+</button>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button
                                type="submit"
                                className="btn btn-danger btn-lg"
                                style={{ flex: 1, background: "var(--danger)" }}
                                disabled={saving}
                            >
                                {saving ? <><span className="spinner" /> Kaydediliyor...</> : `❌ Düş (${product.stocks?.[0]?.quantity ?? 0} - ${amount})`}
                            </button>
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => { setStep("scan"); setProduct(null); }}
                            >
                                İptal
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </main>
    );
}
