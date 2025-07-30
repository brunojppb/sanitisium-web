import { NextResponse } from 'next/server'
import { getWebSocketServer } from '@/lib/websocket'

export async function GET() {
  try {
    // Initialize WebSocket server
    getWebSocketServer()
    
    return NextResponse.json({ 
      success: true, 
      message: 'WebSocket server initialized',
      port: process.env.WS_PORT || 3001
    })
  } catch (error) {
    console.error('WebSocket initialization error:', error)
    return NextResponse.json({ error: 'Failed to initialize WebSocket server' }, { status: 500 })
  }
}