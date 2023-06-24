'use strict';

import CryptoUtils from '../utils/CryptoUtils';
import Repository from './Repository';

class AuthenticatedUserRSAKeysRepository extends Repository {
    /**
     * @type {?ImportedRSAKeys}
     */
    #authenticatedUserRSAKeys = null;

    /**
     * Stores authenticated user's decrypted RSA keys within the browser.
     *
     * @param {ImportedRSAKeys} authenticatedUserRSAKeys
     * @param {boolean} [isSession=false]
     *
     * @returns {Promise<void>}
     */
    async storeAuthenticatedUserRSAKeys(authenticatedUserRSAKeys, isSession = false){
        const storage = isSession === true ? window.sessionStorage : window.localStorage;
        const [ exportedPrivateKey, exportedPublicKey ] = await Promise.all([
            CryptoUtils.exportKey(authenticatedUserRSAKeys.privateKey),
            CryptoUtils.exportKey(authenticatedUserRSAKeys.publicKey)
        ]);
        this.#authenticatedUserRSAKeys = authenticatedUserRSAKeys;
        storage.setItem('authenticatedUserRSAKeys', JSON.stringify({
            privateKey: exportedPrivateKey,
            publicKey: exportedPublicKey
        }));
    }

    /**
     * Drops authenticated user's decrypted RSA keys.
     */
    dropAuthenticatedUserRSAKeys(){
        window.sessionStorage.removeItem('authenticatedUserRSAKeys');
        window.localStorage.removeItem('authenticatedUserRSAKeys');
        this.#authenticatedUserRSAKeys = null;
    }

    /**
     * Loads from browser storage authenticated user's decrypted RSA keys and then returns them.
     *
     * @returns {Promise<?ImportedRSAKeys>}
     */
    async loadAuthenticatedUserRSAKeys(){
        if ( this.#authenticatedUserRSAKeys === null ){
            try{
                let authenticatedUserRSAKeys = window.localStorage.getItem('authenticatedUserRSAKeys');
                if ( typeof authenticatedUserRSAKeys !== 'string' ){
                    authenticatedUserRSAKeys = window.sessionStorage.getItem('authenticatedUserRSAKeys');
                }
                if ( typeof authenticatedUserRSAKeys === 'string' ){
                    const { publicKey, privateKey } = JSON.parse(authenticatedUserRSAKeys);
                    const importedKeys = await CryptoUtils.importRSAKeys(publicKey, privateKey);
                    this.#authenticatedUserRSAKeys = {
                        privateKey: importedKeys.privateKey,
                        publicKey: importedKeys.publicKey
                    };
                }
            }catch(ex){
                this.dropAuthenticatedUserRSAKeys();
                console.error(ex);
            }
        }
        return this.#authenticatedUserRSAKeys;
    }

    /**
     * Returns stored authenticated user's decrypted RSA keys.
     *
     * @returns {?ImportedRSAKeys}
     */
    getAuthenticatedUserRSAKeys(){
        return this.#authenticatedUserRSAKeys;
    }
}

export default AuthenticatedUserRSAKeysRepository;
