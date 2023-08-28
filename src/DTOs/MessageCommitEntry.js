'use strict';

/**
 * @typedef MessageCommitEntryProperties
 *
 * @property {?MessageProperties} messageProperties
 * @property {string} messageID
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
     * @type {?MessageProperties} messageProperties
     */
    #messageProperties;

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
        this.#messageProperties = properties.messageProperties;
        this.#messageID = properties.messageID;
        this.#action = properties.action;
        this.#date = properties.date;
        this.#id = properties.id;
    }

    /**
     * Returns message properties.
     *
     * @returns {?MessageProperties}
     */
    getMessageProperties(){
        return this.#messageProperties;
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
