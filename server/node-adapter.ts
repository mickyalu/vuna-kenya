import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleApi } from './handlers.ts'
import { logError } from './log.ts'

export async function nodeHandler(req: IncomingMessage, res: ServerResponse) {
  try {
    const host = req.headers.host || '127.0.0.1'
    const proto = (req.headers['x-forwarded-proto'] as string) || 'http'
    const url = `${proto}://${host}${req.url}`
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
    const response = (await handleApi(request)) ?? new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    res.statusCode = response.status
    response.headers.forEach((val, key) => {
      res.setHeader(key, val)
    })
    res.end(Buffer.from(await response.arrayBuffer()))
  } catch {
    logError('api handler failed')
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'internal' }))
  }
}

export default nodeHandler
