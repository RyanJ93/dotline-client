'use strict';

import ConversationMemberRepository from '../../repositories/ConversationMemberRepository';
import Injector from './Injector';

class ConversationMemberRepositoryInjector extends Injector {
    inject(){
        return new ConversationMemberRepository();
    }
}

export default ConversationMemberRepositoryInjector;
