import * as fs from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, PreviewServer, ViteDevServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import UnoCSS from 'unocss/vite'

const tileDir = fileURLToPath(new URL('../tile', import.meta.url))
const emptyTile = fileURLToPath(new URL('./src/assets/fallback_tile.png', import.meta.url))

function configureServer(server: ViteDevServer | PreviewServer) {
  server.middlewares.use('/tile', (req, res) => {
    const urlPath = req.url ? req.url.split('?', 2)[0] : '';
    const path = `${tileDir}${urlPath}`
    res.statusCode = 200
    res.setHeader('Content-Type', 'image/png')
    fs.createReadStream(
      fs.existsSync(path) ? path : emptyTile
    ).pipe(res)
  })
}

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    UnoCSS(),
    {
      name: 'tile-server',
      configureServer,
      configurePreviewServer: configureServer,
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  }
})
