import { loadEnv, type Plugin } from 'vite'
import { handleApi } from './handlers.ts'

export function vunaApiPlugin(): Plugin {
  return {
    name: 'vuna-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '')
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] == null) process.env[key] = value
      }
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split('?')[0] || ''
        if (!path.startsWith('/api/') && !path.startsWith('/join/')) {
          next()
          return
        }
        void (async () => {
          const host = req.headers.host || '127.0.0.1'
          const url = `http://${host}${req.url}`
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(Buffer.from(chunk))
          const body = Buffer.concat(chunks)
          const headers = new Headers()
          for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === 'string') headers.set(key, value)
            else if (Array.isArray(value)) headers.set(key, value.join(','))
          }
          const method = req.method || 'GET'
          const request = new Request(url, {
            method,
            headers,
            body: method === 'GET' || method === 'HEAD' ? undefined : body,
          })
          const response = await handleApi(request)
          if (!response) {
            next()
            return
          }
          res.statusCode = response.status
          response.headers.forEach((val, key) => {
            res.setHeader(key, val)
          })
          res.end(Buffer.from(await response.arrayBuffer()))
        })().catch(() => {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'internal' }))
        })
      })
    },
  }
}
