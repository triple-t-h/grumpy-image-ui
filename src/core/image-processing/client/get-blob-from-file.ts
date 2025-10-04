const getBlobFromFile = (file: File) => new Blob([file], { type: file.type })

export { getBlobFromFile }
