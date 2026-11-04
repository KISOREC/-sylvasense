/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          950: "#07120f",
          900: "#0d1d18",
          800: "#17352b",
          600: "#28704f",
          400: "#59a67a",
        },
      },
    },
  },
  plugins: [],
};
