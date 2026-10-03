"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("app_theme") as "light" | "dark" | null;
    const initial = saved || "light";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("app_theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-secondary btn-sm"
      title={`Beralih ke mode ${theme === "light" ? "gelap" : "terang"}`}
      style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
    >
      {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
      <span style={{ fontSize: "0.78rem" }}>
        {theme === "light" ? "Mode Gelap" : "Mode Terang"}
      </span>
    </button>
  );
}
