/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      borderRadius: {
        md: "6px",
        lg: "8px",
        xl: "12px",
      },
      colors: {
        canvas: "#09090b",
        surface: {
          DEFAULT: "#121215",
          hover: "#18181b",
          elevated: "#1c1c21",
        },
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [],
};
