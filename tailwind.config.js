/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        surface: "#f9f9fe",
        "surface-low": "#f3f3f8",
        "surface-high": "#e8e8ed",
        "on-surface": "#1a1c1f",
        "on-surface-variant": "#414755",
        primary: "#0058bc",
        "primary-container": "#0070eb",
        tertiary: "#006b27",
        "tertiary-container": "#008733",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "outline-variant": "#c1c6d7",
        "primary-fixed": "#d8e2ff",
      },
      fontFamily: {
        headline: ["Manrope_700Bold", "Manrope_800ExtraBold", "System"],
        body: ["Inter_400Regular", "Inter_500Medium", "System"],
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
      },
      boxShadow: {
        cloud: "0 20px 40px rgba(26, 28, 31, 0.04)",
      },
    },
  },
  plugins: [],
};
