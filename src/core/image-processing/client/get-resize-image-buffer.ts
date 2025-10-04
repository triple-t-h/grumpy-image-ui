const resizeAndCoverImage = async (sourceImgBlob: Blob, size: string | [number, number]): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image()
            , url = URL.createObjectURL(sourceImgBlob)
            , [width, height] = typeof size === 'string' ? size.split('x').map(v => +v) : size as [number, number]

        img.onload = () => {
            URL.revokeObjectURL(url)
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')

            // Calculate the aspect ratio
            const aspectRatio = img.width / img.height
            const targetAspectRatio = width / height

            let drawWidth: number, drawHeight: number, offsetX: number, offsetY: number

            if (aspectRatio > targetAspectRatio) {
                // Image is wider than the target aspect ratio
                drawWidth = img.height * targetAspectRatio
                drawHeight = img.height
                offsetX = (img.width - drawWidth) / 2
                offsetY = 0
            } else {
                // Image is taller than the target aspect ratio
                drawWidth = img.width
                drawHeight = img.width / targetAspectRatio
                offsetX = 0
                offsetY = (img.height - drawHeight) / 2
            }

            ctx?.drawImage(img, offsetX, offsetY, drawWidth, drawHeight, 0, 0, width, height)

            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob)
                } else {
                    reject(new Error('Canvas toBlob failed'))
                }
            },
                'image/jpeg',
                0.95
            )
        }

        img.onerror = (error) => {
            URL.revokeObjectURL(url)
            reject(error)
        };

        img.src = url
    })
}

export { resizeAndCoverImage }

