import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      backgroundColor: {
        pink: {
          deepRed: "#ff0000",
          lightRed: "#E3170D",
          base: "#ff79b0",
          crimson: "#FF4081",
        },
      },
      fontFamily: {
        mona: ["var(--font-mona-sans)"],
        serif: ["var(--font-source-serif)"],
        helveticaRounded: ["var(--font-helveticaRounded)"],
      },
    },
  },
  plugins: [],
} satisfies Config;
