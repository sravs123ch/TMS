// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//    assetsInclude: ['**/*.lottie'],
//   server: {
//     port: 7001,
//   },
// })

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.lottie"],
  server: {
    port: 7001,
    proxy: {
      "/api": {
        target: "http://82.180.147.10:7002",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
});
