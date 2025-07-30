import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { broadcastUpdate } from '@/lib/websocket'

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
    }

    const buffer = await request.arrayBuffer()
    const pdfBuffer = Buffer.from(buffer)

    const uploadsDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const filename = `sanitized_${id}.pdf`
    const filepath = path.join(uploadsDir, filename)
    
    fs.writeFileSync(filepath, pdfBuffer)

    const store = getFileStore()
    store.set(id, {
      status: 'completed',
      filePath: filename,
      timestamp: new Date().toISOString()
    })

    // Broadcast update via WebSocket
    broadcastUpdate({
      id,
      status: 'completed',
      filePath: filename,
      message: 'File processed successfully'
    })

    return NextResponse.json({ 
      success: true, 
      message: 'File processed successfully',
      id,
      filename
    })
  } catch (error) {
    console.error('Success callback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const fileStore = new Map()

function getFileStore() {
  return fileStore
}