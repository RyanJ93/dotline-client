'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';

class FileUtils {
    /**
     * Reads an uploaded file and returns its contents as an ArrayBuffer.
     *
     * @param {File|Blob} file
     *
     * @returns {Promise<ArrayBuffer>}
     *
     * @throws {IllegalArgumentException} If an invalid uploaded file is given.
     */
    static readUploadedFile(file){
        return new Promise((resolve, reject) => {
            if ( !( file instanceof File ) && !( file instanceof Blob ) ){
                return reject(new IllegalArgumentException('Invalid file.'));
            }
            const fileReader = new FileReader();
            fileReader.onload = (event) => resolve(event.target.result);
            fileReader.onerror = (error) => reject(error);
            fileReader.readAsArrayBuffer(file);
        });
    }

    /**
     * Returns the CSS class associated to the icon that represents the given file type.
     *
     * @param {string} type
     *
     * @returns {string}
     *
     * @throws {IllegalArgumentException} If an invalid file type is given.
     */
    static getFileIconClass(type){
        if ( type === '' || typeof type !== 'string' ){
            throw IllegalArgumentException('Invalid file type.');
        }
        switch ( type ){
            case 'application/pdf': {
                return 'fa-solid fa-file-pdf';
            }
            case 'audio/mpeg': {
                return 'fa-solid fa-file-audio';
            }
            default: {
                return 'fa-solid fa-file';
            }
        }
    }
}

export default FileUtils;
