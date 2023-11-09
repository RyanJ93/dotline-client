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
     * Recomputes total processed message count.
     */
    #recomputeTotalProcessedMessageCount(){
        let totalProcessedMessageCount = 0, totalMessageCommitCount = 0;
        for ( const conversationID in this.#conversationCounters ){
            const { total, imported } = this.#conversationCounters[conversationID];
            totalProcessedMessageCount += imported;
            totalMessageCommitCount += total;
        }
        this.#totalProcessedMessageCount = totalProcessedMessageCount;
        this.#totalMessageCommitCount = totalMessageCommitCount;
    }

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
        this.#totalProcessedMessageCount += increment;
        if ( total < imported ){
            this.#conversationCounters[conversationID].total = imported;
            this.#recomputeTotalProcessedMessageCount();
        }
        return this;
    }

    /**
     * Fulfills a message counter for a given conversation ID.
     *
     * @param {string} conversationID
     *
     * @returns {MessageSyncStats}
     *
     * @throws {IllegalArgumentException} If an invalid conversation ID is given.
     */
    fullFillConversationCounter(conversationID){
        if ( conversationID === '' || typeof conversationID !== 'string' ){
            throw new IllegalArgumentException('Invalid conversation ID.');
        }
        if ( typeof this.#conversationCounters[conversationID] !== 'undefined' ){
            const { total, imported } = this.#conversationCounters[conversationID];
            this.incrementConversationCounter(conversationID, total - imported);
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
