import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Hiragino Kaku Gothic ProN",
          "Meiryo",
          "sans-serif",
        ],
      },
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#bcd3ff",
          300: "#8fb6ff",
          400: "#5b8dff",
          500: "#356bf0",
          600: "#234fd6",
          700: "#1e40ad",
          800: "#1e388a",
          900: "#1d326e",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
