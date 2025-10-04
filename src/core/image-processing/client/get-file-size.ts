const getFileSize = (blob: Blob, size: string = 'kb'): string => {
    // Convert blob size to the specified unit (default is kilobytes)
    switch (size.toLowerCase()) {
        case 'kb':
            return (blob.size / 1024).toFixed(2) + ' KB';
        case 'mb':
            return (blob.size / (1024 * 1024)).toFixed(2) + ' MB';
        case 'gb':
            return (blob.size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
        default:
            return blob.size + ' bytes';
    }
}

export { getFileSize }