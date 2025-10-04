export interface SnackbarMessage {
    isError: boolean
    message: string
    timestamp: number
}

export interface SnackbarState {
    message: SnackbarMessage | null
    isVisible: boolean
    error: string | null
}