// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary-color)",
        secondary: "var(--secondary-color)",
        light: "var(--light-color)",
        white: "var(--color-white)",
        inputFieldlabelColor:"black",
        gray: {
          light: "var(--color-gray-light)",
          medium: "var(--color-gray-medium)",
          dark: "var(--color-gray-dark)",
        },
        error: {
          light: "var(--color-error-light)",
          dark: "var(--color-error-dark)",
        },
      },
      keyframes: {
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        spin: "spin 1s linear infinite",
      },
    },
  },
  plugins: [],
};
