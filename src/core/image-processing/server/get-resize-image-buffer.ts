import { ImageFormat } from '@core/types';
import sharp from 'sharp';

const getResizeImageBuffer = async (img: Blob | ArrayBuffer | Buffer, imageFormat: ImageFormat, quality: number, size: string | [number, number]): Promise<Buffer> => {
    let buffer: Buffer

    if (Buffer.isBuffer(img)) {
        buffer = img
    } else if (img instanceof ArrayBuffer) {
        buffer = Buffer.from(img)
    } else {
        // Blob case
        const arrayBuffer = await img.arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
    }

    const [width, height] = typeof size === 'string' ? size.split('x').map(v => +v) : size as [number, number]

    return await sharp(buffer)
        .resize(width, height,
            {
                fit: 'fill',
                kernel: 'mitchell',
            })
        .toFormat(imageFormat, { quality })
        .toBuffer()
}

export { getResizeImageBuffer };

