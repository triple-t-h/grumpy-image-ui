import sharp from 'sharp';

const getImageDimensions = async (buffer: Buffer | Uint8ClampedArray): Promise<{ width: number, height: number }> => {
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width as number || 0;
    const height = metadata.height as number || 0;

    return { width, height };
}

export { getImageDimensions };

