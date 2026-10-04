import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17201B",
        panel: "#F7F4EE",
        moss: "#426B52",
        clay: "#A35D3A",
        steel: "#496577",
        gold: "#C99A2E"
      }
    }
  },
  plugins: []
};

export default config;
