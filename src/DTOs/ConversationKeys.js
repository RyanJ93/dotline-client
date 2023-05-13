'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import CryptoService from '../services/CryptoService';
import ConversationMember from './ConversationMember';

/**
 * @typedef ConversationKeysProperties
 *
 * @property {string} encryptionKey
 * @property {string} signingKey
 */

class ConversationKeys {
    /**
     * Extracts and decrypts both encryption and signing keys from the given conversation member.
     *
     * @param {ConversationMember} conversationMember
     *
     * @returns {Promise<ConversationKeys>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation member is given.
     */
    static async extractFromMember(conversationMember){
        if ( !( conversationMember instanceof ConversationMember ) ){
            throw new IllegalArgumentException('Invalid conversation member.');
        }
        const cryptoService = new CryptoService();
        return new ConversationKeys({
            encryptionKey: await cryptoService.RSADecrypt(conversationMember.getEncryptionKey()),
            signingKey: await cryptoService.RSADecrypt(conversationMember.getSigningKey())
        });
    }

    /**
     * @type {string}
     */
    #encryptionKey;

    /**
     * @type {string}
     */
    #signingKey;

    /**
     * The class constructor.
     *
     * @param {ConversationKeysProperties} properties
     */
    constructor(properties){
        this.#encryptionKey = properties.encryptionKey;
        this.#signingKey = properties.signingKey;
    }

    /**
     * Returns the encryption key.
     *
     * @returns {string}
     */
    getEncryptionKey(){
        return this.#encryptionKey;
    }

    /**
     * Returns the signing key.
     *
     * @returns {string}
     */
    getSigningKey(){
        return this.#signingKey;
    }
}

export default ConversationKeys;
