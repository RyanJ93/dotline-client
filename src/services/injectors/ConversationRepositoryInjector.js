'use strict';

import ConversationRepository from '../../repositories/ConversationRepository';
import Injector from './Injector';

class ConversationRepositoryInjector extends Injector {
    inject(){
        return new ConversationRepository();
    }
}

export default ConversationRepositoryInjector;
