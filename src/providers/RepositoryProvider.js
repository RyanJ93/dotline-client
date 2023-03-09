'use strict';

import AuthenticatedUserRSAKeysRepositoryInjector from '../services/injectors/AuthenticatedUserRSAKeysRepositoryInjector';
import AuthenticatedUserRepositoryInjector from '../services/injectors/AuthenticatedUserRepositoryInjector';
import AccessTokenRepositoryInjector from '../services/injectors/AccessTokenRepositoryInjector';
import UserRepositoryInjector from '../services/injectors/UserRepositoryInjector';
import UserRepository from '../repositories/UserRepository';
import InjectionManager from '../support/InjectionManager';
import Provider from './Provider';

class RepositoryProvider extends Provider {
    async run(){
        InjectionManager.getInstance().register('AuthenticatedUserRSAKeysRepository', new AuthenticatedUserRSAKeysRepositoryInjector());
        InjectionManager.getInstance().register('AuthenticatedUserRepository', new AuthenticatedUserRepositoryInjector());
        InjectionManager.getInstance().register('AccessTokenRepository', new AccessTokenRepositoryInjector());
        InjectionManager.getInstance().register('UserRepository', new UserRepositoryInjector());
    }
}

export default RepositoryProvider;
