'use strict';

import AESEncryptionParameters from '../DTOs/AESEncryptionParameters';
import HMACSigningParameters from '../DTOs/HMACSigningParameters';
import NotificationService from './NotificationService';
import APIEndpoints from '../enum/APIEndpoints';
import CryptoUtils from '../utils/CryptoUtils';
import CryptoService from './CryptoService';
import Injector from '../facades/Injector';
import Request from '../facades/Request';
import UserService from './UserService';
import App from '../facades/App';
import Service from './Service';

class MessageService extends Service {
    #conversation = null;
    #messageRepository;
    #message = null;

    async #getConversationKeys(){
        const authenticatedUserID = App.getAuthenticatedUser().getID(), cryptoService = new CryptoService();
        let encryptionKey = null, signingKey = null, i = 0, memberList = this.#conversation.getMembers();
        while ( encryptionKey === null && i < memberList.length ){
            if ( memberList[i].getUser().getID() === authenticatedUserID ){
                encryptionKey = memberList[i].getEncryptionKey();
                signingKey = memberList[i].getSigningKey();
            }
            i++;
        }
        if ( encryptionKey === null || signingKey === null ){
            //
        }
        const decryptedEncryptionKey = await cryptoService.RSADecrypt(encryptionKey);
        const decryptedSigningKey = await cryptoService.RSADecrypt(signingKey);
        return { encryptionKey: decryptedEncryptionKey, signingKey: decryptedSigningKey };
    }

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

    async #storeMessageByProperties(properties){
        const { encryptionKey, signingKey } = await this.#getConversationKeys();
        const encryptionParameters = new AESEncryptionParameters(Object.assign({
            iv: properties.encryptionIV
        }, this.#conversation.getEncryptionParameters().toJSON()));
        const signingParameters = this.#conversation.getSigningParameters();
        const importedEncryptionKey = await CryptoUtils.importAESKey(encryptionKey, encryptionParameters);
        const importedSigningKey = await CryptoUtils.importHMACKey(signingKey, signingParameters);
        const content = await CryptoUtils.AESDecryptText(properties.content, importedEncryptionKey, encryptionParameters);
        const isSignatureValid = await CryptoUtils.HMACVerify(content, properties.signature, importedSigningKey);
        const createdAt = new Date(properties.createdAt), updatedAt = new Date(properties.updatedAt);
        return await this.#messageRepository.storeMessage({
            isSignatureValid: isSignatureValid,
            user: ( properties.user ?? null ),
            conversation: this.#conversation,
            isEdited: properties.isEdited,
            type: properties.type,
            createdAt: createdAt,
            updatedAt: updatedAt,
            id: properties.id,
            content: content
        });
    }

    async #assignUsersToMessageList(messageList){
        const userIDList = new Set(), userService = new UserService();
        messageList.forEach((message) => {
            if ( typeof message.userID === 'string' ){
                userIDList.add(message.userID);
            }
            message.user = null;
        });
        if ( userIDList.size > 0 ){
            const userList = await userService.getUsersByIDList(Array.from(userIDList));
            messageList.forEach((message) => {
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

    constructor(conversation = null, message = null){
        super();

        this.#messageRepository = Injector.inject('MessageRepository');
        this.setConversation(conversation);
        this.setMessage(message);
    }

    setConversation(conversation){
        this.#conversation = conversation;
        return this;
    }

    getConversation(){
        return this.#conversation;
    }

    setMessage(message){
        this.#message = message;
        return this;
    }

    getMessage(){
        return this.#message;
    }

    async storeMessage(messageProperties){
        await this.#assignUsersToMessageList([messageProperties]);
        this.#message = await this.#storeMessageByProperties(messageProperties);
        this._eventBroker.emit('messageAdded', this.#message);
        return this.#message;
    }

    async replaceMessage(messageProperties){
        await this.#assignUsersToMessageList([messageProperties]);
        this.#message = await this.#storeMessageByProperties(messageProperties);
        this._eventBroker.emit('messageEdit', this.#message);
        return this.#message;
    }

    async deleteMessageByID(messageID, conversationID){
        await this.#messageRepository.deleteByID(messageID, conversationID);
        this._eventBroker.emit('messageDelete', messageID, conversationID);
    }

    async fetchMessages(limit = 250, endingID = null, startingID = null){
        let url = APIEndpoints.MESSAGE_LIST.replace(':conversationID', this.#conversation.getID());
        const response = await Request.get(url, { startingID: startingID, endingID: endingID, limit: limit });
        const messageList = await Promise.all(response.messageList.map(async (messageProperties) => {
            await this.#assignUsersToMessageList([messageProperties]);
            const message = await this.#storeMessageByProperties(messageProperties);
            this._eventBroker.emit('messageAdded', message);
        }));
        this._eventBroker.emit('loadedMessages', this.#conversation, messageList);
        return messageList;
    }

    async send(content, type, attachments = []){
        const url = APIEndpoints.MESSAGE_SEND.replace(':conversationID', this.#conversation.getID());
        const hmacSigningParameters = new HMACSigningParameters({ hashName: 'SHA-512' });
        const aesEncryptionParameters = this.#generateAESEncryptionParameters();
        const { encryptionKey, signingKey } = await this.#getConversationKeys();
        const importedEncryptionKey = await CryptoUtils.importAESKey(encryptionKey, aesEncryptionParameters);
        const importedSigningKey = await CryptoUtils.importHMACKey(signingKey, hmacSigningParameters);
        const encryptedContent = await CryptoUtils.AESEncryptText(content, importedEncryptionKey, aesEncryptionParameters);
        const signature = await CryptoUtils.HMACSign(content, importedSigningKey, hmacSigningParameters);
        const response = await Request.post(url, {
            encryptionIV: aesEncryptionParameters.getIV(),
            content: encryptedContent,
            signature: signature,
            type: type
        });
        return await this.storeMessage(response.message);
    }

    async edit(content){
        let url = APIEndpoints.MESSAGE_EDIT.replace(':conversationID', this.#conversation.getID());
        const { encryptionKey, signingKey } = await this.#getConversationKeys();
        const encryptionIV = crypto.getRandomValues(new Uint8Array(12));
        const encodedEncryptionIV = btoa(String.fromCharCode(...new Uint8Array(encryptionIV)));
        const aesEncryptionParameters = new AESEncryptionParameters(Object.assign({
            iv: encodedEncryptionIV
        }, this.#conversation.getEncryptionParameters().toJSON()));
        const signingParameters = this.#conversation.getSigningParameters();
        const importedEncryptionKey = await CryptoUtils.importAESKey(encryptionKey, aesEncryptionParameters);
        const importedSigningKey = await CryptoUtils.importHMACKey(signingKey, signingParameters);
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

    async delete(deleteForEveryone){
        let url = APIEndpoints.MESSAGE_DELETE.replace(':conversationID', this.#conversation.getID());
        await Request.delete(url.replace(':messageID', this.#message.getID()), {
            deleteForEveryone: ( deleteForEveryone === true ? '1' : '0' )
        }, true);
        await this.#messageRepository.deleteByID(this.#message.getID(), this.#conversation.getID());
        this._eventBroker.emit('messageDelete', this.#message.getID(), this.#conversation.getID());
    }

    async getMessages(page = 1){
        return await this.#messageRepository.findByConversation(this.#conversation, page);
    }

    async getOldestMessage(){
        return await this.#messageRepository.getOldestMessage(this.#conversation);
    }

    async getNewestMessage(){
        return await this.#messageRepository.getNewestMessage(this.#conversation);
    }

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
}

export default MessageService;
