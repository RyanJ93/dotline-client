'use strict';

import IllegalArgumentException from '../../exceptions/IllegalArgumentException.js';
import Injector from './Injector.js';
import * as JsStore from 'jsstore';

class DatabaseInjector extends Injector {
    /**
     * @type {?JsStore.Connection}
     */
    #connection = null;

    /**
     * Sets the connection instance.
     *
     * @param {JsStore.Connection} connection
     *
     * @throws {IllegalArgumentException} If an invalid connection instance is given.
     */
    #setConnection(connection){
        if ( !( connection instanceof JsStore.Connection ) ){
            throw new IllegalArgumentException('Invalid connection instance.');
        }
        this.#connection = connection;
    }

    /**
     * The class constructor.
     *
     * @param {JsStore.Connection} connection
     */
    constructor(connection){
        super();

        this.#setConnection(connection);
    }

    /**
     * Injects the defined connection instance.
     *
     * @returns {?JsStore.Connection}
     */
    inject(){
        // TODO: Fix type
        return this.#connection;
    }
}

export default DatabaseInjector;
