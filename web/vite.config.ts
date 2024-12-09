import * as fs from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import UnoCSS from 'unocss/vite'

const tileDir = fileURLToPath(new URL('../tile', import.meta.url))

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    UnoCSS(),
    {
      name: 'tile-server',
      configureServer(server) {
        server.middlewares.use('/tile', (req, res, next) => {
          const path = `${tileDir}${req.url?.split('?', 2)[0]}`
          if (fs.existsSync(path)) {
            res.statusCode = 200
            res.setHeader('Content-Type', 'image/png')
            fs.createReadStream(path).pipe(res)
          } else {
            res.statusCode = 404
          }
        })
      }
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  }
})
