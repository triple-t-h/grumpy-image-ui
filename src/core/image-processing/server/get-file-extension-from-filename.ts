const getFileExtensionFromFilename = (filename: string): string =>
    filename.split('.').pop()?.toLowerCase() || ''


export { getFileExtensionFromFilename }