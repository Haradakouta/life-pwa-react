import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    // コード分割の最適化
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'ui-vendor': ['@mui/material', '@mui/icons-material', 'react-icons'],
          'chart-vendor': ['recharts'],
        },
      },
    },
    // チャンクサイズの警告を調整
    chunkSizeWarningLimit: 1000,
  },
  // 依存関係の最適化
  optimizeDeps: {
    include: ['react', 'react-dom', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
  },
})
