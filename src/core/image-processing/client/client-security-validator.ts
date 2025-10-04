/**
 * Client-side security validator for renderer process
 * This is a subset of the main SecurityValidator that works in the browser environment
 */
export class ClientSecurityValidator {
  // Maximum file size: 100MB (same as server-side)
  static readonly MAX_FILE_SIZE = 100 * 1024 * 1024
  
  // Maximum image dimensions to prevent DoS
  static readonly MAX_DIMENSION = 10000
  
  // Allowed image MIME types
  static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png', 
    'image/webp',
    'image/avif',
    'image/tiff',
    'image/gif'
  ]
  
  // Allowed file extensions
  static readonly ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff', '.tif', '.gif']

  /**
   * Validates a File object from drag & drop or file input
   */
  static validateFile(file: File): void {
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file: must be a File object')
    }

    // Check file name
    if (!file.name || typeof file.name !== 'string') {
      throw new Error('Invalid file: file name is required')
    }

    // Check file size
    if (file.size === 0) {
      throw new Error('Invalid file: file is empty')
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File too large: ${Math.round(file.size / 1024 / 1024)}MB exceeds ${Math.round(this.MAX_FILE_SIZE / 1024 / 1024)}MB limit`)
    }

    // Validate file extension
    const ext = this.getFileExtension(file.name)
    if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
      throw new Error(`Unsupported file extension: ${ext}. Allowed: ${this.ALLOWED_EXTENSIONS.join(', ')}`)
    }

    // Validate MIME type
    if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}. Allowed: ${this.ALLOWED_MIME_TYPES.join(', ')}`)
    }

    // Additional MIME type validation (some browsers don't set type correctly)
    if (!file.type && ext) {
      console.warn(`[SECURITY] File has no MIME type, validating by extension: ${ext}`)
    }
  }

  /**
   * Validates multiple files from drag & drop
   */
  static validateFiles(files: FileList | File[]): File[] {
    if (!files || files.length === 0) {
      throw new Error('No files provided')
    }

    if (files.length > 10) {
      throw new Error('Too many files: maximum 10 files allowed at once')
    }

    const validFiles: File[] = []
    const fileArray = Array.from(files)

    for (let i = 0; i < fileArray.length; i++) {
      try {
        this.validateFile(fileArray[i])
        validFiles.push(fileArray[i])
      } catch (error) {
        throw new Error(`File ${i + 1} (${fileArray[i]?.name || 'unknown'}): ${(error as Error).message}`)
      }
    }

    return validFiles
  }

  /**
   * Validates file header by reading the first few bytes
   */
  static async validateFileHeader(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        try {
          const buffer = new Uint8Array(reader.result as ArrayBuffer)
          
          // JPEG: FF D8 FF
          if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
            resolve()
            return
          }
          
          // PNG: 89 50 4E 47 0D 0A 1A 0A
          if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
              buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A) {
            resolve()
            return
          }
          
          // WebP: RIFF...WEBP
          if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
              buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
            resolve()
            return
          }
          
          // GIF: GIF8
          if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
            resolve()
            return
          }
          
          // TIFF: II* or MM*
          if ((buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2A && buffer[3] === 0x00) ||
              (buffer[0] === 0x4D && buffer[1] === 0x4D && buffer[2] === 0x00 && buffer[3] === 0x2A)) {
            resolve()
            return
          }
          
          reject(new Error('Invalid image file: file header does not match any supported image format'))
          
        } catch (error) {
          reject(new Error(`Failed to validate file header: ${(error as Error).message}`))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file for header validation'))
      }
      
      // Read first 12 bytes for header validation
      const blob = file.slice(0, 12)
      reader.readAsArrayBuffer(blob)
    })
  }

  /**
   * Sanitizes filename to prevent issues
   */
  static sanitizeFilename(filename: string): string {
    if (!filename || typeof filename !== 'string') {
      return 'untitled'
    }
    
    // Remove path separators and dangerous characters
    let sanitized = filename
      .replace(/[/\\:*?"<>|]/g, '_')  // Replace forbidden characters
      .replace(/\.\./g, '_')          // Remove parent directory references
      .replace(/^\.+/, '')            // Remove leading dots
      .trim()
    
    // Ensure filename is not empty after sanitization
    if (!sanitized) {
      sanitized = 'untitled'
    }
    
    // Truncate if too long
    if (sanitized.length > 255) {
      const dotIndex = sanitized.lastIndexOf('.')
      if (dotIndex > 0) {
        const ext = sanitized.substring(dotIndex)
        const name = sanitized.substring(0, dotIndex).substring(0, 255 - ext.length)
        sanitized = name + ext
      } else {
        sanitized = sanitized.substring(0, 255)
      }
    }
    
    return sanitized
  }

  /**
   * Gets file extension from filename
   */
  private static getFileExtension(filename: string): string {
    if (!filename || typeof filename !== 'string') {
      return ''
    }
    
    const lastDotIndex = filename.lastIndexOf('.')
    if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
      return ''
    }
    
    return filename.substring(lastDotIndex).toLowerCase()
  }

  /**
   * Validates drag & drop data transfer
   */
  static validateDragData(dataTransfer: DataTransfer | null): void {
    if (!dataTransfer) {
      throw new Error('Invalid drag data: DataTransfer is null')
    }

    if (!dataTransfer.files || dataTransfer.files.length === 0) {
      throw new Error('No files found in drag data')
    }

    // Check for suspicious data transfer types
    const types = Array.from(dataTransfer.types)
    const suspiciousTypes = ['text/uri-list', 'text/html', 'text/plain']
    
    // Allow files but warn about mixed content
    if (types.some(type => suspiciousTypes.includes(type)) && dataTransfer.files.length > 0) {
      console.warn('[SECURITY] Drag data contains mixed content types:', types)
    }
  }

  /**
   * Complete validation for drag & drop files
   */
  static async validateDragFiles(dataTransfer: DataTransfer | null): Promise<File[]> {
    // Validate drag data
    this.validateDragData(dataTransfer)
    
    // Validate files
    const validFiles = this.validateFiles(dataTransfer!.files)
    
    // Validate file headers
    for (const file of validFiles) {
      await this.validateFileHeader(file)
    }
    
    return validFiles
  }
}