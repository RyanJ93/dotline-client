'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import Repository from './Repository';

class MessageRepository extends Repository {
    /**
     * Creates a new message.
     *
     * @param {MessageProperties} properties
     *
     * @returns {Promise<Message>}
     *
     * @throws {IllegalArgumentException} If some invalid message properties are given.
     */
    async storeMessage(properties){
        if ( properties === null || typeof properties !== 'object' ){
            throw new IllegalArgumentException('Invalid message properties.');
        }
        const message = new Message();
        message.setAttachments(properties.attachments.map((attachment) => attachment.toJSON()));
        message.setIsSignatureValid(properties.isSignatureValid);
        message.setConversation(properties.conversation);
        message.setCreatedAt(properties.createdAt);
        message.setUpdatedAt(properties.updatedAt);
        message.setIsEdited(properties.isEdited);
        message.setContent(properties.content);
        message.setUser(properties.user);
        message.setType(properties.type);
        message.setRead(properties.read);
        message.setID(properties.id);
        await message.save();
        return message;
    }

    /**
     * Finds a message given its ID.
     *
     * @param {Conversation} conversation
     * @param {string} id
     *
     * @returns {Promise<Model>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid message ID is given.
     */
    async findMessage(conversation, id){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        if ( id === '' || typeof id !== 'string' ){
            throw new IllegalArgumentException('Invalid message ID.');
        }
        return await Message.find({ conversation: conversation.getID(), id: id });
    }

    /**
     * Returns stored messages.
     *
     * @param {Conversation} conversation
     * @param {number} [limit=50]
     * @param {?string} [endingID]
     * @param {?string} [startingID]
     *
     * @returns {Promise<Message[]>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid starting ID is given.
     * @throws {IllegalArgumentException} If an invalid ending ID is given.
     * @throws {IllegalArgumentException} If an invalid limit is given.
     */
    async findByConversation(conversation, limit, endingID, startingID){
        if ( startingID !== null && ( startingID === '' || typeof startingID !== 'string' ) ){
            throw new IllegalArgumentException('Invalid starting ID.');
        }
        if ( endingID !== null && ( endingID === '' || typeof endingID !== 'string' ) ){
            throw new IllegalArgumentException('Invalid ending ID.');
        }
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        if ( limit === null || isNaN(limit) || limit <= 0 ){
            throw new IllegalArgumentException('Invalid limit.');
        }
        let filters = { conversation: conversation.getID() };
        if ( typeof startingID === 'string' ){
            const message = await this.findMessage(conversation, startingID);
            if ( message ){
                filters.createdAt = { '<=': message.getCreatedAt() };
                filters.id = { '!=': message.getID() };
            }
        }else if ( typeof endingID === 'string' ){
            const message = await this.findMessage(conversation, endingID);
            if ( message ){
                filters.createdAt = { '<=': message.getCreatedAt() };
                filters.id = { '!=': message.getID() };
            }
        }
        return await Message.findAll(filters, {
            order: { createdAt: 'desc' },
            limit: limit
        });
    }

    /**
     * Returns the oldest stored message for the conversation defined.
     *
     * @param {Conversation} conversation
     *
     * @returns {Promise<Message>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     */
    async getOldestMessage(conversation){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        return await Message.find({
            conversation: conversation.getID()
        }, { order: { createdAt: 'asc' } });
    }

    /**
     * Returns the newest stored message for the conversation defined.
     *
     * @param {Conversation} conversation
     *
     * @returns {Promise<Message>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     */
    async getNewestMessage(conversation){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        return await Message.find({
            conversation: conversation.getID()
        }, { order: { createdAt: 'desc' } });
    }

    /**
     * Removes a message given its ID and conversation ID.
     *
     * @param {string} id
     * @param {string} conversationID
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation ID is given.
     * @throws {IllegalArgumentException} If an invalid message ID is given.
     */
    async deleteByID(id, conversationID){
        if ( conversationID === '' || typeof conversationID !== 'string' ){
            throw new IllegalArgumentException('Invalid conversation ID.');
        }
        if ( id === '' || typeof id !== 'string' ){
            throw new IllegalArgumentException('Invalid message ID.');
        }
        await Message.findAndDelete({ conversation: conversationID, id: id });
    }

    /**
     * Returns how many unread stored messages are contained in the conversation defined.
     *
     * @param {Conversation} conversation
     *
     * @returns {Promise<number>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     */
    async getUnreadMessageCount(conversation){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        return await Message.count({ conversation: conversation.getID(), read: false });
    }

    /**
     * Marks a given message as read.
     *
     * @param {Message} message
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid message is given.
     */
    async markMessageAsRead(message){
        if ( !( message instanceof Message ) ){
            throw new IllegalArgumentException('Invalid message.');
        }
        await message.setRead(true).save();
    }
}

export default MessageRepository;
