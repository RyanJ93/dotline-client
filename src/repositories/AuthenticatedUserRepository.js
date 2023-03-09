'use strict';

import Repository from './Repository';

class AuthenticatedUserRepository extends Repository {
    #authenticatedUser = null;

    storeAuthenticatedUser(authenticatedUser){
        this.#authenticatedUser = authenticatedUser;
    }

    getAuthenticatedUser(){
        return this.#authenticatedUser;
    }

    dropAuthenticatedUser(){
        this.#authenticatedUser = null;
    }
}

export default AuthenticatedUserRepository;
