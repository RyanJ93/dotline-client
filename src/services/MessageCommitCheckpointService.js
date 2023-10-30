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
    async removeCheckpointByDate(date, type){
        await this.#messageCommitCheckpointRepository.removeCheckpointByDate(this.#conversation, date, type);
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
     * Removes a given message commit checkpoint instance.
     *
     * @param {MessageCommitCheckpoint} messageCommitCheckpoint
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid message commit checkpoint is given.
     */
    async removeCheckpoint(messageCommitCheckpoint){
        await this.#messageCommitCheckpointRepository.removeCheckpoint(messageCommitCheckpoint);
    }

    /**
     * Returns the first message commit checkpoint matching the given type.
     *
     * @param {string} type
     * @param {?Date} [date]
     * @param {boolean} [lower=true]
     *
     * @returns {Promise<?MessageCommitCheckpoint>}
     *
     * @throws {IllegalArgumentException} If an invalid type is given.
     * @throws {IllegalArgumentException} If an invalid date is given.
     */
    async getFirstByType(type, date = null, lower = true){
        return await this.#messageCommitCheckpointRepository.getFirstByType(this.#conversation, type, date, lower);
    }

    /**
     * Returns the first message commit checkpoint based on a given date.
     *
     * @param {Date} date
     * @param {boolean} [lower=true]
     *
     * @returns {Promise<?MessageCommitCheckpoint>}
     *
     * @throws {IllegalArgumentException} If an invalid date is given.
     */
    async getFirstByDate(date, lower = true){
        return await this.#messageCommitCheckpointRepository.getFirstByDate(this.#conversation, date, lower);
    }

    /**
     * Returns all the checkpoints for the defined conversation in descending order.
     *
     * @param {?Date} [startingDate]
     * @param {?Date} [endingDate]
     *
     * @returns {Promise<MessageCommitCheckpoint[]>}
     *
     * @throws {IllegalArgumentException} If an invalid starting date is given.
     * @throws {IllegalArgumentException} If an invalid ending date is given.
     */
    async getCheckpointList(startingDate = null, endingDate = null){
        return await this.#messageCommitCheckpointRepository.getCheckpointList(this.#conversation, startingDate, endingDate);
    }

    /**
     * Checks if no conversation has been synchronized yet.
     *
     * @returns {Promise<boolean>}
     */
    async isFirstGlobalSync(){
        return await this.#messageCommitCheckpointRepository.isFirstGlobalSync();
    }
}

export default MessageCommitCheckpointService;
