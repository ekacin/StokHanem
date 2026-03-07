"use client";

import { useEffect, useState } from "react";

interface Alert {
    id: string;
    type: string;
    message: string;
    resolved: boolean;
    createdAt: string;
    stock: {
        id: string;
        quantity: number;
        unit: string;
        alertThreshold: number;
        product: { name: string; brand?: string; barcode: string; imageUrl?: string };
    };
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [resolving, setResolving] = useState<string | null>(null);

    useEffect(() => {
        fetchAlerts();
    }, []);

    async function fetchAlerts() {
        setLoading(true);
        const res = await fetch("/api/alerts");
        const data = await res.json();
        setAlerts(Array.isArray(data) ? data : []);
        setLoading(false);
    }

    async function resolveAlert(id: string) {
        setResolving(id);
        await fetch("/api/alerts", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        await fetchAlerts();
        setResolving(null);
    }

    return (
        <main className="page">
            <div className="page-header fade-up">
                <h1>🔔 Stok Uyarıları</h1>
                <button className="btn btn-ghost btn-sm" onClick={fetchAlerts}>
                    🔄 Yenile
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "4rem" }}>
                    <span className="spinner" />
                </div>
            ) : alerts.length === 0 ? (
                <div className="empty-state fade-up">
                    <div className="empty-state-icon">✅</div>
                    <div className="empty-state-title">Aktif uyarı yok</div>
                    <p style={{ color: "var(--text-muted)", fontSize: ".9rem" }}>Tüm stok seviyeleri normal.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {alerts.map((alert) => {
                        const pct = Math.max(0, Math.min(100, (alert.stock.quantity / (alert.stock.alertThreshold * 2)) * 100));
                        return (
                            <div key={alert.id} className="card fade-up" style={{ borderColor: "rgba(245,158,11,0.3)" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                                    {alert.stock.product.imageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={alert.stock.product.imageUrl} alt="" style={{ width: 52, height: 52, objectFit: "contain", borderRadius: 8, border: "1px solid var(--border)", flexShrink: 0 }} />
                                    ) : (
                                        <div style={{ width: 52, height: 52, borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>📦</div>
                                    )}

                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: ".6rem", flexWrap: "wrap", marginBottom: ".35rem" }}>
                                            <h3>{alert.stock.product.name}</h3>
                                            <span className="badge badge-warning">⚠️ Düşük Stok</span>
                                        </div>
                                        {alert.stock.product.brand && (
                                            <p style={{ fontSize: ".82rem", color: "var(--text-muted)", marginBottom: ".35rem" }}>{alert.stock.product.brand}</p>
                                        )}
                                        <p style={{ fontSize: ".88rem", color: "var(--text-secondary)", marginBottom: ".75rem" }}>
                                            {alert.message}
                                        </p>

                                        {/* Progress bar */}
                                        <div style={{ marginBottom: ".75rem" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".78rem", color: "var(--text-muted)", marginBottom: ".3rem" }}>
                                                <span>Mevcut: <strong style={{ color: "var(--warning)" }}>{alert.stock.quantity} {alert.stock.unit}</strong></span>
                                                <span>Eşik: {alert.stock.alertThreshold} {alert.stock.unit}</span>
                                            </div>
                                            <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                                                <div style={{
                                                    height: "100%",
                                                    width: `${pct}%`,
                                                    borderRadius: 3,
                                                    background: pct < 50 ? "var(--danger)" : "var(--warning)",
                                                    transition: "width .5s ease",
                                                }} />
                                            </div>
                                        </div>

                                        <p style={{ fontSize: ".78rem", color: "var(--text-muted)" }}>
                                            {new Date(alert.createdAt).toLocaleString("tr-TR")}
                                        </p>
                                    </div>

                                    <button
                                        id={`resolve-alert-${alert.id}`}
                                        className="btn btn-success btn-sm"
                                        onClick={() => resolveAlert(alert.id)}
                                        disabled={resolving === alert.id}
                                        style={{ flexShrink: 0 }}
                                    >
                                        {resolving === alert.id ? (
                                            <span className="spinner" style={{ width: 14, height: 14 }} />
                                        ) : "✓ Çözüldü"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
