'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import Repository from './Repository';

class AccessTokenRepository extends Repository {
    /**
     * @type {?string}
     */
    #accessToken = null;

    /**
     * Stores a given access token.
     *
     * @param {string} accessToken
     * @param {boolean} [isSession=false]
     *
     * @throws {IllegalArgumentException} If an invalid access token is given.
     */
    storeAccessToken(accessToken, isSession = false){
        if ( accessToken === '' || typeof accessToken !== 'string' ){
            throw new IllegalArgumentException('Invalid access token.');
        }
        const storage = isSession === true ? window.sessionStorage : window.localStorage;
        storage.setItem('accessToken', accessToken);
        this.#accessToken = accessToken;
    }

    /**
     * Returns the access token that had been stored.
     *
     * @returns {?string}
     */
    getAccessToken(){
        if ( this.#accessToken === null ){
            this.#accessToken = window.localStorage.getItem('accessToken');
            if ( typeof this.#accessToken !== 'string' ){
                this.#accessToken = window.sessionStorage.getItem('accessToken');
            }
        }
        return this.#accessToken;
    }

    /**
     * Drops the access token that had been stored.
     */
    dropAccessToken(){
        window.sessionStorage.removeItem('accessToken');
        window.localStorage.removeItem('accessToken');
        this.#accessToken = null;
    }
}

export default AccessTokenRepository;
