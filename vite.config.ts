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

      // Web App Manifest - the "identity card" for your PWA
      manifest: {
        name: "INUK LAZISNU",
        short_name: "INUK",
        description: "Sistem Transparansi dan Donasi Infaq NU Kudus",
        theme_color: "#10B981",
        background_color: "#ffffff",
        
        // IMPORTANT: These control how the app opens on Android/iOS
        display: "standalone", // Opens without browser UI, like a native app
        start_url: "/", // Where the app starts when launched
        scope: "/", // Which URLs are part of this PWA
        orientation: "portrait-primary", // Preferred screen orientation
        
        // FIXED: Icon paths must be relative to root, not to /public/
        // Vite automatically serves public files from root during build
        icons: [
          {
            src: "/logo192.png", // Changed from ./public/logo192.png
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/logo512.png", // Changed from ./public/logo512.png
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/logo512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable", // Allows Android to shape the icon
          },
        ],
        
        // Help users find your app (if published to app stores)
        categories: ["finance", "productivity"],
      },

      // Service Worker caching strategies
      workbox: {
        // Which files to cache automatically
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2,webmanifest}"
        ],
        
        // Clean up old caches when updating
        cleanupOutdatedCaches: true,
        
        // IMPORTANT: Changed to /index.html so offline navigation works
        // When offline, any navigation request will serve index.html
        navigateFallback: "/index.html",
        
        // Don't cache API calls with this fallback
        navigateFallbackDenylist: [/^\/api/, /^\/auth/],
        
        // Maximum file size to cache (2MB)
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
        
        // Runtime caching for different resource types
        runtimeCaching: [
          {
            // Cache images aggressively
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
              },
            },
          },
          {
            // Cache font files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
              },
            },
          },
        ],
      },

      // Enable PWA in development for testing
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],
});