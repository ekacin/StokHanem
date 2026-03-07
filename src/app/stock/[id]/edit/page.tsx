"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";

interface StockData {
    id: string;
    quantity: number;
    unit: string;
    location?: string;
    alertThreshold: number;
    notes?: string;
    product: {
        barcode: string;
        name: string;
        brand?: string;
        category?: string;
        imageUrl?: string;
    };
}

export default function EditStockPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [data, setData] = useState<StockData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [quantity, setQuantity] = useState(0);
    const [unit, setUnit] = useState("adet");
    const [location, setLocation] = useState("");
    const [alertThreshold, setAlertThreshold] = useState(5);
    const [notes, setNotes] = useState("");

    useEffect(() => {
        fetch(`/api/stock/${id}`)
            .then((r) => r.json())
            .then((d: StockData) => {
                setData(d);
                setQuantity(d.quantity);
                setUnit(d.unit);
                setLocation(d.location || "");
                setAlertThreshold(d.alertThreshold);
                setNotes(d.notes || "");
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSaving(true);

        try {
            const res = await fetch(`/api/stock/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity, unit, location, alertThreshold, notes }),
            });

            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || "Güncelleme başarısız");
            }

            setSuccess("✅ Stok başarıyla güncellendi.");
            setTimeout(() => router.push("/dashboard"), 1000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Bir hata oluştu");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main className="page" style={{ textAlign: "center", paddingTop: "4rem" }}>
                <span className="spinner" />
            </main>
        );
    }

    if (!data) {
        return (
            <main className="page">
                <div className="alert-bar alert-bar-danger">Stok kaydı bulunamadı.</div>
            </main>
        );
    }

    return (
        <main className="page" style={{ maxWidth: 600 }}>
            <div className="page-header fade-up">
                <h1>✏️ Stok Düzenle</h1>
            </div>

            {/* Product info card */}
            <div className="card fade-up" style={{ marginBottom: "1.5rem", padding: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    {data.product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={data.product.imageUrl} alt={data.product.name} style={{ width: 60, height: 60, objectFit: "contain", borderRadius: 8, border: "1px solid var(--border)" }} />
                    ) : (
                        <div style={{ width: 60, height: 60, borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>📦</div>
                    )}
                    <div>
                        <h3>{data.product.name}</h3>
                        {data.product.brand && <p style={{ color: "var(--text-muted)", fontSize: ".85rem" }}>{data.product.brand}</p>}
                        <code style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>{data.product.barcode}</code>
                    </div>
                </div>
            </div>

            <div className="card fade-up">
                {error && <div className="alert-bar alert-bar-danger" style={{ marginBottom: "1rem" }}>⚠️ {error}</div>}
                {success && <div className="alert-bar alert-bar-success" style={{ marginBottom: "1rem" }}>{success}</div>}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                        <div className="form-group">
                            <label className="form-label">Miktar *</label>
                            <input
                                id="edit-quantity"
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
                                id="edit-unit"
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
                                id="edit-threshold"
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
                            id="edit-location"
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
                            id="edit-notes"
                            type="text"
                            className="form-input"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ek bilgiler..."
                        />
                    </div>

                    <div style={{ display: "flex", gap: ".75rem", marginTop: ".5rem" }}>
                        <button
                            id="update-stock-btn"
                            type="submit"
                            className="btn btn-primary btn-lg"
                            style={{ flex: 1 }}
                            disabled={saving}
                        >
                            {saving ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Güncelleniyor...</> : "💾 Güncelle"}
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => router.back()}>İptal</button>
                    </div>
                </form>
            </div>
        </main>
    );
}
