'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import ServerParams from '../DTOs/ServerParams';
import Repository from './Repository';

class ServerParamsRepository extends Repository {
    /**
     * @type {?ServerParams}
     */
    #serverParams = null;

    /**
     * Sets the loaded server params.
     *
     * @param {ServerParams} serverParams
     *
     * @returns {ServerParamsRepository}
     *
     * @throws {IllegalArgumentException} If some invalid server params are given.
     */
    setServerParams(serverParams){
        if ( !( serverParams instanceof ServerParams ) ){
            throw new IllegalArgumentException('Invalid server params.');
        }
        this.#serverParams = serverParams;
        return this;
    }

    /**
     * Returns the loaded server params.
     *
     * @returns {?ServerParams}
     */
    getServerParams(){
        return this.#serverParams;
    }

    /**
     * Drops loaded server params.
     *
     * @returns {ServerParamsRepository}
     */
    dropServerParams(){
        this.#serverParams = null;
        return this;
    }
}

export default ServerParamsRepository;
