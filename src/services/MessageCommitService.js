'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import MessageCommitAction from '../enum/MessageCommitAction';
import MessageCommitEntry from '../DTOs/MessageCommitEntry';
import Conversation from '../models/Conversation';
import APIEndpoints from '../enum/APIEndpoints';
import MessageService from './MessageService';
import Request from '../facades/Request';
import Service from './Service';

/**
 * @typedef MessageCommitProperties
 *
 * @property {MessageProperties} message
 * @property {string} messageID
 * @property {string} action
 * @property {string} id
 */

class MessageCommitService extends Service {
    /**
     * @type {?Conversation}
     */
    #conversation = null;

    /**
     * Processes a single message commit.
     *
     * @param {MessageCommitProperties} properties
     *
     * @returns {Promise<?Message>}
     */
    async #processMessageCommit(properties){
        switch ( properties.action ){
            case MessageCommitAction.DELETE: {
                await new MessageService().deleteMessageByID(properties.messageID, this.#conversation.getID());
                return null;
            }
            case MessageCommitAction.CREATE: {
                return await new MessageService(this.#conversation).storeMessage(properties.message);
            }
            case MessageCommitAction.EDIT: {
                return await new MessageService(this.#conversation).replaceMessage(properties.message);
            }
            case MessageCommitAction.READ: {
                // NOTE: consider updating "read" property only.
                return await new MessageService(this.#conversation).replaceMessage(properties.message);
            }
        }
    }

    /**
     * The class constructor.
     *
     * @param {?Conversation} [conversation]
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     */
    constructor(conversation = null){
        super();

        this.setConversation(conversation);
    }

    /**
     * Sets the conversation.
     *
     * @param {?Conversation} conversation
     *
     * @returns {MessageCommitService}
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
     * Returns all the message commits for the defined conversation.
     *
     * @param {number} [limit=250]
     * @param {?string} [endingID]
     * @param {?string} [startingID]
     *
     * @returns {Promise<MessageCommitEntry[]>}
     *
     * @throws {IllegalArgumentException} If an invalid starting ID is given.
     * @throws {IllegalArgumentException} If an invalid ending ID is given.
     * @throws {IllegalArgumentException} If an invalid limit is given.
     */
    async listMessageCommits(limit = 250, endingID = null, startingID = null){
        let url = APIEndpoints.MESSAGE_LIST_COMMITS.replace(':conversationID', this.#conversation.getID()), messageCommitList = [];
        const response = await Request.get(url, { startingID: startingID, endingID: endingID, limit: limit });
        if ( Array.isArray(response.messageCommitList) && response.messageCommitList.length > 0 ){
            messageCommitList = await Promise.all(response.messageCommitList.map(async (messageCommit) => {
                messageCommit.message = await this.#processMessageCommit(messageCommit);
                messageCommit.date = new Date(messageCommit.date);
                return new MessageCommitEntry(messageCommit);
            }));
        }
        return messageCommitList;
    }
}

export default MessageCommitService;
