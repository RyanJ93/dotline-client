'use strict';

import UserProfilePictureStatus from '../enum/UserProfilePictureStatus';
import IllegalArgumentException from '../exceptions/IllegalArgumentException';

/**
 * @typedef UserProfilePictureProperties
 *
 * @property {string} status
 * @property {?string} url
 */

class UserProfilePicture {
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
     * @param {UserProfilePictureProperties} properties
     */
    constructor(properties){
        this.#url = properties.url ?? null;
        this.#status = properties.status;
    }

    /**
     * Sets user profile picture status.
     *
     * @param {string} status
     *
     * @returns {UserProfilePicture}
     *
     * @throws {IllegalArgumentException} If an invalid status is given.
     */
    setStatus(status){
        if ( Object.values(UserProfilePictureStatus).indexOf(status) === -1 ){
            throw new IllegalArgumentException('Invalid status.');
        }
        this.#status = status;
        return this;
    }

    /**
     * Returns user profile picture status.
     *
     * @returns {string}
     */
    getStatus(){
        return this.#status;
    }

    /**
     * Sets the URL for the fetched user profile picture.
     *
     * @param {?string} url
     *
     * @returns {UserProfilePicture}
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
     * Returns the URL for the fetched user profile picture.
     *
     * @returns {?string}
     */
    getURL(){
        return this.#url;
    }
}

export default UserProfilePicture;
