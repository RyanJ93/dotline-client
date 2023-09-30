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

    /**
     * Downloads a given file to the client browser.
     *
     * @param {string} url
     * @param {?string} [fileName]
     *
     * @throws {IllegalArgumentException} If an invalid file name is given.
     * @throws {IllegalArgumentException} If an invalid file url is given.
     */
    static downloadFile(url, fileName = null){
        if ( url === '' || typeof url !== 'string' ){
            throw IllegalArgumentException('Invalid file url.');
        }
        if ( typeof fileName !== 'string' ){
            if ( fileName !== '' && fileName !== null ){
                throw IllegalArgumentException('Invalid file name.');
            }
            fileName = url.substring(url.lastIndexOf('/'));
        }
        const element = document.createElement('a');
        element.style.display = 'none';
        element.download = fileName;
        element.href = url;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    /**
     * Checks if given image type is supported by the browser.
     *
     * @param {string} mimetype
     *
     * @returns {boolean}
     *
     * @throws {IllegalArgumentException} If an invalid mimetype is given.
     */
    static isSupportedImage(mimetype){
        if ( mimetype === '' || typeof mimetype !== 'string' ){
            throw IllegalArgumentException('Invalid mimetype.');
        }
        if ( mimetype === 'image/webp' ){
            const probingImage = document.createElement('canvas').toDataURL('image/webp');
            return probingImage.indexOf('data:image/webp') === 0;
        }
        return ['image/jpeg', 'image/gif', 'image/jpg', 'image/png'].indexOf(mimetype) >= 0;
    }

    /**
     * Checks if given video type is supported by the browser.
     *
     * @param {string} mimetype
     *
     * @returns {boolean}
     *
     * @throws {IllegalArgumentException} If an invalid mimetype is given.
     */
    static isSupportedVideo(mimetype){
        if ( mimetype === '' || typeof mimetype !== 'string' ){
            throw IllegalArgumentException('Invalid mimetype.');
        }
        return document.createElement('video').canPlayType(mimetype) !== '';
    }

    /**
     * Checks if given audio type is supported by the browser.
     *
     * @param {string} mimetype
     *
     * @returns {boolean}
     *
     * @throws {IllegalArgumentException} If an invalid mimetype is given.
     */
    static isSupportedAudio(mimetype){
        if ( mimetype === '' || typeof mimetype !== 'string' ){
            throw IllegalArgumentException('Invalid mimetype.');
        }
        return document.createElement('audio').canPlayType(mimetype) !== '';
    }
}

export default FileUtils;
