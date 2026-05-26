import uiPreset from "@atom-ai/ui/tailwind-preset";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  presets: [uiPreset],
  theme: {
    extend: {},
  },
};
