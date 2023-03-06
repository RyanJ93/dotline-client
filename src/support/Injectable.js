'use strict';

import RuntimeException from '../exceptions/RuntimeException.js';

/**
 * @abstract
 */
/* abstract */ class Injectable {
    /**
     * The class constructor.
     *
     * @throws {RuntimeException} If directly instantiated.
     */
    constructor(){
        if ( this.constructor === Injectable ){
            throw new RuntimeException('Cannot instance a class that is meant to be abstract.');
        }
    }
}

export default Injectable;
