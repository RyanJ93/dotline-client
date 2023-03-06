'use strict';

import RuntimeException from '../exceptions/RuntimeException.js';

/**
 * @abstract
 */
/* abstract */ class Facade {
    /**
     * The class constructor.
     *
     * @throws {RuntimeException} If directly instantiated.
     */
    constructor(){
        if ( this.constructor === Facade ){
            throw new RuntimeException('Cannot instance a class that is meant to be abstract.');
        }
    }
}

export default Facade;
