'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import RemoteAssetStatus from '../enum/RemoteAssetStatus';

/**
 * @typedef RemoteAssetProperties
 *
 * @property {string} status
 * @property {?string} url
 */

class RemoteAsset {
    /**
     * @type {string}
     */
    #status;

    /**
     * @type {?string}
     */
    #url;

    /**
     * The class constructor.
     *
     * @param {RemoteAssetProperties} properties
     */
    constructor(properties){
        this.#url = properties.url ?? null;
        this.#status = properties.status;
    }

    /**
     * Sets remote asset status.
     *
     * @param {string} status
     *
     * @returns {RemoteAsset}
     *
     * @throws {IllegalArgumentException} If an invalid status is given.
     */
    setStatus(status){
        if ( Object.values(RemoteAssetStatus).indexOf(status) === -1 ){
            throw new IllegalArgumentException('Invalid status.');
        }
        this.#status = status;
        return this;
    }

    /**
     * Returns remote asset status.
     *
     * @returns {string}
     */
    getStatus(){
        return this.#status;
    }

    /**
     * Sets the URL for the fetched remote asset.
     *
     * @param {?string} url
     *
     * @returns {RemoteAsset}
     *
     * @throws {IllegalArgumentException} If an invalid URL is given.
     */
    setURL(url){
        if ( url !== null && ( url === '' || typeof url !== 'string' ) ){
            throw new IllegalArgumentException('Invalid URL.');
        }
        this.#url = url;
        return this;
    }

    /**
     * Returns the URL for the fetched remote asset.
     *
     * @returns {?string}
     */
    getURL(){
        return this.#url;
    }
}

export default RemoteAsset;
