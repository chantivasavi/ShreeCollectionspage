import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#FAF6F0",
        sand: "#EFE7DB",
        ink: "#2B2320",
        muted: "#7A6E66",
        maroon: "#7A1F2B",
        gold: "#B08D57",
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ["Jost", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
