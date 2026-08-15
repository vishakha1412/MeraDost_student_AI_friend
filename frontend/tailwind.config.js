/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        dost: {
          50: "#f2f6ff",
          100: "#e2eaff",
          200: "#c7d6ff",
          300: "#9db4ff",
          400: "#6f89ff",
          500: "#4a5cf7",
          600: "#3a3fe0",
          700: "#3030b5",
          800: "#282a8f",
          900: "#242670",
        },
        saffron: {
          400: "#ffb347",
          500: "#ff9a2e",
        },
        ink: "#0d1024",
      },
      fontFamily: {
        display: ["'Sora'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(74, 92, 247, 0.45)",
      },
      backgroundImage: {
        "dost-radial":
          "radial-gradient(circle at 20% 20%, rgba(74,92,247,0.25), transparent 40%), radial-gradient(circle at 80% 0%, rgba(255,154,46,0.18), transparent 35%)",
      },
    },
  },
  plugins: [],
};
