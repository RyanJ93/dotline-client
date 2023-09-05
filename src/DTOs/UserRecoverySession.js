'use strict';

import AESEncryptionParameters from './AESEncryptionParameters';

/**
 * @typedef UserRecoverySessionProperties
 *
 * @property {AESEncryptionParameters} recoveryRSAPrivateKeyEncryptionParameters
 * @property {string} recoveryRSAPrivateKey
 * @property {string} sessionToken
 * @property {string} recoveryKey
 */

class UserRecoverySession {
    /**
     * Generates an instance of this class based on the given HTTP response.
     *
     * @param {Object} response
     * @param {string} recoveryKey
     *
     * @returns {UserRecoverySession}
     */
    static makeFromHTTPResponse(response, recoveryKey){
        return new UserRecoverySession({
            recoveryRSAPrivateKeyEncryptionParameters: new AESEncryptionParameters(response.recoveryParameters.recoveryRSAPrivateKeyEncryptionParameters),
            recoveryRSAPrivateKey: response.recoveryParameters.recoveryRSAPrivateKey,
            sessionToken: response.sessionToken,
            recoveryKey: recoveryKey
        });
    }

    /**
     * @type {AESEncryptionParameters}
     */
    #recoveryRSAPrivateKeyEncryptionParameters;

    /**
     * @type {string}
     */
    #recoveryRSAPrivateKey;

    /**
     * @type {string}
     */
    #sessionToken;

    /**
     * @type {string}
     */
    #recoveryKey;

    /**
     * The class constructor.
     *
     * @param {UserRecoverySessionProperties} properties
     */
    constructor(properties){
        this.#recoveryRSAPrivateKeyEncryptionParameters = properties.recoveryRSAPrivateKeyEncryptionParameters;
        this.#recoveryRSAPrivateKey = properties.recoveryRSAPrivateKey;
        this.#sessionToken = properties.sessionToken;
        this.#recoveryKey = properties.recoveryKey;
    }

    /**
     * Returns the encryption parameters for the recovery RSA private key.
     *
     * @returns {AESEncryptionParameters}
     */
    getRecoveryRSAPrivateKeyEncryptionParameters(){
        return this.#recoveryRSAPrivateKeyEncryptionParameters;
    }

    /**
     * Returns the recovery RSA private key.
     *
     * @returns {string}
     */
    getRecoveryRSAPrivateKey(){
        return this.#recoveryRSAPrivateKey;
    }

    /**
     * Returns the user recovery session token.
     *
     * @returns {string}
     */
    getSessionToken(){
        return this.#sessionToken;
    }

    /**
     * Returns the recovery key used to initialize the user recovery session.
     *
     * @returns {string}
     */
    getRecoveryKey(){
        return this.#recoveryKey;
    }
}

export default UserRecoverySession;
