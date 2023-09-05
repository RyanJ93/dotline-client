'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import InvalidInputException from '../exceptions/InvalidInputException';

class ErrorMessageRender {
    /**
     * @type {Object.<string, string>}
     */
    #exceptionMapping = Object.create(null);

    /**
     * @type {Object.<string, Object>}
     */
    #fieldMapping = Object.create(null);

    /**
     * @type {?Object}
     */
    #defaultErrorViewerRef = null;

    /**
     * @type {string}
     */
    #defaultErrorMessage = '';

    /**
     * Processes exception related to form fields.
     *
     * @param {InvalidInputException} exception
     */
    #processInvalidInputException(exception){
        const errors = exception.getErrorMessageBag().getAll();
        for ( const fieldName in errors ){
            if ( typeof this.#fieldMapping[fieldName] !== 'undefined' ){
                this.#fieldMapping[fieldName].current.setErrorMessage(errors[fieldName].join('\n'));
            }
        }
    }

    /**
     * Returns the error message corresponding to the given exception according to the defined mapping.
     *
     * @param {Error} exception
     *
     * @returns {string}
     */
    #getErrorMessageForException(exception){
        if ( typeof this.#exceptionMapping[exception.constructor.name] === 'string' ){
            return this.#exceptionMapping[exception.constructor.name];
        }
        return this.#defaultErrorMessage;
    }

    /**
     * Sets the reference to the default error viewer component.
     *
     * @param {Object} defaultErrorViewerRef
     *
     * @returns {ErrorMessageRender}
     *
     * @throws {IllegalArgumentException} If an invalid error viewer reference is given.
     */
    setDefaultErrorViewerRef(defaultErrorViewerRef){
        if ( defaultErrorViewerRef === null || typeof defaultErrorViewerRef !== 'object' ){
            throw new IllegalArgumentException('Invalid error viewer reference.');
        }
        this.#defaultErrorViewerRef = defaultErrorViewerRef;
        return this;
    }

    /**
     * Returns the reference to the default error viewer component defined.
     *
     * @returns {?Object}
     */
    getDefaultErrorViewerRef(){
        return this.#defaultErrorViewerRef;
    }

    /**
     * Sets the default error message.
     *
     * @param {string} defaultErrorMessage
     *
     * @returns {ErrorMessageRender}
     *
     * @throws {IllegalArgumentException} If an invalid default error message is given.
     */
    setDefaultErrorMessage(defaultErrorMessage){
        if ( typeof defaultErrorMessage !== 'string' ){
            throw new IllegalArgumentException('Invalid default error message.');
        }
        this.#defaultErrorMessage = defaultErrorMessage;
        return this;
    }

    /**
     * Returns the default error message defined.
     *
     * @returns {string}
     */
    getDefaultErrorMessage(){
        return this.#defaultErrorMessage;
    }

    /**
     * Sets the exception/error message mapping.
     *
     * @param {Object.<string, string>} exceptionMapping
     *
     * @returns {ErrorMessageRender}
     *
     * @throws {IllegalArgumentException} If an invalid mapping is given.
     */
    setExceptionMapping(exceptionMapping){
        if ( exceptionMapping === null || typeof exceptionMapping !== 'object' ){
            throw new IllegalArgumentException('Invalid exception mapping.');
        }
        this.#exceptionMapping = exceptionMapping;
        return this;
    }

    /**
     * Returns the exception/error message mapping defined.
     *
     * @returns {Object<string, string>}
     */
    getExceptionMapping(){
        return this.#exceptionMapping;
    }

    /**
     * Sets the field name/component reference mapping.
     *
     * @param {Object.<string, Object>} fieldMapping
     *
     * @returns {ErrorMessageRender}
     *
     * @throws {IllegalArgumentException} If an invalid mapping is given.
     */
    setFieldMapping(fieldMapping){
        if ( fieldMapping === null || typeof fieldMapping !== 'object' ){
            throw new IllegalArgumentException('Invalid field mapping.');
        }
        this.#fieldMapping = fieldMapping;
        return this;
    }

    /**
     * Returns the field name/component reference mapping defined.
     *
     * @returns {Object<string, Object>}
     */
    getFieldMapping(){
        return this.#fieldMapping;
    }

    /**
     * Processes a given exception.
     *
     * @param {Error} exception
     *
     * @returns {ErrorMessageRender}
     *
     * @throws {IllegalArgumentException} If an invalid exception is given.
     */
    processException(exception){
        if ( !( exception instanceof Error ) ){
            throw new IllegalArgumentException('Invalid exception.');
        }
        if ( exception instanceof InvalidInputException ){
            this.#processInvalidInputException(exception);
        }else{
            const errorMessage = this.#getErrorMessageForException(exception);
            this.#defaultErrorViewerRef.current.setErrorMessage(errorMessage);
        }
        return this;
    }

    /**
     * Displays a generic error message.
     *
     * @param {string} errorMessage
     * @param {boolean} [append=false]
     *
     * @returns {ErrorMessageRender}
     *
     * @throws {IllegalArgumentException} If an invalid error message is given.
     */
    displayErrorMessage(errorMessage, append = false){
        if ( typeof errorMessage !== 'string' ){
            throw new IllegalArgumentException('Invalid error message.');
        }
        if ( append !== true ){
            this.#defaultErrorViewerRef.current.setErrorMessage(errorMessage);
        }else{
            const currentMessage = this.#defaultErrorViewerRef.current.getErrorMessage();
            this.#defaultErrorViewerRef.current.setErrorMessage(currentMessage + '\n' + errorMessage);
        }
        return this;
    }

    /**
     * Resets all the error messages.
     *
     * @returns {ErrorMessageRender}
     */
    resetErrorMessages(){
        for ( const fieldName in this.#fieldMapping ){
            this.#fieldMapping[fieldName].current.setErrorMessage(null);
        }
        this.#defaultErrorViewerRef.current.setErrorMessage(null);
        return this;
    }
}

export default ErrorMessageRender;
