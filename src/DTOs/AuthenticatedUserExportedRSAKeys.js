'use strict';

/**
 * @typedef AuthenticatedUserExportedRSAKeysProperties
 *
 * @property {AESEncryptionParameters} AESEncryptionParameters
 * @property {string} encryptedRSAPrivateKey
 * @property {string} RSAPrivateKey
 * @property {string} RSAPublicKey
 */

class AuthenticatedUserExportedRSAKeys {
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
    #RSAPrivateKey;

    /**
     * @type {string}
     */
    #RSAPublicKey;

    /**
     * The class constructor.
     *
     * @param {AuthenticatedUserExportedRSAKeysProperties} properties
     */
    constructor(properties){
        this.#AESEncryptionParameters = properties.AESEncryptionParameters;
        this.#encryptedRSAPrivateKey = properties.encryptedRSAPrivateKey;
        this.#RSAPrivateKey = properties.RSAPrivateKey;
        this.#RSAPublicKey = properties.RSAPublicKey;
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
     * Returns the RSA private key.
     *
     * @returns {string}
     */
    getRSAPrivateKey(){
        return this.#RSAPrivateKey;
    }

    /**
     * Returns the RSA public key.
     *
     * @returns {string}
     */
    getRSAPublicKey(){
        return this.#RSAPublicKey;
    }
}

export default AuthenticatedUserExportedRSAKeys;
