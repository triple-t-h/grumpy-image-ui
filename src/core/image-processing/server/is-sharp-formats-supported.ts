const isSharpFormatsSupported = (format: string): boolean =>
    ['avif', 'gif', 'jpeg', 'jpg', 'png', 'svg', 'tiff', 'webp'].includes(format.toLowerCase())

export { isSharpFormatsSupported }
