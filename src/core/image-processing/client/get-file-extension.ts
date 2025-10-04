import { getContentType } from ".";

interface MimeTypes {
    [key: string]: string
}

const imageMimeTypes: MimeTypes = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/bmp": "bmp",
    "image/webp": "webp",
    "image/tiff": "tiff",
    "image/svg+xml": "svg"
}

const getFileExtension = (sourceImg: Blob | File | HTMLImageElement): string => {
    const contentType = getContentType(sourceImg)
    return contentType in imageMimeTypes
        ? imageMimeTypes[contentType]
        : ''
}

export { getFileExtension };

