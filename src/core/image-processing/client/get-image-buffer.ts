const getImageBuffer = async (sourceImgBlob: Blob): Promise<ArrayBuffer> =>
    await sourceImgBlob.arrayBuffer()

export { getImageBuffer }

