'use strict';

import ConversationService from '../services/ConversationService';
import UserService from '../services/UserService';
import EventListener from './EventListener';
import Injector from '../facades/Injector';

class UserTypingEventListener extends EventListener {
    #eventBroker;

    constructor(){
        super();

        this.#eventBroker = Injector.inject('EventBroker');
    }

    async listen(conversationID, userID){
        const conversation = await new ConversationService().getConversationByID(conversationID);
        const user = await new UserService().getUserByID(userID);
        this.#eventBroker.emit('userTyping', conversation, user);
    }
}

export default UserTypingEventListener;
