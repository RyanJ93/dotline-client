'use strict';

import ServerParamsRepository from '../../repositories/ServerParamsRepository';
import Injector from './Injector';

class ServerParamsRepositoryInjector extends Injector {
    /**
     * @type {?ServerParamsRepository}
     */
    #serverParamsRepository = null;

    inject(){
        if ( this.#serverParamsRepository === null ){
            this.#serverParamsRepository = new ServerParamsRepository();
        }
        return this.#serverParamsRepository;
    }
}

export default ServerParamsRepositoryInjector;
