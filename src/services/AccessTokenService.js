'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import APIEndpoints from '../enum/APIEndpoints';
import UserSession from '../DTOs/UserSession';
import Injector from '../facades/Injector';
import Request from '../facades/Request';
import Service from './Service';

class AccessTokenService extends Service {
    /**
     * @type {AccessTokenRepository}
     */
    #accessTokenRepository;

    /**
     * The class constructor.
     */
    constructor(){
        super();

        this.#accessTokenRepository = Injector.inject('AccessTokenRepository');
    }

    /**
     * Stores a given access token.
     *
     * @param {string} accessToken
     * @param {boolean} [isSession=false]
     *
     * @returns {AccessTokenService}
     *
     * @throws {IllegalArgumentException} If an invalid access token is given.
     */
    storeAccessToken(accessToken, isSession = false){
        if ( accessToken === '' || typeof accessToken !== 'string' ){
            throw new IllegalArgumentException('Invalid access token.');
        }
        this.#accessTokenRepository.storeAccessToken(accessToken, isSession);
        return this;
    }

    /**
     * Returns the access token that had been stored.
     *
     * @returns {?string}
     */
    getAccessToken(){
        return this.#accessTokenRepository.getAccessToken();
    }

    /**
     * Drops the access token that had been stored.
     *
     * @returns {AccessTokenService}
     */
    dropAccessToken(){
        this.#accessTokenRepository.dropAccessToken();
        return this;
    }

    /**
     * Fetches all the authenticated user's active sessions.
     *
     * @returns {Promise<UserSession[]>}
     */
    async fetchUserSessions(){
        const response = await Request.get(APIEndpoints.USER_SESSION_LIST);
        return UserSession.makeListFromHTTPResponse(response);
    }

    /**
     * Deletes the given access token.
     *
     * @param {string} accessToken
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid access token is given.
     */
    async deleteAccessToken(accessToken){
        if ( accessToken === '' || typeof accessToken !== 'string' ){
            throw new IllegalArgumentException('Invalid access token.');
        }
        await Request.delete(APIEndpoints.USER_SESSION_DELETE.replace(':accessToken', accessToken));
    }

    /**
     * Deletes all the access tokens, except for the one being used, associated to the authenticated user.
     *
     * @returns {Promise<void>}
     */
    async deleteAllAccessTokens(){
        await Request.delete(APIEndpoints.USER_SESSION_DELETE_ALL);
    }
}

export default AccessTokenService;
