"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CSVImportWizard } from "@/components/CSVImportWizard";

interface StockItem {
    id: string;
    quantity: number;
    unit: string;
    location?: string;
    alertThreshold: number;
    updatedAt: string;
    product: { name: string; brand?: string; barcode: string; imageUrl?: string };
    alerts: { id: string }[];
}

interface Stats {
    total: number;
    lowStock: number;
    alerts: number;
}

export default function DashboardPage() {
    const [stocks, setStocks] = useState<StockItem[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, lowStock: 0, alerts: 0 });
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [showImport, setShowImport] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData(q?: string) {
        setLoading(true);
        try {
            const [sRes, aRes] = await Promise.all([
                fetch(`/api/stock?search=${encodeURIComponent(q || "")}`, { cache: "no-store" }),
                fetch("/api/alerts"),
            ]);
            const sData = await sRes.json();
            const aData = await aRes.json();
            setStocks(sData.items || []);
            setStats({
                total: sData.total || 0,
                lowStock: (sData.items || []).filter((s: StockItem) => s.quantity <= s.alertThreshold).length,
                alerts: Array.isArray(aData) ? aData.length : 0,
            });
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = (val: string) => {
        setSearch(val);
        fetchData(val);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu stok kaydını silmek istediğinize emin misiniz?")) return;
        await fetch(`/api/stock/${id}`, { method: "DELETE" });
        fetchData(search);
    };

    const handleExport = () => {
        window.open("/api/stock/export", "_blank");
    };

    return (
        <main className="page">
            {showImport && <CSVImportWizard onClose={() => setShowImport(false)} onComplete={() => fetchData(search)} />}

            {/* Stats */}
            <div className="grid-4 fade-up" style={{ marginBottom: "2rem" }}>
                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-value" style={{ color: "var(--accent-light)" }}>{stats.total}</div>
                    <div className="stat-label">Toplam Stok</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-value" style={{ color: "var(--success)" }}>
                        {(stocks || []).filter((s) => s.quantity > s.alertThreshold).length}
                    </div>
                    <div className="stat-label">Normal Stok</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-value" style={{ color: "var(--warning)" }}>{stats.lowStock}</div>
                    <div className="stat-label">Düşük Stok</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🔔</div>
                    <div className="stat-value" style={{ color: "var(--danger)" }}>{stats.alerts}</div>
                    <div className="stat-label">Aktif Uyarı</div>
                </div>
            </div>

            {/* Alerts banner */}
            {stats.alerts > 0 && (
                <div className="alert-bar alert-bar-warning fade-up" style={{ marginBottom: "1.5rem" }}>
                    🔔 <strong>{stats.alerts} aktif stok uyarısı</strong> var.{" "}
                    <Link href="/alerts">Uyarıları görüntüle →</Link>
                </div>
            )}

            {/* Header + search */}
            <div className="page-header fade-up">
                <h1>Stok Listesi</h1>
                <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap", alignItems: "center" }}>
                    <input
                        id="stock-search"
                        type="text"
                        className="form-input"
                        placeholder="Ürün, marka veya barkod ara..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ minWidth: 220 }}
                    />
                    <div style={{ display: "flex", gap: ".5rem" }}>
                        <button className="btn btn-ghost" onClick={handleExport}>📥 Dışa Aktar</button>
                        <button className="btn btn-ghost" onClick={() => setShowImport(true)}>📤 İçe Aktar</button>
                        <Link href="/stock/add" className="btn btn-primary">
                            ➕ Stok Ekle
                        </Link>
                    </div>
                </div>
            </div>


            {/* Table */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "4rem" }}>
                    <span className="spinner" />
                </div>
            ) : stocks.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <div className="empty-state-title">Stok kaydı bulunamadı</div>
                    <Link href="/stock/add" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                        İlk stoku ekle
                    </Link>
                </div>
            ) : (
                <div className="table-wrap fade-up">
                    <table>
                        <thead>
                            <tr>
                                <th>Ürün</th>
                                <th>Barkod</th>
                                <th>Miktar</th>
                                <th>Lokasyon</th>
                                <th>Durum</th>
                                <th>Son Güncelleme</th>
                                <th>İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stocks.map((s) => {
                                const isLow = s.quantity <= s.alertThreshold;
                                return (
                                    <tr key={s.id}>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                                                {s.product.imageUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={s.product.imageUrl} alt="" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6, border: "1px solid var(--border)" }} />
                                                ) : (
                                                    <div style={{ width: 36, height: 36, borderRadius: 6, background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>📦</div>
                                                )}
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{s.product.name}</div>
                                                    {s.product.brand && <div style={{ fontSize: ".78rem", color: "var(--text-muted)" }}>{s.product.brand}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td><code style={{ fontSize: ".78rem", color: "var(--text-muted)" }}>{s.product.barcode}</code></td>
                                        <td>
                                            <strong style={{ color: isLow ? "var(--warning)" : "var(--text-primary)" }}>
                                                {s.quantity}
                                            </strong>{" "}
                                            <span style={{ color: "var(--text-muted)", fontSize: ".82rem" }}>{s.unit}</span>
                                        </td>
                                        <td style={{ color: "var(--text-secondary)", fontSize: ".88rem" }}>{s.location || "—"}</td>
                                        <td>
                                            {isLow ? (
                                                <span className="badge badge-warning">⚠️ Düşük</span>
                                            ) : (
                                                <span className="badge badge-success">✓ Normal</span>
                                            )}
                                        </td>
                                        <td style={{ color: "var(--text-muted)", fontSize: ".82rem" }}>
                                            {new Date(s.updatedAt).toLocaleDateString("tr-TR")}
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: ".4rem" }}>
                                                <Link href={`/stock/${s.id}/edit`} className="btn btn-ghost btn-sm">Düzenle</Link>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Sil</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}
