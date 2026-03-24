/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        surface: "#fbfbfe",
        "surface-low": "#f5f6fa",
        "surface-high": "#ebecee",
        "on-surface": "#0f172a",
        "on-surface-variant": "#64748b",
        primary: "#2563eb",
        "primary-container": "#3b82f6",
        secondary: "#8b5cf6",
        "secondary-container": "#a78bfa",
        tertiary: "#10b981",
        "tertiary-container": "#34d399",
        error: "#ef4444",
        "error-container": "#fee2e2",
        "outline-variant": "#e2e8f0",
        "primary-fixed": "#dbeafe",
      },
      fontFamily: {
        headline: ["Manrope_700Bold", "Manrope_800ExtraBold", "System"],
        body: ["Inter_400Regular", "Inter_500Medium", "Inter_600SemiBold", "System"],
      },
      borderRadius: {
        lg: "1.25rem",
        xl: "1.75rem",
        "2xl": "2.25rem",
        "3xl": "3rem",
      },
      boxShadow: {
        cloud: "0 10px 30px rgba(0, 0, 0, 0.05)",
        elevated: "0 20px 50px rgba(37, 99, 235, 0.08)",
      },
    },
  },
  plugins: [],
};
