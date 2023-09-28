'use strict';

/**
 * @typedef BlobContainerProperties
 *
 * @property {Blob} blob
 * @property {string} name
 */

class BlobContainer {
    /**
     * @type {Blob}
     */
    #blob;

    /**
     * @type {string}
     */
    #name;

    /**
     * The class constructor.
     *
     * @param {BlobContainerProperties} properties
     */
    constructor(properties){
        this.#blob = properties.blob;
        this.#name = properties.name;
    }

    /**
     * Returns the file content as a binary blob.
     *
     * @returns {Blob}
     */
    getBlob(){
        return this.#blob;
    }

    /**
     * Returns the represented file's name.
     *
     * @returns {string}
     */
    getName(){
        return this.#name;
    }
}

export default BlobContainer;
