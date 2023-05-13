'use strict';

/**
 * @typedef ConversationMemberProperties
 *
 * @property {?string} encryptionKey
 * @property {?string} signingKey
 * @property {?string} userID
 * @property {User} user
 */

class ConversationMember {
    /**
     * @type {?string}
     */
    #encryptionKey;

    /**
     * @type {?string}
     */
    #signingKey;

    /**
     * @type {User}
     */
    #user;

    /**
     * The class constructor.
     *
     * @param {ConversationMemberProperties} properties
     */
    constructor(properties){
        this.#encryptionKey = properties.encryptionKey;
        this.#signingKey = properties.signingKey;
        this.#user = properties.user;
    }

    /**
     * Returns the encryption key.
     *
     * @returns {?string}
     */
    getEncryptionKey(){
        return this.#encryptionKey;
    }

    /**
     * Returns the signing key.
     *
     * @returns {?string}
     */
    getSigningKey(){
        return this.#signingKey;
    }

    /**
     * Returns the user.
     *
     * @returns {User}
     */
    getUser(){
        return this.#user;
    }

    /**
     * Returns a JSON serializable representation of this class.
     *
     * @returns {ConversationMemberProperties}
     */
    toJSON(){
        return {
            encryptionKey: this.#encryptionKey,
            signingKey: this.#signingKey,
            user: this.#user
        };
    }
}

export default ConversationMember;
