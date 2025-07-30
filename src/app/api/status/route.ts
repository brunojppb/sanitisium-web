import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
    }

    const store = getFileStore()
    const fileInfo = store.get(id)
    
    if (!fileInfo) {
      return NextResponse.json({ 
        id,
        status: 'processing',
        message: 'File is being processed'
      })
    }

    return NextResponse.json({
      id,
      ...fileInfo
    })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const fileStore = new Map()

function getFileStore() {
  return fileStore
}