import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import React from "@vitejs/plugin-react";

import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    React(),
    tailwindcss(),

    VitePWA({
      registerType: "autoUpdate",
      outDir: "dist",

      // 1. Manifest Web App
      manifest: {
        name: "INUK LAZISNU",
        short_name: "INUK",
        description: "Sistem Transparansi dan Donasi Infaq NU Kudus",
        theme_color: "#10B981",
        background_color: "#ffffff",
        icons: [
          {
            src: "./public/logo192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "./public/logo512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "./public/logo512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },

      // 2. Caching
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,webmanifest}"],
        cleanupOutdatedCaches: true,
        navigateFallback: null,
      },

      devOptions: {
        enabled: true,
      },
    }),
  ],
});
