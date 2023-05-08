'use strict';

import GeoLocation from './GeoLocation';

/**
 * @typedef UserSessionProperties
 *
 * @property {string} accessToken
 * @property {string} browserName
 * @property {Date} firstAccess
 * @property {Date} lastAccess
 * @property {GeoLocation} location
 * @property {string} OSName
 * @property {string} ip
 */

class UserSession {
    /**
     * Generates a list of instances of this class based on the body of a given HTTP response.
     *
     * @param {Response} response
     *
     * @returns {UserSession[]}
     */
    static makeListFromHTTPResponse(response){
        return response.accessTokenList.map((accessToken) => {
            accessToken.location = accessToken.location === null ? null : new GeoLocation(accessToken.location);
            accessToken.firstAccess = new Date(accessToken.firstAccess);
            accessToken.lastAccess = new Date(accessToken.lastAccess);
            return new UserSession(accessToken);
        });
    }

    /**
     * @type {string}
     */
    #accessToken;

    /**
     * @type {string}
     */
    #browserName;

    /**
     * @type {Date}
     */
    #firstAccess;

    /**
     * @type {Date}
     */
    #lastAccess;

    /**
     * @type {GeoLocation}
     */
    #location;

    /**
     * @type {string}
     */
    #OSName;

    /**
     * @type {string}
     */
    #ip;

    /**
     * The class constructor.
     *
     * @param properties
     */
    constructor(properties){
        this.#accessToken = properties.accessToken;
        this.#browserName = properties.browserName;
        this.#firstAccess = properties.firstAccess;
        this.#lastAccess = properties.lastAccess;
        this.#location = properties.location;
        this.#OSName = properties.OSName;
        this.#ip = properties.ip;
    }

    /**
     * Returns the access token.
     *
     * @returns {string}
     */
    getAccessToken(){
        return this.#accessToken;
    }

    /**
     * Returns user's browser name.
     *
     * @returns {string}
     */
    getBrowserName(){
        return this.#browserName;
    }

    /**
     * Returns user's first access.
     *
     * @returns {Date}
     */
    getFirstAccess(){
        return this.#firstAccess;
    }

    /**
     * Returns user's last access.
     *
     * @returns {Date}
     */
    getLastAccess(){
        return this.#lastAccess;
    }

    /**
     * Returns user's location.
     *
     * @returns {GeoLocation}
     */
    getLocation(){
        return this.#location;
    }

    /**
     * Returns user's OS name.
     *
     * @returns {string}
     */
    getOSName(){
        return this.#OSName;
    }

    /**
     * Returns user's IP address.
     *
     * @returns {string}
     */
    getIP(){
        return this.#ip;
    }
}

export default UserSession;
