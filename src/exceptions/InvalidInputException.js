'use strict';

import IllegalArgumentException from './IllegalArgumentException.js';
import ErrorMessageBag from '../DTOs/ErrorMessageBag.js';
import Exception from './Exception.js';

class InvalidInputException extends Exception {
    _errorMessageBag = null;

    constructor(message, code = 0, exception = null){
        super(message, code, exception);
    }

    setErrorMessageBag(errorMessageBag){
        if ( !( errorMessageBag instanceof ErrorMessageBag ) ){
            throw new IllegalArgumentException('Invalid error message bag instance.');
        }
        this._errorMessageBag = errorMessageBag;
        return this;
    }

    getErrorMessageBag(){
        return this._errorMessageBag;
    }
}

export default InvalidInputException;
