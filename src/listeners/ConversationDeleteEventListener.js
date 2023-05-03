'use strict';

import ConversationService from '../services/ConversationService';
import EventListener from './EventListener';

class ConversationDeleteEventListener extends EventListener {
    async listen(conversationID){
        await new ConversationService().deleteConversationByID(conversationID);
    }
}

export default ConversationDeleteEventListener;
