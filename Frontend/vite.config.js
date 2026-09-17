import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: "es2020",
    minify: "esbuild",
    cssMinify: "esbuild",
    cssCodeSplit: true,
    sourcemap: false,
    assetsInlineLimit: 4096,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": [
            "react",
            "react-dom",
            "react-router-dom",
            "react-redux",
          ],
          "ui-vendor": [
            "framer-motion",
            "@tsparticles/react",
            "lucide-react",
            "react-icons",
          ],
          "form-vendor": [
            "react-google-recaptcha",
            "react-toastify",
            "react-hot-toast",
          ],
          "animation-vendor": ["gsap", "three", "@react-three/fiber"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "@reduxjs/toolkit",
      "react-redux",
    ],
  },
});
