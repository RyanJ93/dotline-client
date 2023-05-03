'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import AESStaticParameters from './AESStaticParameters.js';

/**
 * @typedef AESEncryptionParametersProperties
 *
 * @property {number} keyLength
 * @property {string} mode
 * @property {string} iv
 */

class AESEncryptionParameters extends AESStaticParameters {
    /**
     * Generates an instance of this class based on the fields sent thought a given HTTP request.
     *
     * @param {Request} request
     * @param {string} [prefix=""]
     *
     * @returns {AESEncryptionParameters}
     *
     * @throws {IllegalArgumentException} If an invalid prefix is given.
     */
    static makeFromHTTPRequest(request, prefix = ''){
        if ( prefix === null || typeof prefix !== 'string' ){
            throw new IllegalArgumentException('Invalid prefix.');
        }
        return new AESEncryptionParameters({
            keyLength: parseInt(request.body[prefix + 'KeyLength']),
            mode: request.body[prefix + 'Mode'],
            iv: request.body[prefix + 'IV']
        });
    }

    /**
     *
     *
     * @param {AESStaticParameters} aesStaticParameters
     * @param {string} iv
     *
     * @returns {AESEncryptionParameters}
     */
    static makeFromAESStaticParameters(aesStaticParameters, iv){
        return new AESEncryptionParameters(Object.assign({
            iv: iv
        }, aesStaticParameters.toJSON()));
    }

    static unserialize(data){
        return new AESEncryptionParameters(JSON.parse(data));
    }

    /**
     * @type {string}
     */
    #iv;

    /**
     * The class constructor.
     *
     * @param {AESEncryptionParametersProperties} properties
     */
    constructor(properties){
        super(properties);

        this.#iv = properties.iv;
    }

    /**
     * Returns the IV used in AES encryption.
     *
     * @returns {string}
     */
    getIV(){
        return this.#iv;
    }

    /**
     * Returns a JSON serializable representation of this class.
     *
     * @returns {AESEncryptionParametersProperties}
     */
    toJSON(){
        const JSONObject = super.toJSON();
        JSONObject.iv = this.#iv;
        return JSONObject;
    }
}

export default AESEncryptionParameters;
