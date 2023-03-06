'use strict';

import RuntimeException from '../exceptions/RuntimeException.js';
import Injectable from '../support/Injectable.js';

/**
 * @abstract
 */
/* abstract */ class Craftable extends Injectable {
    /**
     * The class constructor.
     *
     * @throws {RuntimeException} If directly instantiated.
     */
    constructor(){
        super();

        if ( this.constructor === Craftable ){
            throw new RuntimeException('Cannot instance a class that is meant to be abstract.');
        }
    }
}

export default Craftable;
