'use strict';

import MessageType from '../enum/MessageType';
import Conversation from './Conversation';
import Model from './Model';
import User from './User';

class Message extends Model {
    constructor(){
        super();

        this._mapping = {
            keys: ['conversationID', 'id'],
            tableName: 'messages',
            fields: {
                conversation: { name: 'conversationID', relation: { model: Conversation, mapping: { conversationID: { foreign: 'id', method: 'getID' } }} },
                user: { name: 'userID', relation: { model: User, mapping: { userID: { foreign: 'id', method: 'getID' } }} },
                isSignatureValid: { name: 'isSignatureValid', type: 'boolean' },
                attachments: { name: 'attachments', type: 'array' },
                isEdited: { name: 'isEdited', type: 'boolean' },
                createdAt: { name: 'createdAt', type: 'date' },
                updatedAt: { name: 'updatedAt', type: 'date' },
                content: { name: 'content', type: 'string' },
                read: { name: 'read', type: 'boolean' },
                type: { name: 'type', type: 'string' },
                id: { name: 'id', type: 'timeuuid' }
            }
        };
    }

    getPreviewContent(){
        let previewContent = this.getContent();
        if ( this.getType() !== MessageType.TEXT ){
            switch ( this.getType() ){
                case MessageType.LOCATION: {
                    previewContent = 'Location';
                }break;
            }
        }else if ( previewContent === '' ){
            const count = this.getAttachments().length;
            if ( count > 0 ){
                previewContent = count + ' files';
            }
        }
        return previewContent;
    }

    setConversation(conversation){
        this._attributes.conversation = conversation;
        return this;
    }

    getConversation(){
        return this._attributes?.conversation ?? null;
    }

    setIsSignatureValid(isSignatureValid){
        this._attributes.isSignatureValid = isSignatureValid;
        return this;
    }

    getIsSignatureValid(){
        return this._attributes?.isSignatureValid ?? null;
    }

    setAttachments(attachments){
        this._attributes.attachments = attachments;
        return this;
    }

    getAttachments(){
        return this._attributes?.attachments ?? null;
    }

    setCreatedAt(createdAt){
        this._attributes.createdAt = createdAt;
        return this;
    }

    getCreatedAt(){
        return this._attributes?.createdAt ?? null;
    }

    setUpdatedAt(updatedAt){
        this._attributes.updatedAt = updatedAt;
        return this;
    }

    getUpdatedAt(){
        return this._attributes?.updatedAt ?? null;
    }

    setContent(content){
        this._attributes.content = content;
        return this;
    }

    getContent(){
        return this._attributes?.content ?? null;
    }

    setIsEdited(isEdited){
        this._attributes.isEdited = isEdited;
        return this;
    }

    getIsEdited(){
        return this._attributes?.isEdited ?? null;
    }

    setUser(user){
        this._attributes.user = user;
        return this;
    }

    getUserID(){
        return this._attributes?.userID ?? null;
    }

    getUser(){
        return this._attributes?.user ?? null;
    }

    setRead(read){
        this._attributes.read = read;
        return this;
    }

    getRead(){
        return this._attributes?.read ?? true;
    }

    setType(type){
        this._attributes.type = type;
        return this;
    }

    getType(){
        return this._attributes?.type ?? null;
    }

    setID(id){
        this._attributes.id = id;
        return this;
    }

    getID(){
        return this._attributes.id ?? null;
    }
}

export default Message;
