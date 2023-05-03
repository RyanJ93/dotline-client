'use strict';

import ConversationMemberPlaceholder from '../DTOs/ConversationMemberPlaceholder';
import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import HMACSigningParameters from '../DTOs/HMACSigningParameters';
import AESStaticParameters from '../DTOs/AESStaticParameters';
import ConversationMember from '../DTOs/ConversationMember';
import Conversation from '../models/Conversation';
import APIEndpoints from '../enum/APIEndpoints';
import CryptoUtils from '../utils/CryptoUtils';
import Injector from '../facades/Injector';
import Request from '../facades/Request';
import UserService from './UserService';
import Service from './Service';
import conversation from '../models/Conversation';

class ConversationService extends Service {
    #conversationRepository;
    #webSocketClient;
    #conversation;

    async #buildConversationMemberPlaceholder(user, exportedEncryptionKey, exportedSigningKey){
        const RSAPublicKey = await CryptoUtils.importRSAPublicKey(user.getRSAPublicKey());
        const serializedEncryptionKey = JSON.stringify(exportedEncryptionKey);
        const serializedSigningKey = JSON.stringify(exportedSigningKey);
        const encryptionKey = await CryptoUtils.RSAEncryptText(serializedEncryptionKey, RSAPublicKey);
        const signingKey = await CryptoUtils.RSAEncryptText(serializedSigningKey, RSAPublicKey);
        return new ConversationMemberPlaceholder({
            encryptionKey: encryptionKey,
            signingKey: signingKey,
            userID: user.getID()
        });
    }

    async #assignUsersToConversation(conversation){
        const userIDList = new Set(), userService = new UserService();
        conversation.getMembers().forEach((member) => userIDList.add(member.userID));
        if ( userIDList.size === 0 ){
            conversation.getMembers().forEach((member) => member.user = null);
        }else{
            const userList = await userService.getUsersByIDList(Array.from(userIDList));
            const memberList = conversation.getMembers();
            memberList.forEach((member, index) => {
                member.user = null;
                let i = 0;
                while ( member.user === null && i < userList.length ){
                    if ( userList[i].getID() === member.userID ){
                        member.user = userList[i];
                    }
                    i++;
                }
                memberList[index] = new ConversationMember(member);
            });
        }
    }

    async #storeSingleConversation(conversationProperties){
        const { id, encryptionParameters, signingParameters, name } = conversationProperties, members = [], userList = [];
        const hmacSigningParameters = new HMACSigningParameters(signingParameters);
        const aesStaticParameters = new AESStaticParameters(encryptionParameters);
        conversationProperties.members.forEach((member) => {
            userList.push(member.user);
            members.push({
                encryptionKey: member.encryptionKey,
                signingKey: member.signingKey,
                userID: member.user.id
            });
        });
        const conversation = await this.#conversationRepository.store(id, aesStaticParameters, hmacSigningParameters, members, name);
        await Promise.all(userList.map((user) => new UserService().storeUser(user)));
        await this.#assignUsersToConversation(conversation);
        this._eventBroker.emit('conversationAdded', conversation);
        return conversation;
    }

    constructor(conversation = null){
        super();

        this.#conversationRepository = Injector.inject('ConversationRepository');
        this.#webSocketClient = Injector.inject('WebSocketClient');
        this.setConversation(conversation);
    }

    setConversation(conversation){
        if ( conversation !== null && !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation instance.');
        }
        this.#conversation = conversation;
        return this;
    }

    getConversation(){
        return this.#conversation;
    }

    async storeConversation(properties){
        this.#conversation = await this.#storeSingleConversation(properties);
        return this.#conversation;
    }

    async fetchConversations(){
        const response = await Request.get(APIEndpoints.CONVERSATION_LIST, null, true);
        const conversationList = await Promise.all(response.conversationList.map((conversationProperties) => {
            return this.#storeSingleConversation(conversationProperties);
        }));
        this._eventBroker.emit('conversationLoaded', conversationList);
        return conversationList;
    }

    async getConversations(){
        const conversationList = await this.#conversationRepository.getAll();
        await Promise.all(conversationList.map((conversation) => {
            this.#assignUsersToConversation(conversation);
        }));
        return conversationList;
    }

    async getConversationByID(conversationID){
        this.#conversation = await this.#conversationRepository.getByID(conversationID);
        if ( this.#conversation !== null ){
            await this.#assignUsersToConversation(this.#conversation);
        }
        return this.#conversation;
    }

    async fetchConversationByID(conversationID){
        const url = APIEndpoints.CONVERSATION_GET.replace(':conversationID', conversationID);
        const response = await Request.get(url, null, true);
        this.#conversation = await this.#storeSingleConversation(response.conversation);
        this._eventBroker.emit('conversationAdded', this.#conversation);
        return this.#conversation;
    }

    async assertConversation(conversationID){
        this.#conversation = await this.getConversationByID(conversationID);
        if ( this.#conversation === null ){
            await this.fetchConversationByID(conversationID);
        }
        return this.#conversation;
    }

    async getDMConversationByMembers(senderUserID, recipientUserID){
        let conversationList = await this.#conversationRepository.getAll(), DMConversation = null, i = 0;
        while ( DMConversation === null && i < conversationList.length ){
            const members = conversationList[i].getMembers();
            if ( members.length === 2 ){
                if ( members[0].userID === recipientUserID || members[1].userID === recipientUserID ){
                    if ( members[0].userID === senderUserID || members[1].userID === senderUserID ){
                        DMConversation = conversationList[i];
                    }
                }
            }
            i++;
        }
        return DMConversation;
    }

    /**
     * Creates a new conversation.
     *
     * @param {User} userList
     * @param {string} conversationName
     *
     * @returns {Promise<Conversation>}
     */
    async createConversation(userList, conversationName = null){
        const aesStaticParameters = new AESStaticParameters({ keyLength: 256, mode: 'GCM' });
        const hmacSigningParameters = new HMACSigningParameters({ hashName: 'SHA-512' });
        const signingKey = await CryptoUtils.generateHMACKey(hmacSigningParameters);
        const encryptionKey = await CryptoUtils.generateAESKey(aesStaticParameters);
        const exportedEncryptionKey = await CryptoUtils.exportKey(encryptionKey);
        const exportedSigningKey = await CryptoUtils.exportKey(signingKey);
        const conversationMemberPlaceholderList = await Promise.all(userList.map((user) => {
            return this.#buildConversationMemberPlaceholder(user, exportedEncryptionKey, exportedSigningKey);
        }));
        const response = await Request.post(APIEndpoints.CONVERSATION_CREATE, {
            conversationMemberPlaceholderList: conversationMemberPlaceholderList,
            encryptionKeyLength: aesStaticParameters.getKeyLength(),
            signingHashName: hmacSigningParameters.getHashName(),
            encryptionMode: aesStaticParameters.getMode(),
            name: conversationName
        }, true);
        this.#conversation = await this.#storeSingleConversation(response.conversation);
        return this.#conversation;
    }

    async notifyTyping(){
        await this.#webSocketClient.send({
            payload: { conversationID: this.#conversation.getID() },
            action: 'setTypingStatus'
        });
    }

    async deleteConversationByID(conversationID){
        await this.#conversationRepository.deleteByID(conversationID);
        this._eventBroker.emit('conversationDelete', conversationID);
    }

    async delete(deleteForEveryone){
        const url = APIEndpoints.CONVERSATION_DELETE.replace(':conversationID', this.#conversation.getID());
        await Request.delete(url, { deleteForEveryone: ( deleteForEveryone === true ? '1' : '0' ) }, true);
        await this.#conversationRepository.delete(this.#conversation);
        this._eventBroker.emit('conversationDelete', this.#conversation.getID());
    }
}

export default ConversationService;
