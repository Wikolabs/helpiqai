import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Raleway'", "sans-serif"],
        body: ["'Karla'", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
