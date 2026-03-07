"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Log {
    id: string;
    type: string;
    amount: number;
    prevQty: number;
    newQty: number;
    createdAt: string;
    product: {
        name: string;
        barcode: string;
        brand?: string;
        imageUrl?: string;
    };
    user: {
        name?: string;
        email: string;
    };
}


export default function StockLogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/stock/logs")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setLogs(data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <main className="page">
            <div className="page-header fade-up">
                <h1>📋 İşlem Günlüğü</h1>
                <p style={{ color: "var(--text-secondary)" }}>Son yapılan stok artış ve azalış işlemlerini takip edin.</p>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "3rem" }}>
                    <span className="spinner" style={{ width: 40, height: 40 }} />
                </div>
            ) : logs.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                    <p style={{ color: "var(--text-muted)" }}>Henüz bir işlem kaydı bulunmuyor.</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Ürün</th>
                                    <th>İşlem</th>
                                    <th>Miktar</th>
                                    <th>Önceki</th>
                                    <th>Yeni</th>
                                    <th>Kullanıcı</th>
                                    <th>Tarih</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id} className="fade-in">
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
                                                {log.product.imageUrl && (
                                                    <img src={log.product.imageUrl} alt="" style={{ width: 32, height: 32, objectFit: "contain", borderRadius: 4, background: "white" }} />
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{log.product.name}</div>
                                                    <div style={{ fontSize: ".7rem", color: "var(--text-muted)" }}>{log.product.barcode}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: ".25rem .5rem",
                                                borderRadius: 4,
                                                fontSize: ".75rem",
                                                background: log.type === "INCREASE" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                                                color: log.type === "INCREASE" ? "var(--success)" : "var(--danger)"
                                            }}>
                                                {log.type === "INCREASE" ? "🟢 Giriş" : "🔴 Çıkış"}
                                            </span>
                                        </td>
                                        <td><strong>{log.amount}</strong></td>
                                        <td style={{ color: "var(--text-muted)" }}>{log.prevQty}</td>
                                        <td style={{ color: "var(--accent-light)", fontWeight: 600 }}>{log.newQty}</td>
                                        <td style={{ fontSize: ".8rem", color: "var(--text-secondary)" }}>
                                            {log.user?.name || log.user?.email?.split("@")[0] || "Sistem"}
                                        </td>

                                        <td style={{ fontSize: ".85rem" }}>
                                            {new Date(log.createdAt).toLocaleString("tr-TR")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </main>
    );
}
