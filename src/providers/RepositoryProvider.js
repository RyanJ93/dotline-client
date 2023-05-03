'use strict';

import AuthenticatedUserRSAKeysRepositoryInjector from '../services/injectors/AuthenticatedUserRSAKeysRepositoryInjector';
import ConversationMemberRepositoryInjector from '../services/injectors/ConversationMemberRepositoryInjector';
import AuthenticatedUserRepositoryInjector from '../services/injectors/AuthenticatedUserRepositoryInjector';
import ConversationRepositoryInjector from '../services/injectors/ConversationRepositoryInjector';
import AccessTokenRepositoryInjector from '../services/injectors/AccessTokenRepositoryInjector';
import MessageRepositoryInjector from '../services/injectors/MessageRepositoryInjector';
import UserRepositoryInjector from '../services/injectors/UserRepositoryInjector';
import UserRepository from '../repositories/UserRepository';
import InjectionManager from '../support/InjectionManager';
import Provider from './Provider';

class RepositoryProvider extends Provider {
    async run(){
        InjectionManager.getInstance().register('AuthenticatedUserRSAKeysRepository', new AuthenticatedUserRSAKeysRepositoryInjector());
        InjectionManager.getInstance().register('ConversationMemberRepository', new ConversationMemberRepositoryInjector());
        InjectionManager.getInstance().register('AuthenticatedUserRepository', new AuthenticatedUserRepositoryInjector());
        InjectionManager.getInstance().register('ConversationRepository', new ConversationRepositoryInjector());
        InjectionManager.getInstance().register('AccessTokenRepository', new AccessTokenRepositoryInjector());
        InjectionManager.getInstance().register('MessageRepository', new MessageRepositoryInjector());
        InjectionManager.getInstance().register('UserRepository', new UserRepositoryInjector());
    }
}

export default RepositoryProvider;
