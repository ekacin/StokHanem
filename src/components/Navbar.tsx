"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);

    if (pathname === "/login") return null;
    if (!session) return null;

    const handleSignOut = async () => {
        setLoading(true);
        await signOut({ callbackUrl: "/login" });
    };

    const links = [
        { href: "/dashboard", label: "Dashboard", icon: "📊" },
        { href: "/stock/increase", label: "Stok Arttır", icon: "➕" },
        { href: "/stock/decrease", label: "Stok Düşür", icon: "➖" },
        { href: "/analytics", label: "Analiz", icon: "📊" },
        { href: "/stock/logs", label: "Günlük", icon: "📋" },

        { href: "/alerts", label: "Uyarılar", icon: "🔔" },
    ];


    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link href="/dashboard" className="navbar-brand">
                    <span>📦</span> StokHanem
                </Link>
                <div className="navbar-links">
                    {links.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className={`nav-link${pathname?.startsWith(l.href) ? " active" : ""}`}
                        >
                            <span>{l.icon}</span>
                            <span>{l.label}</span>
                        </Link>
                    ))}
                </div>
                <div className="navbar-actions">
                    <ThemeToggle />
                    <span style={{ fontSize: ".8rem", color: "var(--text-secondary)" }}>
                        {session.user?.email}
                    </span>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={handleSignOut}
                        disabled={loading}
                    >
                        {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : "Çıkış"}
                    </button>
                </div>
            </div>
        </nav>
    );
}
