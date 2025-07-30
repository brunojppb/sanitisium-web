import { NextRequest, NextResponse } from 'next/server'
import { broadcastUpdate } from '@/lib/websocket'

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
    }

    const body = await request.text()
    console.error(`Processing failed for file ${id}:`, body)

    const store = getFileStore()
    store.set(id, {
      status: 'failed',
      error: body,
      timestamp: new Date().toISOString()
    })

    // Broadcast update via WebSocket
    broadcastUpdate({
      id,
      status: 'failed',
      error: body,
      message: 'File processing failed'
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Failure callback received',
      id
    })
  } catch (error) {
    console.error('Failure callback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const fileStore = new Map()

function getFileStore() {
  return fileStore
}