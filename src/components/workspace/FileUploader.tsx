import React, { useState, useCallback, useRef } from 'react'
import { Upload, X, FolderOpen, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import JSZip from 'jszip'

interface UploadedFile {
  name: string
  content: string
  language: string
  size: number
  path: string
}

interface FileUploaderProps {
  onFilesUploaded: (files: UploadedFile[]) => void
  maxFileSize?: number // in MB
  maxFiles?: number
  acceptedExtensions?: string[]
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesUploaded,
  maxFileSize = 10,
  maxFiles = 50,
  acceptedExtensions = ['.html', '.css', '.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.txt', '.xml', '.svg', '.png', '.jpg', '.jpeg', '.gif']
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'html': return 'html'
      case 'css': return 'css'
      case 'js': return 'javascript'
      case 'jsx': return 'javascript'
      case 'ts': return 'typescript'
      case 'tsx': return 'typescript'
      case 'json': return 'json'
      case 'md': return 'markdown'
      case 'xml': return 'xml'
      case 'svg': return 'xml'
      default: return 'plaintext'
    }
  }

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      setErrorMessage(`File "${file.name}" exceeds ${maxFileSize}MB limit`)
      return false
    }

    // Check file extension
    const hasValidExtension = acceptedExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext.toLowerCase())
    )
    
    if (!hasValidExtension) {
      setErrorMessage(`File "${file.name}" has unsupported extension`)
      return false
    }

    return true
  }

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
      reader.readAsText(file)
    })
  }

  const processFiles = async (fileList: FileList) => {
    setIsUploading(true)
    setUploadStatus('idle')
    setErrorMessage('')
    setUploadProgress(0)

    try {
      const files = Array.from(fileList)
      const validFiles = files.filter(validateFile)

      if (validFiles.length === 0) {
        setUploadStatus('error')
        setIsUploading(false)
        return
      }

      if (validFiles.length > maxFiles) {
        setErrorMessage(`Too many files. Maximum ${maxFiles} files allowed`)
        setUploadStatus('error')
        setIsUploading(false)
        return
      }

      const uploadedFiles: UploadedFile[] = []
      
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]
        setUploadProgress((i / validFiles.length) * 100)
        
        try {
          const content = await readFileAsText(file)
          uploadedFiles.push({
            name: file.name,
            content,
            language: getLanguageFromExtension(file.name),
            size: file.size,
            path: file.webkitRelativePath || file.name
          })
        } catch (error) {
          console.error(`Error reading file ${file.name}:`, error)
        }
      }

      if (uploadedFiles.length > 0) {
        onFilesUploaded(uploadedFiles)
        setUploadStatus('success')
        setUploadProgress(100)
      } else {
        setUploadStatus('error')
        setErrorMessage('No valid files could be processed')
      }

    } catch (error) {
      setUploadStatus('error')
      setErrorMessage('Failed to process files')
      console.error('File processing error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const items = e.dataTransfer.items
    const files: File[] = []

    // Handle both files and directories
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry()
        
        if (entry) {
          if (entry.isFile) {
            const file = item.getAsFile()
            if (file) files.push(file)
          } else if (entry.isDirectory) {
            // Handle directory upload
            const dirFiles = await readDirectory(entry)
            files.push(...dirFiles)
          }
        }
      }
    }

    if (files.length > 0) {
      await processFiles(files as unknown as FileList)
    }
  }, [])

  const readDirectory = async (directoryEntry: any): Promise<File[]> => {
    const files: File[] = []
    const reader = new FileReader()

    const readEntries = async (dirReader: any) => {
      return new Promise<any[]>((resolve) => {
        dirReader.readEntries((entries: any[]) => resolve(entries))
      })
    }

    const processEntry = async (entry: any, path: string = ''): Promise<void> => {
      if (entry.isFile) {
        return new Promise<void>((resolve) => {
          entry.file((file: File) => {
            // Preserve the relative path
            Object.defineProperty(file, 'webkitRelativePath', {
              value: path + file.name,
              writable: false
            })
            files.push(file)
            resolve()
          })
        })
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader()
        const entries = await readEntries(dirReader)
        
        for (const childEntry of entries) {
          await processEntry(childEntry, path + entry.name + '/')
        }
      }
    }

    await processEntry(directoryEntry)
    return files
  }

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files)
    }
  }, [])

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const resetUploader = () => {
    setUploadStatus('idle')
    setUploadProgress(0)
    setErrorMessage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${isUploading ? 'pointer-events-none opacity-75' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          {...({ webkitdirectory: "" } as any)}
          className="hidden"
          onChange={handleFileSelect}
        />

        {isUploading ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <div className="w-full max-w-xs">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Processing files... {Math.round(uploadProgress)}%
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            {uploadStatus === 'success' ? (
              <CheckCircle className="w-12 h-12 text-green-500" />
            ) : uploadStatus === 'error' ? (
              <AlertCircle className="w-12 h-12 text-red-500" />
            ) : (
              <Upload className="w-12 h-12 text-gray-400" />
            )}

            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {uploadStatus === 'success' 
                  ? 'Files uploaded successfully!'
                  : uploadStatus === 'error'
                  ? 'Upload failed'
                  : 'Drop files or folders here'
                }
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {uploadStatus === 'success' 
                  ? 'Your files have been added to the workspace'
                  : uploadStatus === 'error'
                  ? errorMessage
                  : `Supports ${acceptedExtensions.join(', ')} • Max ${maxFileSize}MB per file`
                }
              </p>
            </div>

            {uploadStatus !== 'idle' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  resetUploader()
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload More Files
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <FileText className="w-4 h-4 mr-1" />
            <span>Individual files</span>
          </div>
          <div className="flex items-center">
            <FolderOpen className="w-4 h-4 mr-1" />
            <span>Entire folders</span>
          </div>
        </div>
        <div>
          Max {maxFiles} files • {maxFileSize}MB each
        </div>
      </div>
    </div>
  )
}

export default FileUploader
