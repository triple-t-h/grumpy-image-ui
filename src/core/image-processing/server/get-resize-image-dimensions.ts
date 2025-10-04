import { getImageDimensions } from "./get-dimensions";


const getResizeImageDimensions = async (buffer: Buffer, maxSizes: number[][]): Promise<number[][]> => {
    const metadata = await getImageDimensions(buffer)
        , width = metadata.width as number || 0
        , height = metadata.height as number || 0;

    for (const size of maxSizes) {
        const [maxWidth, maxHeight] = size
            , ratio = Math.min(maxWidth / width, maxHeight / height)
            , newWidth = width * ratio
            , newHeight = height * ratio;
        size.splice(0, size.length, ...[newWidth, newHeight].map(size => Math.round(size)));
    }

    return maxSizes;
}

export { getResizeImageDimensions };