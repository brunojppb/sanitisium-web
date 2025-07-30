'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ProcessedFile {
  id: string
  originalName: string
  filePath: string
  status: 'processing' | 'completed' | 'failed'
}

export default function Home() {
  const [files, setFiles] = useState<ProcessedFile[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    // Initialize WebSocket server
    fetch('/api/websocket').catch(console.error)
    
    // Connect to WebSocket
    const ws = new WebSocket('ws://localhost:3001')
    
    ws.onopen = () => {
      console.log('Connected to WebSocket')
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log('WebSocket update:', data)
      
      setFiles(prev => prev.map(f => 
        f.id === data.id 
          ? { ...f, status: data.status, filePath: data.filePath || '' }
          : f
      ))
    }
    
    ws.onclose = () => {
      console.log('WebSocket connection closed')
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return () => {
      ws.close()
    }
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a PDF file')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      const newFile: ProcessedFile = {
        id: data.id,
        originalName: data.originalName,
        filePath: '',
        status: data.status
      }

      setFiles(prev => [...prev, newFile])

    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const downloadFile = (filePath: string, originalName: string) => {
    const link = document.createElement('a')
    link.href = `/api/download?file=${encodeURIComponent(filePath)}`
    link.download = `sanitized_${originalName}`
    link.click()
  }

  const processingFiles = files.filter(f => f.status === 'processing')
  const completedFiles = files.filter(f => f.status === 'completed')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-gray-800">NextJS App</h1>
        
        {/* Upload Section */}
        <div className="bg-teal-400 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="file-upload"
          />
          <Button 
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={uploading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-md font-medium"
          >
            {uploading ? 'Uploading...' : 'Upload PDF'}
          </Button>
        </div>

        {/* PDFs being processed */}
        {processingFiles.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">PDFs being processed</h2>
            <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-6">
              <div className="flex flex-wrap gap-6">
                {processingFiles.map((file) => (
                  <div key={file.id} className="flex flex-col items-center">
                    <div className="w-16 h-20 bg-blue-500 rounded-md flex items-center justify-center mb-2">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600 text-center max-w-20 truncate">
                      {file.id.substring(0, 8)}...
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PDFs Regenerated */}
        {completedFiles.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">PDFs Regenerated</h2>
            <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-6">
              <div className="flex flex-wrap gap-6">
                {completedFiles.map((file) => (
                  <div key={file.id} className="flex flex-col items-center">
                    <div className="w-16 h-20 bg-green-500 rounded-md flex items-center justify-center mb-2">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600 text-center max-w-20 truncate mb-2">
                      {file.id.substring(0, 8)}...
                    </span>
                    <Button
                      onClick={() => downloadFile(file.filePath, file.originalName)}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-1 text-xs rounded"
                    >
                      download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
