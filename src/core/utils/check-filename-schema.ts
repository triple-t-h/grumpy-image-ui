const checkFilenameSchema = (filename: string): boolean => {
    // example empire_buecherschrank_frankreich-300x300.png
    // example empire_buecherschrank_frankreich-1300x5300.png
    // Output images can be in JPEG, PNG, WebP, GIF, AVIF and TIFF formats
    const regex = /^[\w,\s-]+\-\d+x\d+\.(avif|gif|jpeg|jpg|png|svg|tiff|webp)$/
    return regex.test(filename)
}

export { checkFilenameSchema }
