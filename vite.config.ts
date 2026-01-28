import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import React from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    React(),
    tailwindcss(),

    VitePWA({
      // CHANGED: Use "prompt" instead of "autoUpdate" for better control
      // This gives us control over when to reload the page
      registerType: "prompt",
      outDir: "dist",

      manifest: {
        name: "INUK LAZISNU",
        short_name: "INUK",
        description: "Sistem Transparansi dan Donasi Infaq NU Kudus",
        theme_color: "#10B981",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        scope: "/",
        orientation: "portrait-primary",
        icons: [
          {
            src: "/logo192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/logo512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/logo512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        categories: ["finance", "productivity"],
      },

      workbox: {
        // FIXED PROBLEM 1: Removed 'html' from globPatterns
        // HTML files should NOT be precached - they must always be fetched fresh
        // so that users get references to new JS/CSS files immediately
        globPatterns: [
          "**/*.{js,css,ico,png,svg,jpg,jpeg,webp,woff,woff2,webmanifest}"
          // Notice: NO 'html' in this list!
        ],
        
        cleanupOutdatedCaches: true,
        
        // Navigation fallback for offline mode
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [
          /^\/api/, 
          /^\/auth/,
          /^\/exports/,
          /^\/uploads/
        ],
        
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
        
        // FIXED PROBLEM 2: Added NetworkFirst strategy for HTML
        // This ensures HTML always comes from nginx (with your no-cache headers)
        // Only falls back to cache if offline
        runtimeCaching: [
          {
            // HTML FILES: Always fetch from network first
            urlPattern: ({ request }) => request.destination === 'document',
            handler: "NetworkFirst",
            options: {
              cacheName: "html-cache",
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60, // 1 hour max (safety fallback)
              },
              // Don't cache HTML if offline request fails
              plugins: [
                {
                  cacheWillUpdate: async ({ response }) => {
                    // Only cache successful responses
                    if (response && response.status === 200) {
                      return response;
                    }
                    return null;
                  },
                },
              ],
            },
          },
          {
            // JS/CSS: Use StaleWhileRevalidate
            // Shows cached version instantly, updates in background
            urlPattern: /\.(?:js|css)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "assets-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
              },
            },
          },
          {
            // Images: Cache first (images don't change often)
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
            // Fonts: Cache first (fonts never change)
            urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "fonts-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
              },
            },
          },
          {
            // Google Fonts CSS
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 365 * 24 * 60 * 60,
              },
            },
          },
          {
            // Google Font files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 365 * 24 * 60 * 60,
              },
            },
          },
          {
            // Exports: NEVER cache
            urlPattern: /\/exports\/donations\/.*/,
            handler: "NetworkOnly",
          },
          {
            // Uploads: Network first with short cache
            urlPattern: /\/uploads\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "uploads-cache",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60, // 1 day
              },
            },
          },
        ],
      },

      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],
});