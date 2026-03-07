"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("admin@stok.app");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("E-posta veya şifre hatalı.");
            setLoading(false);
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
                background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 60%), var(--bg-primary)",
            }}
        >
            <div className="fade-up" style={{ width: "100%", maxWidth: 420 }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                    <div style={{ fontSize: "3rem", marginBottom: ".75rem" }}>📦</div>
                    <h1 className="glow" style={{ fontSize: "1.8rem" }}>StokHanem</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: ".9rem", marginTop: ".5rem" }}>
                        Stok Yönetim Sistemine Hoş Geldiniz
                    </p>
                </div>

                <div className="card" style={{ padding: "2rem" }}>
                    <h2 style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>Giriş Yap</h2>

                    {error && (
                        <div className="alert-bar alert-bar-danger" style={{ marginBottom: "1rem" }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div className="form-group">
                            <label className="form-label">E-posta</label>
                            <input
                                id="email"
                                type="email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@stok.app"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Şifre</label>
                            <input
                                id="password"
                                type="password"
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            className="btn btn-primary btn-lg btn-full"
                            disabled={loading}
                            style={{ marginTop: ".5rem" }}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" style={{ width: 18, height: 18 }} />
                                    Giriş yapılıyor...
                                </>
                            ) : (
                                "Giriş Yap"
                            )}
                        </button>
                    </form>

                    <div className="divider" />
                    <p style={{ fontSize: ".8rem", color: "var(--text-muted)", textAlign: "center" }}>
                        Demo: <strong style={{ color: "var(--text-secondary)" }}>admin@stok.app</strong> / <strong style={{ color: "var(--text-secondary)" }}>admin123</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}
