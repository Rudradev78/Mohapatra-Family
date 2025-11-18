import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'   // ✅ YOU MISSED THIS

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),

    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: 'My Awesome PWA',
        short_name: 'Awesome PWA',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',

        icons: [
          {
            src: 'icons/FamilyApp.png',     // ❗ remove "./public/" — Vite handles it automatically
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/FamilyApp.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/FamilyApp.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,json,webmanifest}',
        ],
      },
    }),
  ],
})
