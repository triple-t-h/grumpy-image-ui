import log from "loglevel"

const filenameHasSizeSuffix = (filename: string, size: string | [number, number]):boolean => {
    if (Array.isArray(size)) {
        size = size.join('x')
    }
    const pattern = new RegExp(`(-${size})(\\..*)$`)
    log.debug('Checking filename against pattern', { filename, pattern })
    return pattern.test(filename)
}

export { filenameHasSizeSuffix }