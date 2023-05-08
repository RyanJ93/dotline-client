'use strict';

import RuntimeException from '../exceptions/RuntimeException.js';
import Injector from '../facades/Injector';

/**
 * @abstract
 */
/* abstract */ class Service {
    /**
     * @type {EventBroker}
     *
     * @protected
     */
    _eventBroker;

    /**
     * The class constructor.
     *
     * @throws {RuntimeException} If directly instantiated.
     */
    constructor(){
        if ( this.constructor === Service ){
            throw new RuntimeException('Cannot instance a class that is meant to be abstract.');
        }

        this._eventBroker = Injector.inject('EventBroker');
    }
}

export default Service;
