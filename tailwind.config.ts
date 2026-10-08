import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#FCFAF7",
        sand: "#F1EBE4",
        ink: "#1F1A1D",
        muted: "#75696F",
        plum: "#5B2B82", // taken from the butterfly in the logo
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
