'use strict';

import NotCallableException from '../exceptions/NotCallableException.js';
import RuntimeException from '../exceptions/RuntimeException.js';
import Injectable from '../support/Injectable.js';

/**
 * @abstract
 */
/* abstract */ class Factory extends Injectable {
    /**
     * The class constructor.
     *
     * @throws {RuntimeException} If directly instantiated.
     */
    constructor(){
        super();

        if ( this.constructor === Factory ){
            throw new RuntimeException('Cannot instance a class that is meant to be abstract.');
        }
    }

    /**
     * Crafts and then returns the class instance.
     *
     * @returns {Craftable}
     *
     * @throws {NotCallableException} If directly called.
     *
     * @abstract
     */
    craft(){
        throw new NotCallableException('This method cannot be callable, you must extend this class and override this method.');
    }
}

export default Factory;
