'use strict';

import NotCallableException from '../../exceptions/NotCallableException.js';
import RuntimeException from '../../exceptions/RuntimeException.js';

/**
 * @abstract
 */
/* abstract */ class Injector {
    /**
     * The class constructor.
     *
     * @throws {RuntimeException} If directly instantiated.
     */
    constructor(){
        if ( this.constructor === Injector ){
            throw new RuntimeException('Cannot instance a class that is meant to be abstract.');
        }
    }

    /**
     * Inject a class.
     *
     * @returns {Injectable}
     *
     * @throws {NotCallableException} If directly called.
     *
     * @abstract
     */
    inject(){
        throw new NotCallableException('This method cannot be callable, you must extend this class and override this method.');
    }
}

export default Injector;
