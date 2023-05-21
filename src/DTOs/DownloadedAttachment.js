'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import Attachment from './Attachment';

/**
 * @typedef {AttachmentProperties} DownloadedAttachmentProperties
 *
 * @property {string} objectURL
 */

class DownloadedAttachment extends Attachment {
    /**
     * Makes an instance of this class based on a given attachment instance.
     *
     * @param {Attachment} attachment
     * @param {string} objectURL
     *
     * @returns {DownloadedAttachment}
     *
     * @throws {IllegalArgumentException} If an invalid object URl is given.
     * @throws {IllegalArgumentException} If an invalid attachment is given.
     */
    static makeFromAttachment(attachment, objectURL){
        if ( objectURL === '' || typeof objectURL !== 'string' ){
            throw new IllegalArgumentException('Invalid object URl.');
        }
        if ( !( attachment instanceof Attachment ) ){
            throw new IllegalArgumentException('Invalid attachment.');
        }
        return new DownloadedAttachment(Object.assign({
            objectURL: objectURL
        }, attachment.toJSON()));
    }

    /**
     * @type {string}
     */
    #objectURL;

    /**
     * The class constructor.
     *
     * @param {DownloadedAttachmentProperties} properties
     */
    constructor(properties){
        super(properties);

        this.#objectURL = properties.objectURL;
    }

    /**
     * Returns the object URL.
     *
     * @returns {string}
     */
    getObjectURL(){
        return this.#objectURL;
    }
}

export default DownloadedAttachment;
