const getImageBuffer = async (img: Blob | ArrayBuffer): Promise<Buffer> => {
    if (img instanceof ArrayBuffer) {
        return Buffer.from(img)
    } else {
        const arrayBuffer = await img.arrayBuffer()
        return Buffer.from(arrayBuffer)
    }
}

export { getImageBuffer };
