'use strict';

class ExceptionMapper {
    /**
     * @type {?ExceptionMapper}
     */
    static #instance = null;

    /**
     * Returns the class instance as a singleton.
     *
     * @returns {ExceptionMapper}
     */
    static getInstance(){
        if ( ExceptionMapper.#instance === null ){
            ExceptionMapper.#instance = new ExceptionMapper();
        }
        return ExceptionMapper.#instance;
    }

    /**
     * @type {Object.<string, Exception.constructor>}
     */
    #exceptionHTTPCodeMapping = Object.create(null);

    /**
     * @type {Object.<number, Exception.constructor>}
     */
    #exceptionStatusMapping = Object.create(null);

    /**
     * Registers the exception that should be thrown whenever a request fails with the given code.
     *
     * @param {number} HTTPCode
     * @param {Exception.constructor} exception
     *
     * @returns {ExceptionMapper}
     */
    registerExceptionByHTTPCode(HTTPCode, exception){
        this.#exceptionHTTPCodeMapping[HTTPCode] = exception;
        return this;
    }

    /**
     * Registers the exception that should be thrown whenever a request fails with the given status.
     *
     * @param {string} status
     * @param {Exception.constructor} exception
     *
     * @returns {ExceptionMapper}
     */
    registerExceptionByStatus(status, exception){
        this.#exceptionStatusMapping[status] = exception;
        return this;
    }

    /**
     * Returns the exception defined for the given HTTP status code.
     *
     * @param {number} HTTPCode
     *
     * @returns {?Exception.constructor}
     */
    getExceptionByHTTPCode(HTTPCode){
        return this.#exceptionHTTPCodeMapping[HTTPCode] ?? null;
    }

    /**
     * Returns the exception defined for the given status.
     *
     * @param {string} status
     *
     * @returns {?Exception.constructor}
     */
    getExceptionByStatus(status){
        return this.#exceptionStatusMapping[status] ?? null;
    }
}

export default ExceptionMapper;
