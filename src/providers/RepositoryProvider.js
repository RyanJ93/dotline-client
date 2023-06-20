'use strict';

import AuthenticatedUserRSAKeysRepositoryInjector from '../services/injectors/AuthenticatedUserRSAKeysRepositoryInjector';
import MessageCommitCheckpointRepositoryInjector from '../services/injectors/MessageCommitCheckpointRepositoryInjector';
import ConversationMemberRepositoryInjector from '../services/injectors/ConversationMemberRepositoryInjector';
import AuthenticatedUserRepositoryInjector from '../services/injectors/AuthenticatedUserRepositoryInjector';
import LoadedAttachmentRepositoryInjector from '../services/injectors/LoadedAttachmentRepositoryInjector';
import UserSettingsRepositoryInjector from '../services/injectors/UserSettingsRepositoryInjector';
import ConversationRepositoryInjector from '../services/injectors/ConversationRepositoryInjector';
import AccessTokenRepositoryInjector from '../services/injectors/AccessTokenRepositoryInjector';
import StickerPackRepositoryInjector from '../services/injectors/StickerPackRepositoryInjector';
import StickerRepositoryInjector from '../services/injectors/StickerRepositoryInjector';
import MessageRepositoryInjector from '../services/injectors/MessageRepositoryInjector';
import UserRepositoryInjector from '../services/injectors/UserRepositoryInjector';
import InjectionManager from '../support/InjectionManager';
import Provider from './Provider';

class RepositoryProvider extends Provider {
    /**
     * Registers all the available repositories.
     *
     * @returns {Promise<void>}
     */
    async run(){
        InjectionManager.getInstance().register('AuthenticatedUserRSAKeysRepository', new AuthenticatedUserRSAKeysRepositoryInjector());
        InjectionManager.getInstance().register('MessageCommitCheckpointRepository', new MessageCommitCheckpointRepositoryInjector());
        InjectionManager.getInstance().register('ConversationMemberRepository', new ConversationMemberRepositoryInjector());
        InjectionManager.getInstance().register('AuthenticatedUserRepository', new AuthenticatedUserRepositoryInjector());
        InjectionManager.getInstance().register('LoadedAttachmentRepository', new LoadedAttachmentRepositoryInjector());
        InjectionManager.getInstance().register('UserSettingsRepository', new UserSettingsRepositoryInjector());
        InjectionManager.getInstance().register('ConversationRepository', new ConversationRepositoryInjector());
        InjectionManager.getInstance().register('AccessTokenRepository', new AccessTokenRepositoryInjector());
        InjectionManager.getInstance().register('StickerPackRepository', new StickerPackRepositoryInjector());
        InjectionManager.getInstance().register('StickerRepository', new StickerRepositoryInjector());
        InjectionManager.getInstance().register('MessageRepository', new MessageRepositoryInjector());
        InjectionManager.getInstance().register('UserRepository', new UserRepositoryInjector());
    }
}

export default RepositoryProvider;
