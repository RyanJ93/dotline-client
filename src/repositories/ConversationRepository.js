'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import HMACSigningParameters from '../DTOs/HMACSigningParameters';
import AESStaticParameters from '../DTOs/AESStaticParameters';
import Conversation from '../models/Conversation';
import Repository from './Repository';

class ConversationRepository extends Repository {
    /**
     * Stores a conversation locally given its properties.
     *
     * @param {string} id
     * @param {AESStaticParameters} encryptionParameters
     * @param {HMACSigningParameters} signingParameters
     * @param {ConversationMemberProperties[]} members
     * @param {?string} name
     *
     * @returns {Promise<Conversation>}
     *
     * @throws {IllegalArgumentException} If some invalid encryption parameters are given.
     * @throws {IllegalArgumentException} If some invalid signing parameters are given.
     * @throws {IllegalArgumentException} If an invalid conversation name is given.
     * @throws {IllegalArgumentException} If an invalid members list is given.
     * @throws {IllegalArgumentException} If an invalid ID is given.
     */
    async store(id, encryptionParameters, signingParameters, members, name){
        if ( !( encryptionParameters instanceof AESStaticParameters ) ){
            throw new IllegalArgumentException('Invalid encryption parameters.');
        }
        if ( !( signingParameters instanceof HMACSigningParameters ) ){
            throw new IllegalArgumentException('Invalid signing parameters.');
        }
        if ( name !== null && ( name === '' || typeof name !== 'string' ) ){
            throw new IllegalArgumentException('Invalid conversation name.');
        }
        if ( !Array.isArray(members) ){
            throw new IllegalArgumentException('Invalid members list.');
        }
        if ( id === '' || typeof id !== 'string' ){
            throw new IllegalArgumentException('Invalid ID.');
        }
        const conversation = new Conversation();
        conversation.setEncryptionParameters(encryptionParameters);
        conversation.setSigningParameters(signingParameters);
        conversation.setMembers(members);
        conversation.setName(name);
        conversation.setID(id);
        await conversation.save();
        return conversation;
    }

    /**
     * Returns a conversation given its ID.
     *
     * @param {string} id
     *
     * @returns {Promise<?Conversation>}
     *
     * @throws {IllegalArgumentException} If an invalid ID is given.
     */
    async getByID(id){
        if ( id === '' || typeof id !== 'string' ){
            throw new IllegalArgumentException('Invalid ID.');
        }
        return await Conversation.find({ where: { id: id } });
    }

    /**
     * Returns all the stored conversations.
     *
     * @returns {Promise<Conversation[]>}
     */
    async getAll(){
        return await Conversation.findAll({});
    }

    /**
     * Deletes a conversation given its ID.
     *
     * @param {string} id
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid ID is given.
     */
    async deleteByID(id){
        if ( id === '' || typeof id !== 'string' ){
            throw new IllegalArgumentException('Invalid ID.');
        }
        await Conversation.findAndDelete({ id: id });
    }
}

export default ConversationRepository;
