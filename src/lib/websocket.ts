import { WebSocketServer } from 'ws'
import { createServer } from 'http'

let wss: WebSocketServer | null = null

export function getWebSocketServer() {
  if (!wss) {
    const server = createServer()
    wss = new WebSocketServer({ server })
    
    wss.on('connection', (ws) => {
      console.log('Client connected to WebSocket')
      
      ws.on('close', () => {
        console.log('Client disconnected from WebSocket')
      })
    })

    const port = process.env.WS_PORT || 3001
    server.listen(port, () => {
      console.log(`WebSocket server running on port ${port}`)
    })
  }
  
  return wss
}

export function broadcastUpdate(data: { id: string; status: string; filePath?: string; error?: string; message?: string }) {
  const server = getWebSocketServer()
  
  server.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify(data))
    }
  })
}