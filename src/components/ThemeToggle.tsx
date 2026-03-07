"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        const saved = localStorage.getItem("theme") || "light";
        setTheme(saved);
        document.documentElement.setAttribute("data-theme", saved);
    }, []);

    const toggle = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    return (
        <button
            onClick={toggle}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: "1.2rem", padding: "0 .5rem" }}
            title={theme === "dark" ? "Gündüz Modu" : "Gece Modu"}
        >
            {theme === "dark" ? "☀️" : "🌙"}
        </button>
    );
}
