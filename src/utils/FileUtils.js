'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';

class FileUtils {
    /**
     * Reads an uploaded file and returns its contents as an ArrayBuffer.
     *
     * @param {File} file
     *
     * @returns {Promise<ArrayBuffer>}
     *
     * @throws {IllegalArgumentException} If an invalid uploaded file is given.
     */
    static readUploadedFile(file){
        return new Promise((resolve, reject) => {
            if ( !( file instanceof File ) ){
                return reject(new IllegalArgumentException('Invalid file.'));
            }
            const fileReader = new FileReader();
            fileReader.onload = (event) => resolve(event.target.result);
            fileReader.onerror = (error) => reject(error);
            fileReader.readAsArrayBuffer(file);
        });
    }
}

export default FileUtils;
