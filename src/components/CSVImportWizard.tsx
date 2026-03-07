"use client";

import { useState } from "react";

export function CSVImportWizard({ onClose, onComplete }: { onClose: () => void, onComplete: () => void }) {
    const [step, setStep] = useState(1);
    const [preview, setPreview] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError("");

        try {
            const text = await file.text();
            const lines = text.split("\n").filter(l => l.trim());
            const headers = lines[0].split(",");
            const rows = lines.slice(1).map(line => {
                const values = line.split(",");
                const obj: any = {};
                headers.forEach((h, i) => obj[h.trim()] = values[i]?.trim());
                return obj;
            });

            const res = await fetch("/api/stock/import/preview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rows })
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);
            setPreview(data.previewData);
            setStep(2);
        } catch (err: any) {
            setError("Dosya okuma hatası: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/stock/import/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: preview.filter(p => p.isValid) })
            });
            const data = await res.json();
            if (data.success) {
                onComplete();
                onClose();
            } else {
                throw new Error(data.error);
            }
        } catch (err: any) {
            setError("İçe aktarım hatası: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <div className="card fade-up" style={{ maxWidth: 800, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <h2>CSV İçe Aktar (Güvenli)</h2>
                    <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
                </div>

                {error && <div className="alert-bar alert-bar-danger" style={{ marginBottom: "1rem" }}>{error}</div>}

                <div style={{ flex: 1, overflowY: "auto" }}>
                    {step === 1 && (
                        <div style={{ textAlign: "center", padding: "3rem" }}>
                            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📄</div>
                            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Lütfen "Dışa Aktar" formatındaki CSV dosyasını seçin.</p>
                            <input type="file" accept=".csv" onChange={handleFile} disabled={loading} />
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <p style={{ marginBottom: "1rem", color: "var(--text-secondary)" }}>Aşağıdaki değişiklikler uygulanacak. Lütfen kontrol edin:</p>
                            <div className="table-wrap">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Barkod</th>
                                            <th>Ürün</th>
                                            <th>Durum</th>
                                            <th>Mevcut</th>
                                            <th>Yeni</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.map((p, i) => (
                                            <tr key={i} style={{ opacity: p.isValid ? 1 : 0.5 }}>
                                                <td style={{ fontSize: ".8rem" }}>{p.barcode}</td>
                                                <td>{p.name}</td>
                                                <td>
                                                    <span className={`badge ${p.status === 'NEW' ? 'badge-success' : 'badge-accent'}`}>
                                                        {p.status === 'NEW' ? 'Yeni Ürün' : 'Güncelleme'}
                                                    </span>
                                                </td>
                                                <td>{p.currentQty}</td>
                                                <td style={{ color: "var(--accent-light)", fontWeight: 600 }}>{p.newQty}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                    {step === 2 && (
                        <button className="btn btn-primary" onClick={handleConfirm} disabled={loading}>
                            {loading ? <span className="spinner" /> : "Onayla ve Uygula"}
                        </button>
                    )}
                    <button className="btn btn-ghost" onClick={onClose} disabled={loading}>İptal</button>
                </div>
            </div>
        </div>
    );
}
