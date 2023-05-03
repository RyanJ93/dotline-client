'use strict';

import Message from '../models/Message';
import Repository from './Repository';

class MessageRepository extends Repository {
    async storeMessage(properties){
        const message = new Message();
        message.setIsSignatureValid(properties.isSignatureValid);
        message.setConversation(properties.conversation);
        message.setCreatedAt(properties.createdAt);
        message.setUpdatedAt(properties.updatedAt);
        message.setIsEdited(properties.isEdited);
        message.setContent(properties.content);
        message.setUser(properties.user);
        message.setType(properties.type);
        message.setID(properties.id);
        await message.save();
        return message;
    }

    async findByConversation(conversation){
        return await Message.findAll({
            conversation: conversation.getID()
        }, {
            order: { createdAt: 'desc' }
        });
    }

    async getOldestMessage(conversation){
        return await Message.find({
            conversation: conversation.getID()
        }, {
            order: { createdAt: 'asc' }
        });
    }

    async getNewestMessage(conversation){
        return await Message.find({
            conversation: conversation.getID()
        }, {
            order: { createdAt: 'desc' }
        });
    }

    async deleteByID(messageID, conversationID){
        await Message.findAndDelete({
            conversation: conversationID,
            message: messageID
        });
    }
}

export default MessageRepository;
