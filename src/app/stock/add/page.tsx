"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Scanner } from "@/components/Scanner";

interface ProductInfo {
    barcode: string;
    name: string;
    brand?: string;
    category?: string;
    imageUrl?: string;
}

type Step = "scan" | "form";

export default function AddStockPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("scan");
    const [scanning, setScanning] = useState(false);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupMessage, setLookupMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Form state
    const [product, setProduct] = useState<ProductInfo>({
        barcode: "",
        name: "",
        brand: "",
        category: "",
        imageUrl: "",
    });
    const [quantity, setQuantity] = useState(1);
    const [unit, setUnit] = useState("adet");
    const [location, setLocation] = useState("");
    const [alertThreshold, setAlertThreshold] = useState(5);
    const [notes, setNotes] = useState("");

    const handleScan = async (barcode: string) => {
        setScanning(false);
        setLookupLoading(true);
        setLookupMessage("Ürün bilgisi aranıyor...");
        setProduct((p) => ({ ...p, barcode }));
        setStep("form");

        try {
            const res = await fetch(`/api/product-lookup?barcode=${encodeURIComponent(barcode)}`);
            const data = await res.json();

            if (data.found && data.product) {
                setProduct(data.product);
                setLookupMessage("✅ Ürün bilgisi otomatik dolduruldu.");
            } else {
                setLookupMessage("⚠️ Ürün bulunamadı, lütfen manuel olarak doldurun.");
            }
        } catch {
            setLookupMessage("⚠️ Ürün sorgulanamadı, lütfen manuel doldurun.");
        } finally {
            setLookupLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setSaving(true);

        try {
            const res = await fetch("/api/stock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...product,
                    quantity,
                    unit,
                    location,
                    alertThreshold,
                    notes,
                }),
            });

            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || "Kaydetme başarısız");
            }

            router.push("/dashboard");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Bir hata oluştu");
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="page" style={{ maxWidth: 680 }}>
            <div className="page-header fade-up">
                <h1>➕ Stok Ekle</h1>
                <div style={{ display: "flex", gap: ".5rem" }}>
                    <button
                        className={`btn btn-sm ${step === "scan" ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setStep("scan")}
                    >
                        📷 Tara
                    </button>
                    <button
                        className={`btn btn-sm ${step === "form" ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setStep("form")}
                    >
                        ✏️ Manuel
                    </button>
                </div>
            </div>

            {/* Scanner Step */}
            {step === "scan" && (
                <div className="card fade-in" style={{ marginBottom: "1.5rem" }}>
                    <h3 style={{ marginBottom: "1rem" }}>Barkod / QR Tara</h3>
                    {scanning ? (
                        <Scanner
                            onScan={handleScan}
                            onClose={() => setScanning(false)}
                        />
                    ) : (
                        <div style={{ textAlign: "center", padding: "2rem" }}>
                            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📷</div>
                            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: ".9rem" }}>
                                Ürün barkodunu veya QR kodunu okutarak bilgileri otomatik doldurun
                            </p>
                            <button
                                id="open-scanner-btn"
                                className="btn btn-primary btn-lg"
                                onClick={() => setScanning(true)}
                            >
                                📷 Kamerayı Aç
                            </button>
                            <div className="divider" />
                            <button className="btn btn-ghost btn-sm" onClick={() => setStep("form")}>
                                Manuel giriş yap →
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Form Step */}
            {step === "form" && (
                <div className="card fade-in">
                    {lookupLoading && (
                        <div className="alert-bar" style={{ marginBottom: "1rem", background: "var(--accent-glow)", border: "1px solid rgba(99,102,241,0.3)", color: "var(--accent-light)" }}>
                            <span className="spinner" style={{ width: 16, height: 16 }} />
                            {lookupMessage}
                        </div>
                    )}
                    {!lookupLoading && lookupMessage && (
                        <div className={`alert-bar ${lookupMessage.startsWith("✅") ? "alert-bar-success" : "alert-bar-warning"}`} style={{ marginBottom: "1rem" }}>
                            {lookupMessage}
                        </div>
                    )}

                    {error && (
                        <div className="alert-bar alert-bar-danger" style={{ marginBottom: "1rem" }}>⚠️ {error}</div>
                    )}

                    {product.imageUrl && (
                        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={product.imageUrl} alt={product.name} style={{ height: 100, objectFit: "contain", borderRadius: 8 }} />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div className="form-group">
                                <label className="form-label">Barkod *</label>
                                <input
                                    id="f-barcode"
                                    type="text"
                                    className="form-input"
                                    value={product.barcode}
                                    onChange={(e) => setProduct((p) => ({ ...p, barcode: e.target.value }))}
                                    placeholder="1234567890123"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Kategori</label>
                                <input
                                    id="f-category"
                                    type="text"
                                    className="form-input"
                                    value={product.category || ""}
                                    onChange={(e) => setProduct((p) => ({ ...p, category: e.target.value }))}
                                    placeholder="Gıda, Elektronik..."
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Ürün Adı *</label>
                            <input
                                id="f-name"
                                type="text"
                                className="form-input"
                                value={product.name}
                                onChange={(e) => setProduct((p) => ({ ...p, name: e.target.value }))}
                                placeholder="Ürün adın girin"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Marka</label>
                            <input
                                id="f-brand"
                                type="text"
                                className="form-input"
                                value={product.brand || ""}
                                onChange={(e) => setProduct((p) => ({ ...p, brand: e.target.value }))}
                                placeholder="Marka"
                            />
                        </div>

                        <div className="divider" />

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                            <div className="form-group">
                                <label className="form-label">Miktar *</label>
                                <input
                                    id="f-quantity"
                                    type="number"
                                    className="form-input"
                                    min={0}
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Birim</label>
                                <select
                                    id="f-unit"
                                    className="form-input"
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                >
                                    {["adet", "kg", "litre", "paket", "kutu", "çuval", "koli"].map((u) => (
                                        <option key={u} value={u}>{u}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Uyarı Eşiği</label>
                                <input
                                    id="f-threshold"
                                    type="number"
                                    className="form-input"
                                    min={0}
                                    value={alertThreshold}
                                    onChange={(e) => setAlertThreshold(parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Lokasyon</label>
                            <input
                                id="f-location"
                                type="text"
                                className="form-input"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Raf A1, Depo 2..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Notlar</label>
                            <input
                                id="f-notes"
                                type="text"
                                className="form-input"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Ek bilgiler..."
                            />
                        </div>

                        <div style={{ display: "flex", gap: ".75rem", marginTop: ".5rem" }}>
                            <button
                                id="save-stock-btn"
                                type="submit"
                                className="btn btn-success btn-lg"
                                style={{ flex: 1 }}
                                disabled={saving}
                            >
                                {saving ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Kaydediliyor...</> : "✅ Kaydet"}
                            </button>
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => router.back()}
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
