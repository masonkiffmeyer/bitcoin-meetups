import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bitcoin: {
          orange: "#F7931A",
          orangeDark: "#D97B0E",
          orangeLight: "#FFB547",
        },
        bg: {
          dark: "#0A0E1A",
          card: "#111726",
          elevated: "#1A2033",
        },
        ink: {
          primary: "#FFFFFF",
          secondary: "#B5B8C2",
          muted: "#8B8F9B",
          dim: "#5C616D",
        },
        line: {
          subtle: "rgba(255,255,255,0.08)",
          soft: "rgba(255,255,255,0.12)",
          strong: "rgba(255,255,255,0.2)",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
