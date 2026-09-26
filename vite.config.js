import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-192.png', 'logo-512.png'],
      manifest: {
        name: 'SIM Bendahara Pondok',
        short_name: 'Bendahara',
        description: 'Aplikasi Manajemen Keuangan Pondok Pesantren',
        theme_color: '#059669', 
        background_color: '#ffffff',
        display: 'standalone', 
        icons: [
          {
            src: '/logo-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
