'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException.js';
import Provider from '../providers/Provider.js';

class ProviderManager {
    /**
     * @type {Provider[]}
     */
    static #providerRegister = [];

    /**
     * @type {?ProviderManager}
     */
    static #instance = null;

    /**
     * Returns the singleton instance of the provider manager.
     *
     * @returns {?ProviderManager}
     */
    static getInstance(){
        if ( ProviderManager.#instance === null ){
            ProviderManager.#instance = new ProviderManager();
        }
        return ProviderManager.#instance;
    }

    /**
     * Registers a provider to run.
     *
     * @param {Provider} provider
     *
     * @returns {ProviderManager}
     */
    register(provider){
        if ( !( provider instanceof Provider ) ){
            throw new IllegalArgumentException('Invalid provider instance.');
        }
        ProviderManager.#providerRegister.push(provider);
        return this;
    }

    /**
     * Runs all the registered providers.
     *
     * @returns {Promise<void>}
     */
    async runProviders(){
        for ( let i = 0 ; i < ProviderManager.#providerRegister.length ; i++ ){
            await ProviderManager.#providerRegister[i].run();
        }
    }
}

export default ProviderManager;
