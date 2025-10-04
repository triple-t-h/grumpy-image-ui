const addSizeSuffixToFilename = (filename: string, size: string | [number, number]) => {
    if (Array.isArray(size)) {
        size = size.join('x')
    }
    return filename.replace(/(\..*)$/, `-${size}$1`)
}

export { addSizeSuffixToFilename }