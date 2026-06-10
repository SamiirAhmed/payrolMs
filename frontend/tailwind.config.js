/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#172554"
        },
        slate: {
          950: "#020617"
        }
      },
      boxShadow: {
        soft: "0 18px 40px rgba(15, 23, 42, 0.08)",
        glow: "0 12px 24px rgba(37, 99, 235, 0.14)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(37,99,235,0.12), transparent 38%), radial-gradient(circle at bottom right, rgba(14,165,233,0.16), transparent 28%)"
      }
    }
  },
  plugins: []
};
