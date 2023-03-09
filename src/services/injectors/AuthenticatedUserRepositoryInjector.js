'use strict';

import AuthenticatedUserRepository from '../../repositories/AuthenticatedUserRepository';
import Injector from './Injector';

class AuthenticatedUserRepositoryInjector extends Injector {
    #authenticatedUserRepository = null;

    inject(){
        if ( this.#authenticatedUserRepository === null ){
            this.#authenticatedUserRepository = new AuthenticatedUserRepository();
        }
        return this.#authenticatedUserRepository;
    }
}

export default AuthenticatedUserRepositoryInjector;
