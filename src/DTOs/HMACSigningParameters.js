'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import Serializable from '../support/traits/Serializable';

/**
 * @typedef HMACSigningParametersProperties
 *
 * @property {string} hashName
 */

class HMACSigningParameters extends Serializable {
    /**
     * Generates an instance of this class based on the fields sent thought a given HTTP request.
     *
     * @param {Request} request
     * @param {string} [prefix=""]
     *
     * @returns {HMACSigningParameters}
     *
     * @throws {IllegalArgumentException} If an invalid prefix is given.
     */
    static makeFromHTTPRequest(request, prefix = ''){
        if ( prefix === null || typeof prefix !== 'string' ){
            throw new IllegalArgumentException('Invalid prefix.');
        }
        return new HMACSigningParameters({
            hashName: request.body[prefix + 'HashName']
        });
    }

    static unserialize(data){
        return data === null ? null : new HMACSigningParameters(JSON.parse(data));
    }

    /**
     * @type {string}
     */
    #hashName;

    /**
     * The class constructor.
     *
     * @param {HMACSigningParametersProperties} properties
     */
    constructor(properties){
        super();

        this.#hashName = properties.hashName;
    }

    /**
     * Returns the name of the hashing to use in HMAC hashing process.
     *
     * @returns {string}
     */
    getHashName(){
        return this.#hashName;
    }

    /**
     * Returns a JSON serializable representation of this class.
     *
     * @returns {HMACSigningParametersProperties}
     */
    toJSON(){
        return {
            hashName: this.#hashName
        };
    }

    serialize(){
        return JSON.stringify(this.toJSON());
    }
}

export default HMACSigningParameters;
