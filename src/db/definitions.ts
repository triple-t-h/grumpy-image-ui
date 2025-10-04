interface StoredFile {
    id?: number
    name: string
    type: string
    size: number
    data: File
}

export type { StoredFile }