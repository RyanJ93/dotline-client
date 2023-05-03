'use strict';

import ConversationService from '../services/ConversationService';
import MessageService from '../services/MessageService';
import EventListener from './EventListener';

class MessageEditEventListener extends EventListener {
    async listen(messageProperties){
        const conversation = await new ConversationService().assertConversation(messageProperties.conversationID);
        await new MessageService(conversation).replaceMessage(messageProperties);
    }
}

export default MessageEditEventListener;
