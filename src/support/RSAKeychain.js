'use strict';

import CryptoUtils from '../utils/CryptoUtils';

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

    getAuthenticatedUserRSAKeys(){
        return this.#authenticatedUserRSAKeys;
    }

    async persistAuthenticatedUserRSAKeys(isSession = false){
        const storage = isSession === true ? window.sessionStorage : window.localStorage;
        const [ exportedPrivateKey, exportedPublicKey ] = await Promise.all([
            CryptoUtils.exportKey(this.#authenticatedUserRSAKeys.privateKey),
            CryptoUtils.exportKey(this.#authenticatedUserRSAKeys.publicKey)
        ]);
        storage.setItem('authenticatedUserRSAKeys', JSON.stringify({
            privateKey: exportedPrivateKey,
            publicKey: exportedPublicKey,
        }));
    }

    dropAuthenticatedUserRSAKeys(){
        window.sessionStorage.removeItem('authenticatedUserRSAKeys');
        window.localStorage.removeItem('authenticatedUserRSAKeys');
    }

    async loadAuthenticatedUserRSAKeys(){
        try{
            let authenticatedUserRSAKeys = window.localStorage.getItem('authenticatedUserRSAKeys');
            if ( typeof authenticatedUserRSAKeys !== 'string' ){
                authenticatedUserRSAKeys = window.sessionStorage.getItem('authenticatedUserRSAKeys');
            }
            if ( typeof authenticatedUserRSAKeys === 'string' ){
                authenticatedUserRSAKeys = JSON.parse(authenticatedUserRSAKeys);
                const { publicKey, privateKey } = authenticatedUserRSAKeys;
                this.#authenticatedUserRSAKeys = await CryptoUtils.importRSAKeys(publicKey, privateKey);
            }
        }catch(ex){
            this.dropAuthenticatedUserRSAKeys();
            console.error(ex);
        }
    }
}

export default RSAKeychain;
