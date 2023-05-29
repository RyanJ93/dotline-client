'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';

/**
 * @typedef ConversationCounterProperties
 *
 * @property {number} imported
 * @property {number} total
 */

/**
 * @typedef MessageSyncStatsProperties
 *
 * @property {Object.<string, ConversationCounterProperties>} conversationCounters
 * @property {number} totalProcessedMessageCount
 * @property {number} totalMessageCommitCount
 */

class MessageSyncStats {
    /**
     * @type {number}
     */
    #totalProcessedMessageCount;

    /**
     * @type {number}
     */
    #totalMessageCommitCount;

    /**
     * @type {Object.<string, ConversationCounterProperties>}
     */
    #conversationCounters;

    /**
     * The class constructor.
     *
     * @param {MessageSyncStatsProperties} properties
     */
    constructor(properties){
        this.#totalProcessedMessageCount = properties.totalProcessedMessageCount;
        this.#totalMessageCommitCount = properties.totalMessageCommitCount;
        this.#conversationCounters = properties.conversationCounters;
    }

    /**
     * Increments total processed message counter.
     *
     * @param {number} processedMessageCount
     *
     * @returns {MessageSyncStats}
     *
     * @throws {IllegalArgumentException} If an invalid increment amount is given.
     */
    incrementTotalProcessedMessageCount(processedMessageCount){
        if ( processedMessageCount === null || isNaN(processedMessageCount) ){
            throw new IllegalArgumentException('Invalid increment amount.');
        }
        this.#totalProcessedMessageCount += processedMessageCount;
        if ( this.#totalProcessedMessageCount > this.#totalMessageCommitCount ){
            this.#totalProcessedMessageCount = this.#totalMessageCommitCount;
        }
        return this;
    }

    /**
     * Increments processed message counter for a given conversation ID.
     *
     * @param {string} conversationID
     * @param {number} increment
     *
     * @returns {MessageSyncStats}
     *
     * @throws {IllegalArgumentException} If an invalid increment amount is given.
     * @throws {IllegalArgumentException} If an invalid conversation ID is given.
     */
    incrementConversationCounter(conversationID, increment){
        if ( conversationID === '' || typeof conversationID !== 'string' ){
            throw new IllegalArgumentException('Invalid conversation ID.');
        }
        if ( increment === null || isNaN(increment) ){
            throw new IllegalArgumentException('Invalid increment amount.');
        }
        this.#conversationCounters[conversationID].imported += increment;
        const { total, imported } = this.#conversationCounters[conversationID];
        if ( total > imported ){
            this.#conversationCounters[conversationID].imported = total;
        }
        return this;
    }

    /**
     * Returns total processed message count.
     *
     * @returns {number}
     */
    getTotalProcessedMessageCount(){
        return this.#totalProcessedMessageCount;
    }

    /**
     * Returns a single conversation counter
     *
     * @param {string} conversationID
     *
     * @returns {?ConversationCounterProperties}
     *
     * @throws {IllegalArgumentException} If an invalid conversation ID is given.
     */
    getConversationCounter(conversationID){
        if ( conversationID === '' || typeof conversationID !== 'string' ){
            throw new IllegalArgumentException('Invalid conversation ID.');
        }
        return this.#conversationCounters[conversationID] ?? null;
    }

    /**
     * Returns all the conversation counters.
     *
     * @returns {Object<string, ConversationCounterProperties>}
     */
    getConversationCounters(){
        return this.#conversationCounters;
    }

    /**
     * Returns total message commit count.
     *
     * @returns {number}
     */
    getTotalMessageCommitCount(){
        return this.#totalMessageCommitCount;
    }
}

export default MessageSyncStats;
