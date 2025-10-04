const getContentType = (img: Blob | File | HTMLImageElement): string => {
    if (img instanceof HTMLImageElement) {
        // For HTMLImageElement, we need to determine content type from src or other means
        // This is a simplified approach - you might need more sophisticated logic
        const src = img.src;
        if (src.includes('data:')) {
            return src.split(';')[0].split(':')[1];
        }
        // Default fallback - you might want to handle this differently
        return 'image/png';
    }
    return img.type;
}

export { getContentType }

