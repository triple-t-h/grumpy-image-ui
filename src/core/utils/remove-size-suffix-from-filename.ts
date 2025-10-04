const removeSizeSuffixFromFilename = (filename: string): string => {
    // example empire_buecherschrank_frankreich-1500x2000.png
    const sizeSuffixPattern = /-(\d+)x(\d+)\.(jpg|jpeg|png|webp|gif|avif|tiff)$/i
    return filename.replace(sizeSuffixPattern, '.$3')
}

export { removeSizeSuffixFromFilename }