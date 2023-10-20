'use strict';

import ConversationMemberPlaceholder from '../DTOs/ConversationMemberPlaceholder';
import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import HMACSigningParameters from '../DTOs/HMACSigningParameters';
import AESStaticParameters from '../DTOs/AESStaticParameters';
import ConversationMember from '../DTOs/ConversationMember';
import ConversationKeys from '../DTOs/ConversationKeys';
import Conversation from '../models/Conversation';
import APIEndpoints from '../enum/APIEndpoints';
import CryptoUtils from '../utils/CryptoUtils';
import MessageService from './MessageService';
import Injector from '../facades/Injector';
import Request from '../facades/Request';
import UserService from './UserService';
import App from '../facades/App';
import Service from './Service';
import UserOnlineStatusService from './UserOnlineStatusService';

/**
 * @typedef ConversationProperties
 *
 * @property {AESStaticParametersProperties} encryptionParameters
 * @property {HMACSigningParametersProperties} signingParameters
 * @property {ConversationMemberProperties[]} members
 * @property {?string} name
 * @property {string} id
 */

class ConversationService extends Service {
    /**
     * @type {ConversationRepository}
     */
    #conversationRepository;

    /**
     * @type {WebSocketClient}
     */
    #webSocketClient;

    /**
     * @type {?Conversation}
     */
    #conversation = null;

    /**
     * Builds a conversation member placeholder instance.
     *
     * @param {User} user
     * @param {string} exportedEncryptionKey
     * @param {string} exportedSigningKey
     *
     * @returns {Promise<ConversationMemberPlaceholder>}
     */
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

    /**
     * Looks up and assigns user model instances to each conversation member.
     *
     * @param {Conversation} conversation
     *
     * @returns {Promise<void>}
     */
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

    /**
     * Stores a conversation locally given its properties.
     *
     * @param {ConversationProperties} conversationProperties
     *
     * @returns {Promise<Conversation>}
     */
    async #storeSingleConversation(conversationProperties){
        const { id, encryptionParameters, signingParameters, name } = conversationProperties, members = [], userList = [];
        const hmacSigningParameters = new HMACSigningParameters(signingParameters);
        const aesStaticParameters = new AESStaticParameters(encryptionParameters);
        const userOnlineStatusService = new UserOnlineStatusService();
        conversationProperties.members.forEach((member) => {
            userOnlineStatusService.subscribeToUserOnlineStatusChange(member.user.id);
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

    /**
     * The class constructor.
     *
     * @param {?Conversation} [conversation]
     */
    constructor(conversation = null){
        super();

        this.#conversationRepository = Injector.inject('ConversationRepository');
        this.#webSocketClient = Injector.inject('WebSocketClient');
        this.setConversation(conversation);
    }

    /**
     * Sets the conversation.
     *
     * @param {?Conversation} conversation
     *
     * @returns {ConversationService}
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
     * Fetches and stores conversations locally.
     *
     * @returns {Promise<Conversation[]>}
     */
    async fetchConversations(){
        const response = await Request.get(APIEndpoints.CONVERSATION_LIST, null, true);
        const conversationList = await Promise.all(response.conversationList.map((conversationProperties) => {
            return this.#storeSingleConversation(conversationProperties);
        }));
        this._eventBroker.emit('conversationLoaded', conversationList);
        return conversationList;
    }

    /**
     * Returns all the locally stored conversations.
     *
     * @returns {Promise<Conversation[]>}
     */
    async getConversations(){
        const conversationList = await this.#conversationRepository.getAll();
        await Promise.all(conversationList.map((conversation) => {
            this.#assignUsersToConversation(conversation);
        }));
        return conversationList;
    }

    /**
     * Returns a conversation given its ID.
     *
     * @param {string} conversationID
     *
     * @returns {Promise<?Conversation>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation ID is given.
     */
    async getConversationByID(conversationID){
        if ( conversationID === '' || typeof conversationID !== 'string' ){
            throw new IllegalArgumentException('Invalid conversation ID.');
        }
        this.#conversation = await this.#conversationRepository.getByID(conversationID);
        if ( this.#conversation !== null ){
            await this.#assignUsersToConversation(this.#conversation);
        }
        return this.#conversation;
    }

    /**
     * Fetches and then stores a conversation given its ID.
     *
     * @param {string} conversationID
     *
     * @returns {Promise<?Conversation>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation ID is given.
     */
    async fetchConversationByID(conversationID){
        if ( conversationID === '' || typeof conversationID !== 'string' ){
            throw new IllegalArgumentException('Invalid conversation ID.');
        }
        const url = APIEndpoints.CONVERSATION_GET.replace(':conversationID', conversationID);
        const response = await Request.get(url, null, true);
        this.#conversation = await this.#storeSingleConversation(response.conversation);
        return this.#conversation;
    }

    /**
     * Returns a conversation given its ID, if not stored locally it will be fetched from the server.
     *
     * @param {string} conversationID
     *
     * @returns {Promise<?Conversation>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation ID is given.
     */
    async assertConversation(conversationID){
        if ( conversationID === '' || typeof conversationID !== 'string' ){
            throw new IllegalArgumentException('Invalid conversation ID.');
        }
        this.#conversation = await this.getConversationByID(conversationID);
        if ( this.#conversation === null ){
            await this.fetchConversationByID(conversationID);
        }
        return this.#conversation;
    }

    /**
     * Returns the direct message conversation where the given members are involved in.
     *
     * @param {string} senderUserID
     * @param {string} recipientUserID
     *
     * @returns {Promise<?Conversation>}
     *
     * @throws {IllegalArgumentException} If an invalid recipient user ID is given.
     * @throws {IllegalArgumentException} If an invalid sender user ID is given.
     */
    async getDMConversationByMembers(senderUserID, recipientUserID){
        if ( recipientUserID === '' || typeof recipientUserID !== 'string' ){
            throw new IllegalArgumentException('Invalid recipient user ID.');
        }
        if ( senderUserID === '' || typeof senderUserID !== 'string' ){
            throw new IllegalArgumentException('Invalid sender user ID.');
        }
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
     * @param {User[]} memberList
     * @param {?string} [conversationName]
     *
     * @returns {Promise<Conversation>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation name is given.
     * @throws {IllegalArgumentException} If an invalid member list is given.
     */
    async createConversation(memberList, conversationName = null){
        if ( conversationName !== null && ( conversationName === '' || typeof conversationName !== 'string' ) ){
            throw new IllegalArgumentException('Invalid conversation name.');
        }
        if ( !Array.isArray(memberList) ){
            throw new IllegalArgumentException('Invalid member list.');
        }
        const aesStaticParameters = new AESStaticParameters({ keyLength: 256, mode: 'GCM' });
        const hmacSigningParameters = new HMACSigningParameters({ hashName: 'SHA-512' });
        const signingKey = await CryptoUtils.generateHMACKey(hmacSigningParameters);
        const encryptionKey = await CryptoUtils.generateAESKey(aesStaticParameters);
        const exportedEncryptionKey = await CryptoUtils.exportKey(encryptionKey);
        const exportedSigningKey = await CryptoUtils.exportKey(signingKey);
        const conversationMemberPlaceholderList = await Promise.all(memberList.map((member) => {
            return this.#buildConversationMemberPlaceholder(member, exportedEncryptionKey, exportedSigningKey);
        }));
        const response = await Request.post(APIEndpoints.CONVERSATION_CREATE, {
            conversationMemberPlaceholderList: conversationMemberPlaceholderList,
            encryptionKeyLength: aesStaticParameters.getKeyLength(),
            signingHashName: hmacSigningParameters.getHashName(),
            encryptionMode: aesStaticParameters.getMode(),
            name: conversationName
        }, true);
        return this.#conversation = await this.#storeSingleConversation(response.conversation);
    }

    /**
     * Notifies the server that the user is typing in the defined conversation.
     *
     * @returns {Promise<void>}
     */
    async notifyTyping(){
        await this.#webSocketClient.send({
            payload: { conversationID: this.#conversation.getID() },
            action: 'setTypingStatus'
        });
    }

    /**
     * Deletes a conversation given its ID.
     *
     * @param {string} conversationID
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation ID is given.
     */
    async deleteConversationByID(conversationID){
        if ( conversationID === '' || typeof conversationID !== 'string' ){
            throw new IllegalArgumentException('Invalid conversation ID.');
        }
        const conversation = await this.#conversationRepository.getByID(conversationID);
        if ( conversation !== null ){
            const userOnlineStatusService = new UserOnlineStatusService();
            conversation.getMembers().forEach((member) => {
                userOnlineStatusService.unsubscribeToUserOnlineStatusChange(member.userID);
            });
        }
        await new MessageService().deleteStoredMessagesByConversationID(conversationID);
        await this.#conversationRepository.deleteByID(conversationID);
        this._eventBroker.emit('conversationDelete', conversationID);
    }

    /**
     * Deletes the defined conversation.
     *
     * @param {boolean} deleteForEveryone
     *
     * @returns {Promise<void>}
     */
    async delete(deleteForEveryone){
        const url = APIEndpoints.CONVERSATION_DELETE.replace(':conversationID', this.#conversation.getID());
        await Request.delete(url, { deleteForEveryone: ( deleteForEveryone === true ? '1' : '0' ) }, true);
        await this.deleteConversationByID(this.#conversation.getID());
        this.#conversation = null;
    }

    /**
     * Marks every message contained in the conversation defined as read.
     *
     * @returns {Promise<void>}
     */
    async markAsRead(){
        await Request.patch(APIEndpoints.CONVERSATION_MARK_AS_READ.replace(':conversationID', this.#conversation.getID()));
        await new MessageService(this.#conversation).markMessagesAsRead();
    }

    /**
     * Extracts the authenticate user's keys from the conversation defined.
     *
     * @returns {Promise<?ConversationKeys>}
     */
    async getConversationKeys(){
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
}

export default ConversationService;
