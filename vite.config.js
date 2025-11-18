import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/Mohapatra-Family/',
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
        name: 'Mohapatra family',
        short_name: 'MohapatraFamily',
        start_url: '/Mohapatra-Family/',
        display: 'standalone',
        background_color: '#ffffff00', // transparent background
        theme_color: '#000000',
        icons: [
          {
            src: 'icons/MohapatraFamily.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/MohapatraFamily.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/MohapatraFamily.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,json,webmanifest}'],
      },
    }),
  ],
})
