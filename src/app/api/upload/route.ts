import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }

    const id = uuidv4()
    const buffer = await file.arrayBuffer()

    // Store file info in our store
    const store = getFileStore()
    store.set(id, {
      status: 'processing',
      originalName: file.name,
      timestamp: new Date().toISOString()
    })

    // Send to localhost:8000 as server-to-server call
    const url = new URL('http://localhost:8000/sanitise/pdf')
    url.searchParams.append('id', id)
    // url.searchParams.append('success_callback_url', 'http://host.docker.internal:3000/api/callback/success')
    // url.searchParams.append('failure_callback_url', 'http://host.docker.internal:3000/api/callback/failure')
    url.searchParams.append('success_callback_url', 'http://localhost:3000/api/callback/success')
    url.searchParams.append('failure_callback_url', 'http://localhost:3000/api/callback/failure')

    const response = await fetch(url.toString(), {
      method: 'POST',
      body: buffer,
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    })

    if (!response.ok) {
      store.set(id, {
        status: 'failed',
        originalName: file.name,
        error: 'Upload to processing service failed',
        timestamp: new Date().toISOString()
      })
      return NextResponse.json({ error: 'Failed to send file for processing' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      id,
      originalName: file.name,
      status: 'processing'
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const fileStore = new Map()

function getFileStore() {
  return fileStore
}
