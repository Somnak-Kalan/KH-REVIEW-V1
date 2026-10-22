
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({

  plugins: [react()],
  assetsInclude: ['**/*.wasm'],
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'wasm') {
        return `/src/wasm/${filename}` // if you want to copy the WASM manually
      }
    }
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'], // 🛑 exclude from optimization
  },

  build: {
    chunkSizeWarningLimit: 1500,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          // keep your old one
          ffmpeg: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
          // NEW: put echarts in its own chunk
          echarts: ['echarts'],
          vendor: [
            'react',
            'react-dom',
            'antd'
          ]
        },
      },
    },
  },

  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['khreview.com'], // ✅ Add your domain here
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      pages: path.resolve(__dirname, './src/pages'),
      components: path.resolve(__dirname, './src/components'),
      services: path.resolve(__dirname, './src/services'),
      contexts: path.resolve(__dirname, './src/contexts'),
      assets: path.resolve(__dirname, './src/assets'),
      utils: path.resolve(__dirname, './src/utils'),
      permissionEnum: path.resolve(__dirname, './src/constants'),
      useCan: path.resolve(__dirname, './src/hooks'),
    }
    ,

    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.scss']
  },

  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
})
