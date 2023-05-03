'use strict';

import NotCallableException from '../exceptions/NotCallableException';
import RuntimeException from '../exceptions/RuntimeException';

/**
 * @abstract
 */
/* abstract */ class EventListener {
    static getClosure(){
        return async (...args) => {
            const controller = new this();
            return await controller.listen(...args);
        };
    }

    /**
     * The class constructor.
     *
     * @throws {RuntimeException} If directly instantiated.
     */
    constructor(){
        if ( this.constructor === EventListener ){
            throw new RuntimeException('Cannot instance a class that is meant to be abstract.');
        }
    }

    /**
     *
     *
     * @returns {Promise<void>}
     *
     * @throws {NotCallableException} If directly called.
     *
     * @abstract
     */
    async listen(){
        throw new NotCallableException('This method cannot be callable, you must extend this class and override this method.');
    }
}

export default EventListener;
