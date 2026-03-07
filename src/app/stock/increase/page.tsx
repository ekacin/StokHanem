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

type Step = "scan" | "confirm" | "quick-create";

export default function StockIncreasePage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("scan");
    const [scanning, setScanning] = useState(false);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupMessage, setLookupMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form state for confirm/adjust
    const [product, setProduct] = useState<ProductInfo | null>(null);
    const [amount, setAmount] = useState(1);
    const [manualBarcode, setManualBarcode] = useState("");

    // Form state for quick create (matching AddStockPage)
    const [newProduct, setNewProduct] = useState({
        barcode: "",
        name: "",
        brand: "",
        category: "",
        imageUrl: "",
    });
    const [newQuantity, setNewQuantity] = useState(1);
    const [newUnit, setNewUnit] = useState("adet");
    const [newLocation, setNewLocation] = useState("");
    const [newAlertThreshold, setNewAlertThreshold] = useState(5);
    const [newNotes, setNewNotes] = useState("");

    const handleScan = async (barcode: string) => {
        setScanning(false);
        setLookupLoading(true);
        setError("");
        setSuccess("");
        setLookupMessage("Ürün bilgisi aranıyor...");

        try {
            // Check if product exists in OUR database first
            const stockRes = await fetch(`/api/stock?search=${encodeURIComponent(barcode)}&limit=100`);
            const stockData = await stockRes.json();
            const existing = stockData.items.find((i: any) => i.product.barcode === barcode);

            if (existing) {
                setProduct({ ...existing.product, stocks: [{ quantity: existing.quantity }] });
                setStep("confirm");
            } else {
                // If not in DB, try external lookup to prepopulate full info
                const lookupRes = await fetch(`/api/product-lookup?barcode=${encodeURIComponent(barcode)}`);
                const lookupData = await lookupRes.json();

                const fetchedProduct = {
                    barcode: barcode,
                    name: lookupData.product?.name || "",
                    brand: lookupData.product?.brand || "",
                    category: lookupData.product?.category || "",
                    imageUrl: lookupData.product?.imageUrl || "",
                };

                setNewProduct(fetchedProduct);

                if (lookupData.found) {
                    setLookupMessage("✅ Ürün bilgisi otomatik dolduruldu.");
                } else {
                    setLookupMessage("⚠️ Ürün bulunamadı, lütfen manuel olarak doldurun.");
                }
                setStep("quick-create");
            }
        } catch (err) {
            console.error(err);
            setError("Ürün sorgulanamadı. Lütfen tekrar deneyin.");
        } finally {
            setLookupLoading(false);
        }
    };

    const handleQuickCreate = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const res = await fetch("/api/stock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newProduct,
                    quantity: newQuantity,
                    unit: newUnit,
                    location: newLocation,
                    alertThreshold: newAlertThreshold,
                    notes: newNotes,
                }),
            });

            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || "Ürün oluşturulamadı");
            }

            const newStock = await res.json();
            setProduct({ ...newStock.product, stocks: [{ quantity: newStock.quantity }] });
            setStep("confirm");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleManualSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (manualBarcode.trim()) handleScan(manualBarcode.trim());
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!product) return;

        setError("");
        setSaving(true);

        try {
            const res = await fetch("/api/stock/adjust", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    barcode: product.barcode,
                    amount: amount,
                    name: product.name,
                    brand: product.brand,
                    imageUrl: product.imageUrl,
                    category: product.category
                }),
            });

            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || "Kaydetme başarısız");
            }

            setSuccess(`✅ ${amount} adet başarıyla eklendi!`);
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
                <h1>➕ Stok Arttır</h1>
                <p style={{ color: "var(--text-secondary)" }}>Ürün tarayarak veya manuel barkod ile stok ekleyin.</p>
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

            {/* Scanner Step */}
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
                                style={{ width: "100%", marginBottom: "1.5rem" }}
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
                                <button type="submit" className="btn btn-ghost" disabled={lookupLoading}>Ara</button>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* Quick Create Step (Full Form) */}
            {step === "quick-create" && (
                <div className="card fade-in">
                    <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                        <div style={{ fontSize: "2rem", marginBottom: ".5rem" }}>🆕</div>
                        <h3>Yeni Ürün Kaydı</h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: ".9rem" }}>Barkod ({newProduct.barcode}) sistemde yok. Bilgileri doğrulayın.</p>
                    </div>

                    {!lookupLoading && lookupMessage && (
                        <div className={`alert-bar ${lookupMessage.startsWith("✅") ? "alert-bar-success" : "alert-bar-warning"}`} style={{ marginBottom: "1rem" }}>
                            {lookupMessage}
                        </div>
                    )}

                    {newProduct.imageUrl && (
                        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                            <img src={newProduct.imageUrl} alt={newProduct.name} style={{ height: 100, objectFit: "contain", borderRadius: 8 }} />
                        </div>
                    )}

                    <form onSubmit={handleQuickCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div className="form-group">
                                <label className="form-label">Barkod *</label>
                                <input type="text" className="form-input" value={newProduct.barcode} readOnly />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Kategori</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newProduct.category}
                                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Ürün Adı *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Marka</label>
                            <input
                                type="text"
                                className="form-input"
                                value={newProduct.brand}
                                onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                            />
                        </div>

                        <div className="divider" />

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                            <div className="form-group">
                                <label className="form-label">Miktar *</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    min={0}
                                    value={newQuantity}
                                    onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Birim</label>
                                <select
                                    className="form-input"
                                    value={newUnit}
                                    onChange={(e) => setNewUnit(e.target.value)}
                                >
                                    {["adet", "kg", "litre", "paket", "kutu", "çuval", "koli"].map((u) => (
                                        <option key={u} value={u}>{u}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Uyarı Eşiği</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    min={0}
                                    value={newAlertThreshold}
                                    onChange={(e) => setNewAlertThreshold(parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Lokasyon</label>
                            <input
                                type="text"
                                className="form-input"
                                value={newLocation}
                                onChange={(e) => setNewLocation(e.target.value)}
                                placeholder="Raf A1..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Notlar</label>
                            <input
                                type="text"
                                className="form-input"
                                value={newNotes}
                                onChange={(e) => setNewNotes(e.target.value)}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "1rem", marginTop: ".5rem" }}>
                            <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={saving}>
                                {saving ? <><span className="spinner" /> Kaydediliyor...</> : "✅ Oluştur ve Devam Et"}
                            </button>
                            <button type="button" className="btn btn-ghost" onClick={() => { setStep("scan"); setProduct(null); }}>İptal</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Confirmation Step */}
            {step === "confirm" && product && (
                <div className="card fade-in">
                    <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                        {product.imageUrl && (
                            <img src={product.imageUrl} alt={product.name} style={{ width: 80, height: 80, objectFit: "contain", borderRadius: 8, background: "white" }} />
                        )}
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: 0 }}>{product.name}</h3>
                            <p style={{ color: "var(--text-muted)", margin: ".25rem 0", fontSize: ".9rem" }}>{product.brand || "Markasız"} | {product.barcode}</p>
                            <div style={{ marginTop: ".75rem", padding: ".5rem .75rem", borderRadius: 8, background: "rgba(99,102,241,0.1)", display: "inline-block" }}>
                                <span style={{ color: "var(--text-secondary)", fontSize: ".8rem" }}>Mevcut Stok:</span>
                                <strong style={{ marginLeft: ".5rem", color: "var(--accent-light)" }}>
                                    {product.stocks?.[0]?.quantity ?? 0}
                                </strong>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div className="form-group">
                            <label className="form-label">Eklenecek Miktar</label>
                            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                <button type="button" className="btn btn-ghost" style={{ padding: "0 1rem", fontSize: "1.5rem" }} onClick={() => setAmount(Math.max(1, amount - 1))}>-</button>
                                <input
                                    type="number"
                                    className="form-input"
                                    style={{ textAlign: "center", fontSize: "1.5rem", height: "auto", padding: ".5rem" }}
                                    min={1}
                                    value={amount}
                                    onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
                                    required
                                />
                                <button type="button" className="btn btn-ghost" style={{ padding: "0 1rem", fontSize: "1.5rem" }} onClick={() => setAmount(amount + 1)}>+</button>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button
                                type="submit"
                                className="btn btn-success btn-lg"
                                style={{ flex: 1 }}
                                disabled={saving}
                            >
                                {saving ? <><span className="spinner" /> Kaydediliyor...</> : `✅ Arttır (${product.stocks?.[0]?.quantity ?? 0} + ${amount})`}
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
