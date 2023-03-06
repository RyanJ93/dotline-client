'use strict';

import NotCallableException from '../exceptions/NotCallableException.js';
import RuntimeException from '../exceptions/RuntimeException.js';

/**
 * @abstract
 */
/* abstract */ class Provider {
    /**
     * The class constructor.
     *
     * @throws {RuntimeException} If directly instantiated.
     */
    constructor(){
        if ( this.constructor === Provider ){
            throw new RuntimeException('Cannot instance a class that is meant to be abstract.');
        }
    }

    /**
     * Implements the provider logic.
     * 
     * @returns {Promise<void>}
     *
     * @throws {NotCallableException} If directly called.
     *
     * @abstract
     */
    async run(){
        throw new NotCallableException('This method cannot be callable, you must extend this class and override this method.');
    }
}

export default Provider;
