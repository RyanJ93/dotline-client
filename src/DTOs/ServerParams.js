'use strict';

/**
 * @typedef ServerParamsProperties
 *
 * @property {number} maxMessageLength
 * @property {number} maxFileCount
 * @property {number} maxFileSize
 */

class ServerParams {
    /**
     * @type {number}
     */
    #maxMessageLength;

    /**
     * @type {number}
     */
    #maxFileCount;

    /**
     * @type {number}
     */
    #maxFileSize;

    /**
     * The class constructor.
     *
     * @param {ServerParamsProperties} properties
     */
    constructor(properties){
        this.#maxMessageLength = properties.maxMessageLength;
        this.#maxFileCount = properties.maxFileCount;
        this.#maxFileSize = properties.maxFileSize;
    }

    /**
     * Returns max allowed message length.
     *
     * @returns {number}
     */
    getMaxMessageLength(){
        return this.#maxMessageLength;
    }

    /**
     * Returns max allowed attachment file count.
     *
     * @returns {number}
     */
    getMaxFileCount(){
        return this.#maxFileCount;
    }

    /**
     * Returns max allowed attachment file size.
     *
     * @returns {number}
     */
    getMaxFileSize(){
        return this.#maxFileSize;
    }
}

export default ServerParams;
