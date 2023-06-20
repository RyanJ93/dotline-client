'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';

class BinaryUtils {
    /**
     * Converts a given binary array buffer into an hex encoded string.
     *
     * @param {ArrayBuffer} arrayBuffer
     *
     * @returns {string}
     */
    static arrayBufferToHEX(arrayBuffer){
        return [...new Uint8Array(arrayBuffer)].map((element) => {
            return element.toString(16).padStart(2, '0');
        }).join('');
    }

    /**
     * Creates an object URL based on the given binary data encoded as a base64 data URI.
     *
     * @param {string} dataURI
     *
     * @returns {string}
     *
     * @throws {IllegalArgumentException} If an invalid data URI string is given.
     */
    static createObjectURLFromDataURI(dataURI){
        if ( dataURI === '' || typeof dataURI !== 'string' ){
            throw new IllegalArgumentException('Invalid data URI string.');
        }
        const index = dataURI.indexOf(';'), beginning = dataURI.indexOf(',');
        const base64String = dataURI.substring(beginning + 1);
        const contentType = dataURI.substring(0, index);
        return BinaryUtils.createObjectURL(base64String, contentType);
    }

    /**
     * Creates an object URL based on the given binary data encoded as a base64 string.
     *
     * @param {string} base64String
     * @param {string} contentType
     *
     * @returns {string}
     *
     * @throws {IllegalArgumentException} If an invalid base64 string is given.
     * @throws {IllegalArgumentException} If an invalid content type is given.
     */
    static createObjectURL(base64String, contentType){
        if ( base64String === '' || typeof base64String !== 'string' ){
            throw new IllegalArgumentException('Invalid base64 string.');
        }
        if ( contentType === '' || typeof contentType !== 'string' ){
            throw new IllegalArgumentException('Invalid content type.');
        }
        const byteCharacters = window.atob(base64String);
        const byteNumbers = new Array(byteCharacters.length);
        for ( let i = 0 ; i < byteCharacters.length ; i++ ){
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        return URL.createObjectURL(new Blob([new Uint8Array(byteNumbers)], {
            type: contentType
        }));
    }
}

export default BinaryUtils;
