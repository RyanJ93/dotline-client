'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import Serializable from '../support/traits/Serializable';
import StringUtils from '../utils/StringUtils';
import BlobContainer from './BlobContainer';

/**
 * @typedef AttachmentMetadataProperties
 *
 * @property {string} encryptionIV
 * @property {string} signature
 * @property {string} mimetype
 * @property {string} filename
 * @property {number} size
 */

class AttachmentMetadata extends Serializable {
    /**
     * Creates an instance of this class extracting properties from a given file.
     *
     * @param {File} file
     * @param {string} encryptionIV
     * @param {string} signature
     *
     * @returns {AttachmentMetadata}
     *
     * @throws {IllegalArgumentException} If an invalid encryption IV is given.
     * @throws {IllegalArgumentException} If an invalid signature is given.
     * @throws {IllegalArgumentException} If an invalid file is given.
     */
    static makeFromFile(file, encryptionIV, signature){
        if ( encryptionIV === '' || typeof encryptionIV !== 'string' ){
            throw new IllegalArgumentException('Invalid encryption IV.');
        }
        if ( signature === '' || typeof signature !== 'string' ){
            throw new IllegalArgumentException('Invalid signature.');
        }
        if ( !( file instanceof File) ){
            throw new IllegalArgumentException('Invalid file.');
        }
        return new AttachmentMetadata({
            encryptionIV: encryptionIV,
            signature: signature,
            mimetype: file.type,
            filename: file.name,
            size: file.size
        });
    }

    /**
     * Creates an instance of this class extracting properties from a given blob container.
     *
     * @param {BlobContainer} blobContainer
     * @param {string} encryptionIV
     * @param {string} signature
     *
     * @returns {AttachmentMetadata}
     *
     * @throws {IllegalArgumentException} If an invalid blob container is given.
     * @throws {IllegalArgumentException} If an invalid encryption IV is given.
     * @throws {IllegalArgumentException} If an invalid signature is given.
     */
    static makeFromBlobContainer(blobContainer, encryptionIV, signature){
        if ( encryptionIV === '' || typeof encryptionIV !== 'string' ){
            throw new IllegalArgumentException('Invalid encryption IV.');
        }
        if ( signature === '' || typeof signature !== 'string' ){
            throw new IllegalArgumentException('Invalid signature.');
        }
        if ( !( blobContainer instanceof BlobContainer ) ){
            throw new IllegalArgumentException('Invalid blob container.');
        }
        return new AttachmentMetadata({
            mimetype: blobContainer.getBlob().type,
            size: blobContainer.getBlob().size,
            filename: blobContainer.getName(),
            encryptionIV: encryptionIV,
            signature: signature
        });
    }

    static unserialize(data){
        return new AttachmentMetadata(JSON.parse(data));
    }

    /**
     * @type {string}
     *
     * @protected
     */
    _encryptionIV;

    /**
     * @type {string}
     *
     * @protected
     */
    _signature;

    /**
     * @type {string}
     *
     * @protected
     */
    _mimetype;

    /**
     * @type {string}
     *
     * @protected
     */
    _filename;

    /**
     * @type {number}
     *
     * @protected
     */
    _size;

    /**
     * The class constructor.
     *
     * @param {AttachmentMetadataProperties} properties
     */
    constructor(properties){
        super();

        this._encryptionIV = properties.encryptionIV;
        this._signature = properties.signature;
        this._mimetype = properties.mimetype;
        this._filename = properties.filename;
        this._size = properties.size;
    }

    /**
     * Returns the encryption IV.
     *
     * @returns {string}
     */
    getEncryptionIV(){
        return this._encryptionIV;
    }

    /**
     * Returns the signature.
     *
     * @returns {string}
     */
    getSignature(){
        return this._signature;
    }

    /**
     * Returns the mimetype.
     *
     * @returns {string}
     */
    getMimetype(){
        return this._mimetype;
    }

    /**
     * Returns the filename.
     *
     * @returns {string}
     */
    getFilename(){
        return this._filename;
    }

    /**
     * Returns the file size.
     *
     * @returns {number}
     */
    getSize(){
        return this._size;
    }

    /**
     * Returns the file size as an human-readable string.
     *
     * @returns {string}
     */
    getHumanReadableSize(){
        return StringUtils.sizeToHumanReadableString(this._size);
    }

    /**
     * Returns a JSON serializable representation of this class.
     *
     * @returns {AttachmentMetadataProperties}
     */
    toJSON(){
        return {
            encryptionIV: this._encryptionIV,
            signature: this._signature,
            mimetype: this._mimetype,
            filename: this._filename,
            size: this._size
        };
    }

    serialize(){
        return JSON.stringify(this.toJSON());
    }
}

export default AttachmentMetadata;
