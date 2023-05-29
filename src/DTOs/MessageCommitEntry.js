'use strict';

/**
 * @typedef MessageCommitEntryProperties
 *
 * @property {string} messageID
 * @property {?Message} message
 * @property {string} action
 * @property {Date} date
 * @property {string} id
 */

class MessageCommitEntry {
    /**
     * @type {string} messageID
     */
    #messageID;

    /**
     * @type {?Message} message
     */
    #message;

    /**
     * @type {string} action
     */
    #action;

    /**
     * @type {Date} date
     */
    #date;

    /**
     * @type {string} id
     */
    #id;

    /**
     * The class constructor.
     *
     * @param {MessageCommitEntryProperties} properties
     */
    constructor(properties){
        this.#messageID = properties.messageID;
        this.#message = properties.message;
        this.#action = properties.action;
        this.#date = properties.date;
        this.#id = properties.id;
    }

    /**
     * Returns the message ID.
     *
     * @returns {string}
     */
    getMessageID(){
        return this.#messageID;
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
     * Returns the action.
     *
     * @returns {string}
     */
    getAction(){
        return this.#action;
    }

    /**
     * Returns the date.
     *
     * @returns {Date}
     */
    getDate(){
        return this.#date;
    }

    /**
     * Returns the ID.
     *
     * @returns {string}
     */
    getID(){
        return this.#id;
    }
}

export default MessageCommitEntry;
