import fs from 'node:fs'
import path from 'node:path'

/**
 * Security validator for file operations and input sanitization
 */
export class SecurityValidator {
  // Maximum file size: 100MB
  static readonly MAX_FILE_SIZE = 100 * 1024 * 1024
  
  // Maximum image dimensions to prevent DoS
  static readonly MAX_DIMENSION = 10000
  
  // Maximum concurrent operations
  static readonly MAX_CONCURRENT_JOBS = 3
  
  // Allowed image MIME types
static readonly ALLOWED_MIME_TYPES = [
    'image/avif',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/tiff',
    'image/webp'
]
  
  // Allowed file extensions
static readonly ALLOWED_EXTENSIONS = ['.avif', '.gif', '.jpeg', '.jpg', '.png', '.tif', '.tiff', '.webp']
  
  private static currentJobs = 0

  /**
   * Validates file path to prevent path traversal attacks
   */
  static validateFilePath(filePath: string): void {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid file path: must be a non-empty string')
    }

    // Normalize the path
    const normalized = path.normalize(filePath)
    
    // Check for path traversal attempts
    if (normalized.includes('..') || normalized.includes('~')) {
      throw new Error('Path traversal detected: file path contains forbidden characters')
    }
    
    // Ensure path doesn't contain null bytes
    if (filePath.includes('\0')) {
      throw new Error('Invalid file path: contains null bytes')
    }
    
    // Additional check for Windows-specific attacks
    if (process.platform === 'win32') {
      if (normalized.match(/[<>:"|?*]/)) {
        throw new Error('Invalid file path: contains forbidden Windows characters')
      }
    }
  }

  /**
   * Validates file size and type
   */
  static async validateFile(filePath: string): Promise<void> {
    // First validate the path
    this.validateFilePath(filePath)
    
    // Check if file exists
    if (!await fs.promises.access(filePath).then(() => true).catch(() => false)) {
      throw new Error('File does not exist or is not accessible')
    }
    
    // Get file stats
    const stats = await fs.promises.stat(filePath)
    
    // Check file size
    if (stats.size === 0) {
      throw new Error('File is empty')
    }
    
    if (stats.size > this.MAX_FILE_SIZE) {
      throw new Error(`File too large: ${Math.round(stats.size / 1024 / 1024)}MB exceeds ${Math.round(this.MAX_FILE_SIZE / 1024 / 1024)}MB limit`)
    }
    
    // Validate file extension
    const ext = path.extname(filePath).toLowerCase()
    if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
      throw new Error(`Unsupported file extension: ${ext}. Allowed: ${this.ALLOWED_EXTENSIONS.join(', ')}`)
    }
    
    // Validate file header (magic numbers)
    await this.validateFileHeader(filePath)
  }

  /**
   * Validates file header to ensure it's actually an image
   */
  private static async validateFileHeader(filePath: string): Promise<void> {
    const buffer = Buffer.alloc(12)
    const fd = await fs.promises.open(filePath, 'r')
    
    try {
      await fd.read(buffer, 0, 12, 0)
      
      // JPEG: FF D8 FF
      if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return
      
      // PNG: 89 50 4E 47 0D 0A 1A 0A
      if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) return
      
      // WebP: RIFF...WEBP
      if (buffer.subarray(0, 4).equals(Buffer.from('RIFF', 'ascii')) && 
          buffer.subarray(8, 12).equals(Buffer.from('WEBP', 'ascii'))) return
      
      // GIF: GIF8
      if (buffer.subarray(0, 4).equals(Buffer.from('GIF8', 'ascii'))) return
      
      // TIFF: II* or MM*
      if ((buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2A && buffer[3] === 0x00) ||
          (buffer[0] === 0x4D && buffer[1] === 0x4D && buffer[2] === 0x00 && buffer[3] === 0x2A)) return
      
      throw new Error('Invalid image file: file header does not match any supported image format')
      
    } finally {
      await fd.close()
    }
  }

  /**
   * Validates buffer data for image processing
   */
  static async validateImageBuffer(buffer: ArrayBuffer | Buffer | Blob): Promise<Buffer> {
    if (!buffer) {
      throw new Error('Image buffer is null or undefined')
    }
    
    let validBuffer: Buffer
    
    if (Buffer.isBuffer(buffer)) {
      validBuffer = buffer
    } else if (buffer instanceof ArrayBuffer) {
      validBuffer = Buffer.from(buffer)
    } else if (buffer instanceof Blob) {
      // Convert Blob to ArrayBuffer then to Buffer
      const arrayBuffer = await buffer.arrayBuffer()
      validBuffer = Buffer.from(arrayBuffer)
    } else {
      throw new Error('Invalid buffer type: must be Buffer, ArrayBuffer, or Blob')
    }
    
    if (validBuffer.length === 0) {
      throw new Error('Image buffer is empty')
    }
    
    if (validBuffer.length > this.MAX_FILE_SIZE) {
      throw new Error(`Buffer too large: ${Math.round(validBuffer.length / 1024 / 1024)}MB exceeds limit`)
    }
    
    return validBuffer
  }

  /**
   * Validates image dimensions to prevent DoS attacks
   */
  static validateImageDimensions(dimensions: any[]): void {
    if (!Array.isArray(dimensions)) {
      throw new Error('Dimensions must be an array')
    }
    
    if (dimensions.length === 0) {
      throw new Error('At least one dimension is required')
    }
    
    if (dimensions.length > 20) {
      throw new Error('Too many dimensions: maximum 20 allowed')
    }
    
    for (const dim of dimensions) {
      if (!dim || typeof dim !== 'object') {
        throw new Error('Invalid dimension: must be an object')
      }
      
      const { width, height, filename, imageFormat } = dim
      
      // Validate width and height
      if (!width || !height || typeof width !== 'number' || typeof height !== 'number') {
        throw new Error('Invalid dimension: width and height must be positive numbers')
      }
      
      if (width <= 0 || height <= 0 || width > this.MAX_DIMENSION || height > this.MAX_DIMENSION) {
        throw new Error(`Invalid dimension: width/height must be between 1 and ${this.MAX_DIMENSION}`)
      }
      
      // Validate filename
      if (!filename || typeof filename !== 'string') {
        throw new Error('Invalid dimension: filename must be a non-empty string')
      }
      
      // Sanitize filename
      const sanitizedFilename = this.sanitizeFilename(filename)
      if (sanitizedFilename !== filename) {
        throw new Error(`Invalid filename: contains forbidden characters. Use: ${sanitizedFilename}`)
      }
      
      // Validate image format
      if (!imageFormat || typeof imageFormat !== 'string') {
        throw new Error('Invalid dimension: imageFormat must be specified')
      }
    }
  }

  /**
   * Sanitizes filename to prevent directory traversal and invalid characters
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
      const ext = path.extname(sanitized)
      const name = path.basename(sanitized, ext).substring(0, 255 - ext.length)
      sanitized = name + ext
    }
    
    return sanitized
  }

  /**
   * Rate limiting for concurrent operations
   */
  static async acquireJobSlot(): Promise<void> {
    if (this.currentJobs >= this.MAX_CONCURRENT_JOBS) {
      throw new Error(`Too many concurrent operations: maximum ${this.MAX_CONCURRENT_JOBS} jobs allowed`)
    }
    this.currentJobs++
  }

  /**
   * Release job slot
   */
  static releaseJobSlot(): void {
    this.currentJobs = Math.max(0, this.currentJobs - 1)
  }

  /**
   * Get current job count
   */
  static getCurrentJobCount(): number {
    return this.currentJobs
  }
}