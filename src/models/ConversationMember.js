'use strict';

import Conversation from './Conversation';
import Model from './Model';
import User from './User';

class ConversationMember extends Model {
    constructor(){
        super();

        this._mapping = {
            keys: ['conversationID', 'userID'],
            tableName: 'conversationMembers',
            fields: {
                conversation: { name: 'conversationID', relation: { model: Conversation, mapping: { conversationID: { foreign: 'id', method: 'getID' } }} },
                user: { name: 'userID', relation: { model: User, mapping: { userID: { foreign: 'id', method: 'getID' } }} },
                encryptionKey: { name: 'encryption_key', type: 'string' }
            }
        };
    }

    setEncryptionKey(encryptionKey){
        this._attributes.encryptionKey = encryptionKey;
        return this;
    }

    getEncryptionKey(){
        return this._attributes.encryptionKey ?? null;
    }

    setConversation(conversation){
        this._attributes.conversation = conversation;
        return this;
    }

    getConversation(){
        return this._attributes.conversation ?? null;
    }

    setUser(user){
        this._attributes.user = user;
        return this;
    }

    getUser(){
        return this._attributes.user ?? null;
    }
}

export default ConversationMember;
