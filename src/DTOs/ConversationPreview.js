'use strict';

class ConversationPreview {// DEP
    #conversation;
    #lastMessage;

    constructor(properties){
        this.#conversation = properties.conversation;
        this.#lastMessage = properties.lastMessage;
    }

    getConversation(){
        return this.#conversation;
    }

    getLastMessage(){
        return this.#lastMessage;
    }

    toJSON(){
        return {
            conversation: this.#conversation,
            lastMessage: this.#lastMessage
        };
    }
}

export default ConversationPreview;
