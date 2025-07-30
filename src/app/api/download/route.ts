import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filename = searchParams.get('file')
    
    if (!filename) {
      return NextResponse.json({ error: 'Missing file parameter' }, { status: 400 })
    }

    const filepath = path.join(process.cwd(), 'uploads', filename)
    
    if (!fs.existsSync(filepath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const buffer = fs.readFileSync(filepath)
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}