'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Upload, Download } from 'lucide-react'

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
  const failedFiles = files.filter(f => f.status === 'failed')

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Sanitisium PDF Regenerator</h1>
          <p className="text-muted-foreground">
            Upload PDFs for sanitization and download the processed files
          </p>
        </div>
        
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload PDF
            </CardTitle>
            <CardDescription>
              Select a PDF file to process through Sanitisium
            </CardDescription>
          </CardHeader>
          <CardContent>
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
              size="lg"
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? 'Uploading...' : 'Choose PDF File'}
            </Button>
          </CardContent>
        </Card>

        {/* PDFs being processed */}
        {processingFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Processing Files
              </CardTitle>
              <CardDescription>
                Files currently being processed by Sanitisium
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {processingFiles.map((file) => (
                  <div key={file.id} className="flex flex-col items-center space-y-2 p-4 border rounded-lg bg-muted/50">
                    <div className="w-12 h-16 bg-primary rounded-md flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Processing
                    </Badge>
                    <span className="text-xs text-muted-foreground text-center truncate max-w-full">
                      {file.originalName}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* PDFs Regenerated */}
        {completedFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Completed Files
              </CardTitle>
              <CardDescription>
                Successfully processed files ready for download
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {completedFiles.map((file) => (
                  <div key={file.id} className="flex flex-col items-center space-y-2 p-4 border rounded-lg bg-muted/50">
                    <div className="w-12 h-16 bg-green-600 rounded-md flex items-center justify-center">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                      Completed
                    </Badge>
                    <span className="text-xs text-muted-foreground text-center truncate max-w-full">
                      {file.originalName}
                    </span>
                    <Button
                      onClick={() => downloadFile(file.filePath, file.originalName)}
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="mr-1 h-3 w-3" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Failed Files */}
        {failedFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <FileText className="h-5 w-5" />
                Failed Files
              </CardTitle>
              <CardDescription>
                Files that failed to process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {failedFiles.map((file) => (
                  <div key={file.id} className="flex flex-col items-center space-y-2 p-4 border rounded-lg bg-muted/50">
                    <div className="w-12 h-16 bg-destructive rounded-md flex items-center justify-center">
                      <FileText className="h-6 w-6 text-destructive-foreground" />
                    </div>
                    <Badge variant="destructive">
                      Failed
                    </Badge>
                    <span className="text-xs text-muted-foreground text-center truncate max-w-full">
                      {file.originalName}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
