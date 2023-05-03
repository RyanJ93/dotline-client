'use strict';

import ConversationService from '../services/ConversationService';
import MessageService from '../services/MessageService';
import EventListener from './EventListener';
import App from '../facades/App';

class MessageEventListener extends EventListener {
    async listen(messageProperties){
        const conversation = await new ConversationService().assertConversation(messageProperties.conversationID);
        const messageService = new MessageService(conversation);
        const message = await messageService.storeMessage(messageProperties);
        if ( message.getUser().getID() !== App.getAuthenticatedUser().getID() ){
            await messageService.setMessage(message).notifyMessage();
        }
    }
}

export default MessageEventListener;
