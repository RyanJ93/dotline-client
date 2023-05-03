'use strict';

import MessageRepository from '../../repositories/MessageRepository';
import Injector from './Injector';

class MessageRepositoryInjector extends Injector {
    inject(){
        return new MessageRepository();
    }
}

export default MessageRepositoryInjector;
