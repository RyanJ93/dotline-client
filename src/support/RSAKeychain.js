'use strict';

class RSAKeychain {
    static #instance = null;

    static getInstance(){
        if ( RSAKeychain.#instance === null ){
            RSAKeychain.#instance = new RSAKeychain();
        }
        return RSAKeychain.#instance;
    }

    #authenticatedUserRSAKeys = null;

    setAuthenticatedUserRSAKeys(authenticatedUserRSAKeys){
        this.#authenticatedUserRSAKeys = authenticatedUserRSAKeys;
        return this;
    }
}

export default RSAKeychain;
