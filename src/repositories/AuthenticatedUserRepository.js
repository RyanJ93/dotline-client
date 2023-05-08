'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import AuthenticatedUser from '../DTOs/AuthenticatedUser';
import Repository from './Repository';

class AuthenticatedUserRepository extends Repository {
    /**
     * @type {?AuthenticatedUser}
     */
    #authenticatedUser = null;

    /**
     * Stores the authenticated user.
     *
     * @param {?AuthenticatedUser} authenticatedUser
     *
     * @throws {IllegalArgumentException} If an invalid authenticated user is given.
     */
    storeAuthenticatedUser(authenticatedUser){
        if ( authenticatedUser !== null && !( authenticatedUser instanceof AuthenticatedUser ) ){
            throw new IllegalArgumentException('Invalid authenticated user.');
        }
        this.#authenticatedUser = authenticatedUser;
    }

    /**
     * Returns the authenticated user.
     *
     * @returns {?AuthenticatedUser}
     */
    getAuthenticatedUser(){
        return this.#authenticatedUser;
    }

    /**
     * Drops the authenticated user that had been defined.
     */
    dropAuthenticatedUser(){
        this.#authenticatedUser = null;
    }
}

export default AuthenticatedUserRepository;
