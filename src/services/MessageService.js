'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import AESEncryptionParameters from '../DTOs/AESEncryptionParameters';
import HMACSigningParameters from '../DTOs/HMACSigningParameters';
import ConversationKeys from '../DTOs/ConversationKeys';
import NotificationService from './NotificationService';
import Conversation from '../models/Conversation';
import APIEndpoints from '../enum/APIEndpoints';
import CryptoUtils from '../utils/CryptoUtils';
import Injector from '../facades/Injector';
import Request from '../facades/Request';
import UserService from './UserService';
import Message from '../models/Message';
import App from '../facades/App';
import Service from './Service';

/**
 * @typedef MessageProperties
 *
 * @property {Conversation} conversation
 * @property {?boolean} isSignatureValid
 * @property {string} encryptionIV
 * @property {boolean} isEdited
 * @property {string} signature
 * @property {string} content
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {?string} userID
 * @property {boolean} read
 * @property {string} type
 * @property {User} user
 * @property {string} id
 */

class MessageService extends Service {
    /**
     * @type {?Conversation}
     */
    #conversation = null;

    /**
     * @type {MessageRepository}
     */
    #messageRepository;

    /**
     * @type {?Message}
     */
    #message = null;

    /**
     * Extracts the authenticate user's keys from the conversation defined.
     *
     * @returns {Promise<?ConversationKeys>}
     */
    async #getConversationKeys(){
        let member = null, i = 0, memberList = this.#conversation.getMembers();
        const authenticatedUserID = App.getAuthenticatedUser().getID();
        // Lookup the authenticated user within the member list.
        while ( member === null && i < memberList.length ){
            if ( memberList[i].getUser().getID() === authenticatedUserID ){
                member = memberList[i];
            }
            i++;
        }
        if ( member === null ){
            console.error('No keys found for conversation ID ' + this.#conversation.getID());
            return null;
        }
        return await ConversationKeys.extractFromMember(member);
    }

    /**
     * Generates some new encryption parameters for AES encryption/decryption.
     *
     * @returns {AESEncryptionParameters}
     */
    #generateAESEncryptionParameters(){
        const encryptionParameters = this.#conversation.getEncryptionParameters();
        const encryptionIV = crypto.getRandomValues(new Uint8Array(12));
        const enc = btoa(String.fromCharCode(...new Uint8Array(encryptionIV)));
        return new AESEncryptionParameters({
            keyLength: encryptionParameters.getKeyLength(),
            mode: encryptionParameters.getMode(),
            iv: enc
        });
    }

    /**
     * Stores a message given its properties.
     *
     * @param {MessageProperties} properties
     *
     * @returns {Promise<Message>}
     */
    async #storeMessageByProperties(properties){
        const encryptionParameters = new AESEncryptionParameters(Object.assign({
            iv: properties.encryptionIV
        }, this.#conversation.getEncryptionParameters().toJSON()));
        const signingParameters = this.#conversation.getSigningParameters(), conversationKeys = await this.#getConversationKeys();
        const importedEncryptionKey = await CryptoUtils.importAESKey(conversationKeys.getEncryptionKey(), encryptionParameters);
        const content = await CryptoUtils.AESDecryptText(properties.content, importedEncryptionKey, encryptionParameters);
        const importedSigningKey = await CryptoUtils.importHMACKey(conversationKeys.getSigningKey(), signingParameters);
        const isSignatureValid = await CryptoUtils.HMACVerify(content, properties.signature, importedSigningKey);
        const createdAt = new Date(properties.createdAt), updatedAt = new Date(properties.updatedAt);
        return await this.#messageRepository.storeMessage({
            isSignatureValid: isSignatureValid,
            user: ( properties.user ?? null ),
            conversation: this.#conversation,
            isEdited: properties.isEdited,
            read: properties.read,
            type: properties.type,
            createdAt: createdAt,
            updatedAt: updatedAt,
            id: properties.id,
            content: content
        });
    }

    /**
     * Assigns users to every message in a given list.
     *
     * @param {MessageProperties[]} messagePropertiesList
     *
     * @returns {Promise<void>}
     */
    async #assignUsersToMessageList(messagePropertiesList){
        const userIDList = new Set(), userService = new UserService();
        messagePropertiesList.forEach((message) => {
            if ( typeof message.userID === 'string' ){
                userIDList.add(message.userID);
            }
            message.user = null;
        });
        if ( userIDList.size > 0 ){
            const userList = await userService.getUsersByIDList(Array.from(userIDList));
            messagePropertiesList.forEach((message) => {
                let i = 0;
                while ( message.user === null && i < userList.length ){
                    if ( userList[i].getID() === message.userID ){
                        message.user = userList[i];
                    }
                    i++;
                }
            });
        }
    }

    /**
     * The class constructor.
     *
     * @param {?Conversation} conversation
     * @param {?Message} message
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     */
    constructor(conversation = null, message = null){
        super();

        this.#messageRepository = Injector.inject('MessageRepository');
        this.setConversation(conversation);
        this.setMessage(message);
    }

    /**
     * Sets the conversation.
     *
     * @param {Conversation} conversation
     *
     * @returns {MessageService}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     */
    setConversation(conversation){
        if ( conversation !== null && !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        this.#conversation = conversation;
        return this;
    }

    /**
     * Returns the conversation.
     *
     * @returns {?Conversation}
     */
    getConversation(){
        return this.#conversation;
    }

    /**
     * Sets the message.
     *
     * @param {Message} message
     *
     * @returns {MessageService}
     *
     * @throws {IllegalArgumentException} If an invalid message is given.
     */
    setMessage(message){
        if ( message !== null && !( message instanceof Message ) ){
            throw new IllegalArgumentException('Invalid message.');
        }
        this.#message = message;
        return this;
    }

    /**
     * Returns the message.
     *
     * @returns {?Message}
     */
    getMessage(){
        return this.#message;
    }

    /**
     * Stores a message given its properties.
     *
     * @param {MessageProperties} messageProperties
     *
     * @returns {Promise<?Message>}
     *
     * @throws {IllegalArgumentException} If an invalid message properties object is given.
     */
    async storeMessage(messageProperties){
        if ( messageProperties === null || typeof messageProperties !== 'object' ){
            throw new IllegalArgumentException('Invalid message properties.');
        }
        await this.#assignUsersToMessageList([messageProperties]);
        this.#message = await this.#storeMessageByProperties(messageProperties);
        this._eventBroker.emit('messageAdded', this.#message);
        return this.#message;
    }

    /**
     * Replaces a message given its properties.
     *
     * @param {MessageProperties} messageProperties
     *
     * @returns {Promise<?Message>}
     *
     * @throws {IllegalArgumentException} If an invalid message properties object is given.
     */
    async replaceMessage(messageProperties){
        if ( messageProperties === null || typeof messageProperties !== 'object' ){
            throw new IllegalArgumentException('Invalid message properties.');
        }
        await this.#assignUsersToMessageList([messageProperties]);
        this.#message = await this.#storeMessageByProperties(messageProperties);
        this._eventBroker.emit('messageEdit', this.#message);
        return this.#message;
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
    async deleteMessageByID(id, conversationID){
        if ( conversationID === '' || typeof conversationID !== 'string' ){
            throw new IllegalArgumentException('Invalid conversation ID.');
        }
        if ( id === '' || typeof id !== 'string' ){
            throw new IllegalArgumentException('Invalid message ID.');
        }
        await this.#messageRepository.deleteByID(id, conversationID);
        this._eventBroker.emit('messageDelete', id, conversationID);
    }

    /**
     * Fetches and then stores messages from the server.
     *
     * @param {number} [limit=250]
     * @param {?string} [endingID]
     * @param {?string} [startingID]
     *
     * @returns {Promise<Message[]>}
     */
    async fetchMessages(limit = 250, endingID = null, startingID = null){
        let url = APIEndpoints.MESSAGE_LIST.replace(':conversationID', this.#conversation.getID());
        const response = await Request.get(url, { startingID: startingID, endingID: endingID, limit: limit });
        const messageList = await Promise.all(response.messageList.map(async (messageProperties) => {
            await this.#assignUsersToMessageList([messageProperties]);
            return await this.#storeMessageByProperties(messageProperties);
        }));
        this._eventBroker.emit('loadedMessages', this.#conversation, messageList);
        return messageList;
    }

    /**
     * Sends a message.
     *
     * @param {string} content
     * @param {string} type
     * @param {*[]} attachments
     *
     * @returns {Promise<?Message>}
     *
     * @throws {IllegalArgumentException} If an invalid attachments array is given.
     * @throws {IllegalArgumentException} If an invalid content is given.
     * @throws {IllegalArgumentException} If an invalid type is given.
     */
    async send(content, type, attachments = []){
        if ( content === '' || typeof content !== 'string' ){
            throw new IllegalArgumentException('Invalid content.');
        }
        if ( type === '' || typeof type !== 'string' ){
            throw new IllegalArgumentException('Invalid type.');
        }
        if ( !Array.isArray(attachments) ){
            throw new IllegalArgumentException('Invalid attachments.');
        }
        const url = APIEndpoints.MESSAGE_SEND.replace(':conversationID', this.#conversation.getID());
        const hmacSigningParameters = new HMACSigningParameters({ hashName: 'SHA-512' });
        const aesEncryptionParameters = this.#generateAESEncryptionParameters(), conversationKeys = await this.#getConversationKeys();
        const importedEncryptionKey = await CryptoUtils.importAESKey(conversationKeys.getEncryptionKey(), aesEncryptionParameters);
        const importedSigningKey = await CryptoUtils.importHMACKey(conversationKeys.getSigningKey(), hmacSigningParameters);
        const encryptedContent = await CryptoUtils.AESEncryptText(content, importedEncryptionKey, aesEncryptionParameters);
        const signature = await CryptoUtils.HMACSign(content, importedSigningKey, hmacSigningParameters);
        const response = await Request.post(url, {
            encryptionIV: aesEncryptionParameters.getIV(),
            content: encryptedContent,
            signature: signature,
            type: type
        });
        return this.#message = await this.storeMessage(response.message);
    }

    /**
     * Edits the defined message.
     *
     * @param {string} content
     *
     * @returns {Promise<?Message>}
     *
     * @throws {IllegalArgumentException} If an invalid content is given.
     */
    async edit(content){
        if ( content === '' || typeof content !== 'string' ){
            throw new IllegalArgumentException('Invalid content.');
        }
        let url = APIEndpoints.MESSAGE_EDIT.replace(':conversationID', this.#conversation.getID());
        const encryptionIV = crypto.getRandomValues(new Uint8Array(12));
        const encodedEncryptionIV = btoa(String.fromCharCode(...new Uint8Array(encryptionIV)));
        const aesEncryptionParameters = new AESEncryptionParameters(Object.assign({
            iv: encodedEncryptionIV
        }, this.#conversation.getEncryptionParameters().toJSON()));
        const signingParameters = this.#conversation.getSigningParameters(), conversationKeys = await this.#getConversationKeys();
        const importedEncryptionKey = await CryptoUtils.importAESKey(conversationKeys.getEncryptionKey(), aesEncryptionParameters);
        const importedSigningKey = await CryptoUtils.importHMACKey(conversationKeys.getSigningKey(), signingParameters);
        const encryptedContent = await CryptoUtils.AESEncryptText(content, importedEncryptionKey, aesEncryptionParameters);
        const signature = await CryptoUtils.HMACSign(content, importedSigningKey, signingParameters);
        const response = await Request.patch(url.replace(':messageID', this.#message.getID()), {
            encryptionIV: aesEncryptionParameters.getIV(),
            content: encryptedContent,
            signature: signature
        });
        await this.#assignUsersToMessageList([response.message]);
        this.#message = await this.#storeMessageByProperties(response.message);
        this._eventBroker.emit('messageEdit', this.#message);
        return this.#message;
    }

    /**
     * Deletes the defined message.
     *
     * @param {boolean} deleteForEveryone
     *
     * @returns {Promise<void>}
     */
    async delete(deleteForEveryone){
        let url = APIEndpoints.MESSAGE_DELETE.replace(':conversationID', this.#conversation.getID());
        await Request.delete(url.replace(':messageID', this.#message.getID()), {
            deleteForEveryone: ( deleteForEveryone === true ? '1' : '0' )
        }, true);
        await this.#messageRepository.deleteByID(this.#message.getID(), this.#conversation.getID());
        this._eventBroker.emit('messageDelete', this.#message.getID(), this.#conversation.getID());
    }

    /**
     * Returns stored messages.
     *
     * @param {number} [limit=50]
     * @param {?string} [endingID]
     * @param {?string} [startingID]
     *
     * @returns {Promise<Message[]>}
     *
     * @throws {IllegalArgumentException} If an invalid starting ID is given.
     * @throws {IllegalArgumentException} If an invalid ending ID is given.
     * @throws {IllegalArgumentException} If an invalid limit is given.
     */
    async getMessages(limit = 50, endingID = null, startingID = null){
        if ( startingID !== null && ( startingID === '' || typeof startingID !== 'string' ) ){
            throw new IllegalArgumentException('Invalid starting ID.');
        }
        if ( endingID !== null && ( endingID === '' || typeof endingID !== 'string' ) ){
            throw new IllegalArgumentException('Invalid ending ID.');
        }
        if ( limit === null || isNaN(limit) || limit <= 0 ){
            throw new IllegalArgumentException('Invalid limit.');
        }
        return await this.#messageRepository.findByConversation(this.#conversation, limit, endingID, startingID);
    }

    /**
     * Returns the oldest stored message for the conversation defined.
     *
     * @returns {Promise<Message>}
     */
    async getOldestMessage(){
        return await this.#messageRepository.getOldestMessage(this.#conversation);
    }

    /**
     * Returns the newest stored message for the conversation defined.
     *
     * @returns {Promise<Message>}
     */
    async getNewestMessage(){
        return await this.#messageRepository.getNewestMessage(this.#conversation);
    }

    /**
     * Returns how many unread stored messages are contained in the conversation defined.
     *
     * @returns {Promise<number>}
     */
    async getUnreadMessageCount(){
        return await this.#messageRepository.getUnreadMessageCount(this.#conversation);
    }

    /**
     * Marks all the stored messages contained in the conversation defined as read (locally).
     *
     * @returns {Promise<void>}
     */
    async markMessagesAsRead(){
        const messageList = await this.#messageRepository.findByConversation(this.#conversation);
        await Promise.all(messageList.map(async (message) => {
            await this.#messageRepository.markMessageAsRead(message);
            this._eventBroker.emit('messageEdit', message);
        }));
    }

    /**
     * Notifies the user about teh defined message.
     *
     * @returns {Promise<void>}
     */
    async notifyMessage(){
        if ( !document.hasFocus() ){
            const title = this.#message.getUser().getUsername();
            let text = this.#message.getContent();
            if ( text.length > 100 ){
                text = text.slice(0, 100) + '...';
            }
            await new NotificationService().sendNotification(title, text);
        }
    }

    /**
     * Marks the defined message as read.
     *
     * @returns {Promise<void>}
     */
    async markAsRead(){
        let url = APIEndpoints.MESSAGE_MARK_AS_READ.replace(':conversationID', this.#conversation.getID());
        await Request.patch(url.replace(':messageID', this.#message.getID()));
        await this.#messageRepository.markMessageAsRead(this.#message);
        this._eventBroker.emit('messageEdit', this.#message);
    }
}

export default MessageService;
