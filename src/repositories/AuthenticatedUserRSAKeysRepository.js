'use strict';

import CryptoUtils from '../utils/CryptoUtils';
import Repository from './Repository';

class AuthenticatedUserRSAKeysRepository extends Repository {
    #authenticatedUserRSAKeys = null;

    async storeAuthenticatedUserRSAKeys(authenticatedUserRSAKeys, isSession = false){
        const storage = isSession === true ? window.sessionStorage : window.localStorage;
        const [ exportedPrivateKey, exportedPublicKey ] = await Promise.all([
            CryptoUtils.exportKey(authenticatedUserRSAKeys.privateKey),
            CryptoUtils.exportKey(authenticatedUserRSAKeys.publicKey)
        ]);
        this.#authenticatedUserRSAKeys = authenticatedUserRSAKeys;
        storage.setItem('authenticatedUserRSAKeys', JSON.stringify({
            privateKey: exportedPrivateKey,
            publicKey: exportedPublicKey,
        }));
    }

    dropAuthenticatedUserRSAKeys(){
        window.sessionStorage.removeItem('authenticatedUserRSAKeys');
        window.localStorage.removeItem('authenticatedUserRSAKeys');
        this.#authenticatedUserRSAKeys = null;
    }

    async loadAuthenticatedUserRSAKeys(){
        if ( this.#authenticatedUserRSAKeys === null ){
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
        return this.#authenticatedUserRSAKeys;
    }

    getAuthenticatedUserRSAKeys(){
        return this.#authenticatedUserRSAKeys;
    }
}

export default AuthenticatedUserRSAKeysRepository;
