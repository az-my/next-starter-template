"use client";
import { Toggle } from "@/components/ui/toggle";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <Toggle
      aria-label="Toggle theme"
      pressed={theme === "dark"}
      onPressedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="ml-auto"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </Toggle>
  );
} 