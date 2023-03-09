'use strict';

import AccessTokenRepository from '../../repositories/AccessTokenRepository';
import Injector from './Injector';

class AccessTokenRepositoryInjector extends Injector {
    #accessTokenRepository = null;

    inject(){
        if ( this.#accessTokenRepository === null ){
            this.#accessTokenRepository = new AccessTokenRepository();
        }
        return this.#accessTokenRepository;
    }
}

export default AccessTokenRepositoryInjector;
