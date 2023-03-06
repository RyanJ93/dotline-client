'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import Injector from '../services/injectors/Injector.js';

class InjectionManager {
    /**
     * @type {Object.<string, Injector>}
     */
    static #injectorRegister = Object.create(null);

    /**
     * @type {?InjectionManager}
     */
    static #instance = null;

    /**
     * Returns the singleton instance of the injection manager.
     *
     * @returns {InjectionManager}
     */
    static getInstance(){
        if ( InjectionManager.#instance === null ){
            InjectionManager.#instance = new InjectionManager();
        }
        return InjectionManager.#instance;
    }

    /**
     * Registers an injector class.
     *
     * @param {string} name
     * @param {Injector} injector
     *
     * @returns {InjectionManager}
     */
    register(name, injector){
        if ( name === '' || typeof name !== 'string' ){
            throw new IllegalArgumentException('Invalid name.');
        }
        if ( !( injector instanceof Injector ) ){
            throw new IllegalArgumentException('Invalid injector instance.');
        }
        InjectionManager.#injectorRegister[name] = injector;
        return this;
    }

    /**
     * Injects a class based on the name of its registered injector.
     *
     * @param {string} name
     * @param {any[]} parameters
     *
     * @returns {?Injectable}
     */
    inject(name, parameters = []){
        const injector = InjectionManager.#injectorRegister[name] ?? null;
        return injector === null ? null : injector.inject(...parameters);
    }
}

export default InjectionManager;
