'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';

class ErrorMessageBag {
    static makeFromHTTPResponse(response){
        let errorMessageBag = null;
        if ( response?.errors !== null && typeof response?.errors === 'object' ){
            errorMessageBag = new ErrorMessageBag();
            for ( const fieldName in response.errors ){
                if ( Array.isArray(response.errors[fieldName]) ){
                    response.errors[fieldName].forEach((errorMessage) => {
                        errorMessageBag.add(fieldName, errorMessage);
                    });
                }
            }
        }
        return errorMessageBag;
    }

    /**
     * @type {Object.<string, string[]>}
     */
    #errors = {};

    /**
     * Adds an error for a given field in the message bag.
     *
     * @param {string} fieldName
     * @param {string} errorMessage
     *
     * @throws {IllegalArgumentException} If an invalid error message is given.
     * @throws {IllegalArgumentException} If an invalid field name is given.
     */
    add(fieldName, errorMessage){
        if ( typeof errorMessage !== 'string' || errorMessage === '' ){
            throw new IllegalArgumentException('Invalid error message.');
        }
        if ( typeof fieldName !== 'string' || fieldName === '' ){
            throw new IllegalArgumentException('Invalid field name.');
        }
        if ( !Array.isArray(this.#errors[fieldName]) ){
            this.#errors[fieldName] = [];
        }
        this.#errors[fieldName].push(errorMessage);
        return this;
    }

    /**
     * Removes all the errors for a given field.
     *
     * @param {string} fieldName
     *
     * @throws {IllegalArgumentException} If an invalid error message is given.
     */
    remove(fieldName){
        if ( typeof fieldName !== 'string' || fieldName === '' ){
            throw new IllegalArgumentException('Invalid field name.');
        }
        delete this.#errors[fieldName];
        return this;
    }

    /**
     * Drops all the error messages.
     */
    clear(){
        this.#errors = {};
        return this;
    }

    /**
     * Returns all the error messages for a given field.
     *
     * @param {string} fieldName
     *
     * @returns {?string[]}
     *
     * @throws {IllegalArgumentException} If an invalid error message is given.
     */
    get(fieldName){
        if ( typeof fieldName !== 'string' || fieldName === '' ){
            throw new IllegalArgumentException('Invalid field name.');
        }
        return this.#errors[fieldName] ?? null;
    }

    /**
     * Returns all the error messages.
     *
     * @returns {Object<string, string[]>}
     */
    getAll(){
        return this.#errors;
    }

    /**
     * Returns a string representation of the message bag.
     *
     * @returns {string}
     *
     * @override
     */
    toString(){
        let output = '';
        for ( const fieldName in this.#errors ){
            output += fieldName + ':\n';
            output += this.#errors[fieldName].map((error) => {
                return '\t' + error;
            }).join('\n');
        }
        return output;
    }
}

export default ErrorMessageBag;
