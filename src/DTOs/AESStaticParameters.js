'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import Serializable from '../support/traits/Serializable';

/**
 * @typedef AESStaticParametersProperties
 *
 * @property {number} keyLength
 * @property {string} mode
 */

class AESStaticParameters extends Serializable {
    /**
     * Generates an instance of this class based on the fields sent thought a given HTTP request.
     *
     * @param {Request} request
     * @param {string} [prefix=""]
     *
     * @returns {AESStaticParameters}
     *
     * @throws {IllegalArgumentException} If an invalid prefix is given.
     */
    static makeFromHTTPRequest(request, prefix = ''){
        if ( prefix === null || typeof prefix !== 'string' ){
            throw new IllegalArgumentException('Invalid prefix.');
        }
        return new AESStaticParameters({
            keyLength: parseInt(request.body[prefix + 'KeyLength']),
            mode: request.body[prefix + 'Mode']
        });
    }

    static unserialize(data){
        return data === null ? null : new AESStaticParameters(JSON.parse(data));
    }

    /**
     * @type {number}
     *
     * @protected
     */
    _keyLength;

    /**
     * @type {string}
     *
     * @protected
     */
    _mode;

    /**
     * The class constructor.
     *
     * @param {AESStaticParametersProperties} properties
     */
    constructor(properties){
        super();

        this._keyLength = properties.keyLength;
        this._mode = properties.mode;
    }

    /**
     * Returns the encryption key length.
     *
     * @returns {number}
     */
    getKeyLength(){
        return this._keyLength;
    }

    /**
     * Returns the AES mode.
     *
     * @returns {string}
     */
    getMode(){
        return this._mode;
    }

    /**
     * Returns a JSON serializable representation of this class.
     *
     * @returns {AESStaticParametersProperties}
     */
    toJSON(){
        return {
            keyLength: this._keyLength,
            mode: this._mode
        };
    }

    serialize(){
        return JSON.stringify(this.toJSON());
    }
}

export default AESStaticParameters;
