const getImageDimensions = async (source: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const blob = new Blob([source])
            , url = URL.createObjectURL(blob)

        const img = new Image()
        img.onload = () => {
            URL.revokeObjectURL(url) // Revoke the URL to release memory
            resolve({ width: img.width, height: img.height })
        };
        img.onerror = (error) => {
            URL.revokeObjectURL(url)
            reject(error)
        };
        img.src = url
    })
}

export { getImageDimensions }

