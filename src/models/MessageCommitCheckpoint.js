'use strict';

import Conversation from './Conversation';
import Model from './Model';

class MessageCommitCheckpoint extends Model {
    constructor(){
        super();

        this._mapping = {
            keys: ['conversationID', 'type', 'date'],
            tableName: 'message_commit_checkpoints',
            fields: {
                conversation: { name: 'conversationID', relation: { model: Conversation, mapping: { conversationID: { foreign: 'id', method: 'getID' } }} },
                messageCommitID: { name: 'messageCommitID', type: 'timeuuid' },
                type: { name: 'type', type: 'string' },
                date: { name: 'date', type: 'date' },
            }
        };
    }

    setMessageCommitID(messageCommitID){
        this._attributes.messageCommitID = messageCommitID;
        return this;
    }

    getMessageCommitID(){
        return this._attributes?.messageCommitID ?? null;
    }

    setConversation(conversation){
        this._attributes.conversation = conversation;
        return this;
    }

    getConversation(){
        return this._attributes?.conversation ?? null;
    }

    setType(type){
        this._attributes.type = type;
        return this;
    }

    getType(){
        return this._attributes?.type ?? null;
    }

    setDate(date){
        this._attributes.date = date;
        return this;
    }

    getDate(){
        return this._attributes?.date ?? null;
    }
}

export default MessageCommitCheckpoint;
