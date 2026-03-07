"use client";

import { useEffect, useState } from "react";

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/analytics")
            .then(res => res.json())
            .then(d => {
                if (!d.error) setData(d);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="page" style={{ textAlign: "center", padding: "4rem" }}><span className="spinner" /></div>;
    if (!data) return <div className="page" style={{ textAlign: "center", padding: "4rem" }}>Yükleme hatası.</div>;

    return (
        <main className="page">
            <div className="page-header fade-up">
                <h1>📊 Stok Analizi</h1>
                <p style={{ color: "var(--text-secondary)" }}>Ürün hareketleri ve stok öngörüleri.</p>
            </div>

            <div className="grid-2 fade-in">
                <div className="card">
                    <h3>🚀 En Hızlı Tükenen (Son 30 Gün)</h3>
                    <div style={{ marginTop: "1rem" }}>
                        {data.fastestProducts.map((p: any) => (
                            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: ".75rem 0", borderBottom: "1px solid var(--border)" }}>
                                <span>{p.name}</span>
                                <strong style={{ color: "var(--danger)" }}>-{p.totalAmount}</strong>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3>📥 En Çok Giren (Son 30 Gün)</h3>
                    <div style={{ marginTop: "1rem" }}>
                        {data.topProducts.map((p: any) => (
                            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: ".75rem 0", borderBottom: "1px solid var(--border)" }}>
                                <span>{p.name}</span>
                                <strong style={{ color: "var(--success)" }}>+{p.totalAmount}</strong>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card fade-in" style={{ marginTop: "1.5rem" }}>
                <h3>📉 30 Günlük Stok Hareket Grafiği</h3>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: 200, marginTop: "2rem", paddingBottom: "1rem" }}>
                    {data.graphData.map((d: any, i: number) => {
                        const max = Math.max(...data.graphData.map((x: any) => x.inc + x.dec)) || 1;
                        return (
                            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%", gap: "2px" }}>
                                <div style={{ height: `${(d.inc / max) * 100}%`, background: "var(--success)", opacity: 0.7, borderRadius: "2px 2px 0 0" }} title={`Giriş: ${d.inc}`} />
                                <div style={{ height: `${(d.dec / max) * 100}%`, background: "var(--danger)", opacity: 0.7, borderRadius: "0 0 2px 2px" }} title={`Çıkış: ${d.dec}`} />
                            </div>
                        );
                    })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".7rem", color: "var(--text-muted)", marginTop: ".5rem" }}>
                    <span>30 Gün Önce</span>
                    <span>Bugün</span>
                </div>
            </div>

            <div className="card fade-in" style={{ marginTop: "1.5rem" }}>
                <h3>⏳ Stok Bitme Tahmini</h3>
                <div className="table-wrap" style={{ marginTop: "1rem" }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Ürün</th>
                                <th>Mevcut Stok</th>
                                <th>Tahmini Kalan Süre</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.predictions.map((p: any, i: number) => (
                                <tr key={i}>
                                    <td>{p.name}</td>
                                    <td>{p.quantity}</td>
                                    <td>
                                        <span className={`badge ${p.daysLeft < 7 ? 'badge-danger' : 'badge-warning'}`}>
                                            {p.daysLeft} Gün
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
