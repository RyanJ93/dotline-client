'use strict';

/**
 * @typedef UserRecoveryParamsProperties
 *
 * @property {AESEncryptionParameters} AESEncryptionParameters
 * @property {string} encryptedRSAPrivateKey
 * @property {string} recoveryKey
 */

class UserRecoveryParams {
    /**
     * @type {AESEncryptionParameters}
     */
    #AESEncryptionParameters;

    /**
     * @type {string}
     */
    #encryptedRSAPrivateKey;

    /**
     * @type {string}
     */
    #recoveryKey;

    /**
     * The class constructor.
     *
     * @param {UserRecoveryParamsProperties} properties
     */
    constructor(properties){
        this.#AESEncryptionParameters = properties.AESEncryptionParameters;
        this.#encryptedRSAPrivateKey = properties.encryptedRSAPrivateKey;
        this.#recoveryKey = properties.recoveryKey;
    }

    /**
     * Returns the encryption parameters used.
     *
     * @returns {AESEncryptionParameters}
     */
    getAESEncryptionParameters(){
        return this.#AESEncryptionParameters;
    }

    /**
     * Returns the encrypted RSA private key.
     *
     * @returns {string}
     */
    getEncryptedRSAPrivateKey(){
        return this.#encryptedRSAPrivateKey;
    }

    /**
     * Returns the recovery AES key.
     *
     * @returns {string}
     */
    getRecoveryKey(){
        return this.#recoveryKey;
    }
}

export default UserRecoveryParams;
