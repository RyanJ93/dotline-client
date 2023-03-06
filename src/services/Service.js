'use strict';

import RuntimeException from '../exceptions/RuntimeException.js';

/**
 * @abstract
 */
/* abstract */ class Service {
    /**
     * The class constructor.
     *
     * @throws {RuntimeException} If directly instantiated.
     */
    constructor(){
        if ( this.constructor === Service ){
            throw new RuntimeException('Cannot instance a class that is meant to be abstract.');
        }
    }
}

export default Service;
