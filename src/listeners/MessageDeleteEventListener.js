'use strict';

import MessageService from '../services/MessageService';
import EventListener from './EventListener';

class MessageDeleteEventListener extends EventListener {
    async listen(messageID, conversationID){
        await new MessageService().deleteMessageByID(messageID, conversationID);
    }
}

export default MessageDeleteEventListener;
