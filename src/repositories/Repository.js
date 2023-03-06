'use strict';

import RuntimeException from '../exceptions/RuntimeException.js';
import Injectable from '../support/Injectable.js';

/**
 * @abstract
 */
/* abstract */ class Repository extends Injectable {
    /**
     * The class constructor.
     *
     * @throws {RuntimeException} If directly instantiated.
     */
    constructor(){
        super();

        if ( this.constructor === Repository ){
            throw new RuntimeException('Cannot instance a class that is meant to be abstract.');
        }
    }
}

export default Repository;
