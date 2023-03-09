'use strict';

import AuthenticatedUserRSAKeysRepository from '../../repositories/AuthenticatedUserRSAKeysRepository';
import Injector from './Injector';

class AuthenticatedUserRSAKeysRepositoryInjector extends Injector {
    #authenticatedUserRSAKeysRepository = null;

    inject(){
        if ( this.#authenticatedUserRSAKeysRepository === null ){
            this.#authenticatedUserRSAKeysRepository = new AuthenticatedUserRSAKeysRepository();
        }
        return this.#authenticatedUserRSAKeysRepository;
    }
}

export default AuthenticatedUserRSAKeysRepositoryInjector;
