/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        surface: "#f9f9fe",
        "surface-container-low": "#f3f3f8",
        "surface-container": "#ededf2",
        "surface-container-high": "#e8e8ed",
        "surface-container-highest": "#e2e2e7",
        "surface-container-lowest": "#ffffff",
        "on-surface": "#1a1c1f",
        "on-surface-variant": "#414755",
        primary: "#0058bc",
        "primary-container": "#0070eb",
        secondary: "#5d5e63",
        "secondary-container": "#e0dfe4",
        tertiary: "#006b27",
        "tertiary-container": "#008733",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "outline-variant": "#c1c6d7",
        "primary-fixed": "#d8e2ff",
      },
      fontFamily: {
        headline: ["Manrope_700Bold", "Manrope_800ExtraBold", "System"],
        body: ["Inter_400Regular", "Inter_500Medium", "Inter_600SemiBold", "System"],
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        "2xl": "3.5rem",
        "3xl": "4.5rem",
      },
      boxShadow: {
        cloud: "0 20px 40px rgba(26, 28, 31, 0.04)",
        elevated: "0 20px 50px rgba(0, 88, 188, 0.08)",
      },
    },
  },
  plugins: [],
};
