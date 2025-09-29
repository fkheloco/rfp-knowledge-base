'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface UploadedFile {
  file: File
  id: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  result?: any
  error?: string
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ]
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024 // 10MB limit
    })

    const uploadedFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'uploading'
    }))

    setFiles(prev => [...prev, ...uploadedFiles])

    // Process each file
    uploadedFiles.forEach(uploadedFile => {
      processFile(uploadedFile)
    })
  }

  const processFile = async (uploadedFile: UploadedFile) => {
    try {
      // Update status to processing
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id ? { ...f, status: 'processing' } : f
      ))

      // Upload file to Supabase Storage
      const fileExt = uploadedFile.file.name.split('.').pop()
      const fileName = `${uploadedFile.id}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, uploadedFile.file)

      if (uploadError) {
        throw uploadError
      }

      // Call AI processing API
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: uploadData.path,
          fileName: uploadedFile.file.name,
          fileType: uploadedFile.file.type
        })
      })

      if (!response.ok) {
        throw new Error('Failed to process file')
      }

      const result = await response.json()

      // Update status to completed
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id ? { ...f, status: 'completed', result } : f
      ))

      toast.success(`Successfully processed ${uploadedFile.file.name}`)
    } catch (error) {
      console.error('Error processing file:', error)
      setFiles(prev => prev.map(f => 
        f.id === uploadedFile.id ? { 
          ...f, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } : f
      ))
      toast.error(`Failed to process ${uploadedFile.file.name}`)
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...'
      case 'processing':
        return 'Processing with AI...'
      case 'completed':
        return 'Completed'
      case 'error':
        return 'Error'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Upload Documents</h1>
        <p className="text-slate-600">Upload resumes, company profiles, and project documents for AI processing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
          <CardDescription>
            Drag and drop files here or click to browse. Supported formats: PDF, DOC, DOCX, TXT (max 10MB each)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-300 hover:border-slate-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-slate-600 mb-4">
              PDF, DOC, DOCX, TXT files up to 10MB each
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                Choose Files
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Progress</CardTitle>
            <CardDescription>
              Track the processing status of your uploaded files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((uploadedFile) => (
                <div
                  key={uploadedFile.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-900">{uploadedFile.file.name}</p>
                      <p className="text-sm text-slate-600">
                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(uploadedFile.status)}
                      <span className="text-sm text-slate-600">
                        {getStatusText(uploadedFile.status)}
                      </span>
                    </div>
                    {uploadedFile.status === 'error' && (
                      <p className="text-sm text-red-600">{uploadedFile.error}</p>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadedFile.id)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">1</span>
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Upload Documents</h3>
                <p className="text-sm text-slate-600">
                  Upload resumes, company profiles, or project documents in PDF, DOC, or TXT format.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">2</span>
              </div>
              <div>
                <h3 className="font-medium text-slate-900">AI Processing</h3>
                <p className="text-sm text-slate-600">
                  Our AI extracts structured information and creates draft records with "AI-Generated" status.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">3</span>
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Review & Verify</h3>
                <p className="text-sm text-slate-600">
                  Review the generated records, make edits as needed, and update their verification status.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
