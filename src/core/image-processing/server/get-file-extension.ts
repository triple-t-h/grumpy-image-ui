import mime from 'mime-types';
import { getContentType } from './get-content-type';

const getFileExtension = (img: Blob): string => {
    const contentType = getContentType(img)
        , fileExtension = mime.extension(contentType);
    return fileExtension as string;
}

export { getFileExtension };
