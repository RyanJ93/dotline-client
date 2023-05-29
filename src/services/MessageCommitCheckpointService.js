'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import Conversation from '../models/Conversation';
import Injector from '../facades/Injector';
import Service from './Service';

class MessageCommitCheckpointService extends Service {
    /**
     * @type {MessageCommitCheckpointRepository}
     */
    #messageCommitCheckpointRepository;

    /**
     * @type {?Conversation}
     */
    #conversation = null;

    /**
     * The class constructor.
     *
     * @param {?Conversation} [conversation]
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     */
    constructor(conversation = null){
        super();

        this.#messageCommitCheckpointRepository = Injector.inject('MessageCommitCheckpointRepository');
        this.setConversation(conversation);
    }

    /**
     * Sets the conversation.
     *
     * @param {?Conversation} conversation
     *
     * @returns {MessageCommitCheckpointService}
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
     * Adds a new checkpoint.
     *
     * @param {string} messageCommitID
     * @param {Date} date
     * @param {string} type
     *
     * @returns {Promise<MessageCommitCheckpoint>}
     *
     * @throws {IllegalArgumentException} If an invalid message commit ID is given.
     * @throws {IllegalArgumentException} If an invalid date is given.
     * @throws {IllegalArgumentException} If an invalid type is given.
     */
    async addCheckpoint(messageCommitID, date, type){
        return await this.#messageCommitCheckpointRepository.addCheckpoint(this.#conversation, messageCommitID, date, type);
    }

    /**
     * Removes a checkpoint matching the given date and type.
     *
     * @param {Date} date
     * @param {string} type
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid date is given.
     * @throws {IllegalArgumentException} If an invalid type is given.
     */
    async removeCheckpoint(date, type){
        await this.#messageCommitCheckpointRepository.removeCheckpoint(this.#conversation, date, type);
    }

    /**
     * Removes all checkpoints matching the given type.
     *
     * @param {string} type
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid type is given.
     */
    async removeCheckpointsByType(type){
        await this.#messageCommitCheckpointRepository.removeCheckpointsByType(this.#conversation, type);
    }

    /**
     * Returns the first message commit checkpoint matching the given type.
     *
     * @param {string} type
     *
     * @returns {Promise<?MessageCommitCheckpoint>}
     *
     * @throws {IllegalArgumentException} If an invalid type is given.
     */
    async getFirstByType(type){
        return await this.#messageCommitCheckpointRepository.getFirstByType(this.#conversation, type);
    }

    /**
     * Returns all the message commit checkpoints greater than a given date and matching the given type.
     *
     * @param {Date} date
     * @param {string} type
     *
     * @returns {Promise<MessageCommitCheckpoint[]>}
     *
     * @throws {IllegalArgumentException} If an invalid type is given.
     * @throws {IllegalArgumentException} If an invalid date is given.
     */
    async getGreaterByType(date, type){
        return await this.#messageCommitCheckpointRepository.getGreaterByType(this.#conversation, date, type);
    }
}

export default MessageCommitCheckpointService;
