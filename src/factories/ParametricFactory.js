'use strict';

import NotCallableException from '../exceptions/NotCallableException.js';
import RuntimeException from '../exceptions/RuntimeException.js';
import Injectable from '../support/Injectable.js';

/**
 * @abstract
 */
/* abstract */ class ParametricFactory extends Injectable {
    /**
     * The class constructor.
     *
     * @throws {RuntimeException} If directly instantiated.
     */
    constructor(){
        super();

        if ( this.constructor === ParametricFactory ){
            throw new RuntimeException('Cannot instance a class that is meant to be abstract.');
        }
    }

    /**
     * Crafts and then returns the class instance.
     *
     * @param {string} name
     *
     * @returns {Craftable}
     *
     * @throws {NotCallableException} If directly called.
     *
     * @abstract
     */
    craft(name){
        throw new NotCallableException('This method cannot be callable, you must extend this class and override this method.');
    }
}

export default ParametricFactory;
