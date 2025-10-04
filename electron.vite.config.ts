import tailwindcss from '@tailwindcss/vite'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@core': resolve('src/core'),
        '@main': resolve('src/main'),
        '@stores': resolve('src/core/stores')
      }
    },
    build: {
      outDir: 'dist/main',
      rollupOptions: {
        input: {
          index: resolve('src/main/index.ts'),
          'resize-and-compress-worker': resolve('src/core/api/resize-and-compress-worker.ts')
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin({
      exclude: ['@electron-toolkit/preload']
    })],
    resolve: {
      alias: {
        '@core': resolve('src/core'),
        '@preload': resolve('src/preload'),
        '@stores': resolve('src/core/stores')
      }
    },
    build: {
      outDir: 'dist/preload'
    }
  },
  renderer: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@components': resolve('src/renderer/ui/componets'),
        '@core': resolve('src/core'),
        '@db': resolve('src/db'),
        '@renderer': resolve('src/renderer'),
        '@stores': resolve('src/core/stores'),
        '@renderer-stores': resolve('src/renderer/stores'),
        '@ui': resolve('src/renderer/ui')
      }
    },
    build: {
      outDir: 'dist/renderer'
    }
  }
})
