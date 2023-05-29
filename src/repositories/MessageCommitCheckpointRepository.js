'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import MessageCommitCheckpointType from '../enum/MessageCommitCheckpointType';
import MessageCommitCheckpoint from '../models/MessageCommitCheckpoint';
import Conversation from '../models/Conversation';
import DateUtils from '../utils/DateUtils';
import Repository from './Repository';

class MessageCommitCheckpointRepository extends Repository {
    /**
     * Returns all the message commit checkpoints greater than a given date and matching the given type.
     *
     * @param {Conversation} conversation
     * @param {Date} date
     * @param {string} type
     *
     * @returns {Promise<MessageCommitCheckpoint[]>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid type is given.
     * @throws {IllegalArgumentException} If an invalid date is given.
     */
    async getGreaterByType(conversation, date, type){
        if ( Object.values(MessageCommitCheckpointType).indexOf(type) === -1 ){
            throw new IllegalArgumentException('Invalid type.');
        }
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        if ( !DateUtils.isDate(date) ){
            throw new IllegalArgumentException('Invalid date.');
        }
        return await MessageCommitCheckpoint.findAll({
            conversation: conversation.getID(),
            date: { ['>=']: date },
            type: type
        }, { order: { date: 'asc' } });
    }

    /**
     * Returns the first message commit checkpoint matching the given type.
     *
     * @param {Conversation} conversation
     * @param {string} type
     *
     * @returns {Promise<?MessageCommitCheckpoint>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid type is given.
     */
    async getFirstByType(conversation, type){
        if ( Object.values(MessageCommitCheckpointType).indexOf(type) === -1 ){
            throw new IllegalArgumentException('Invalid type.');
        }
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        return await MessageCommitCheckpoint.find({
            conversation: conversation.getID(),
            type: type
        }, { order: { date: 'desc' } });
    }

    /**
     * Adds a new checkpoint.
     *
     * @param {Conversation} conversation
     * @param {string} messageCommitID
     * @param {Date} date
     * @param {string} type
     *
     * @returns {Promise<MessageCommitCheckpoint>}
     *
     * @throws {IllegalArgumentException} If an invalid message commit ID is given.
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid date is given.
     * @throws {IllegalArgumentException} If an invalid type is given.
     */
    async addCheckpoint(conversation, messageCommitID, date, type){
        if ( Object.values(MessageCommitCheckpointType).indexOf(type) === -1 ){
            throw new IllegalArgumentException('Invalid type.');
        }
        if ( messageCommitID === '' || typeof messageCommitID !== 'string' ){
            throw new IllegalArgumentException('Invalid message commit ID.');
        }
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        if ( !DateUtils.isDate(date) ){
            throw new IllegalArgumentException('Invalid date.');
        }
        const messageCommitCheckpoint = new MessageCommitCheckpoint();
        messageCommitCheckpoint.setMessageCommitID(messageCommitID);
        messageCommitCheckpoint.setConversation(conversation);
        messageCommitCheckpoint.setDate(date);
        messageCommitCheckpoint.setType(type);
        await messageCommitCheckpoint.save();
        return messageCommitCheckpoint;
    }

    /**
     * Removes a checkpoint matching the given date and type.
     *
     * @param {Conversation} conversation
     * @param {Date} date
     * @param {string} type
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid date is given.
     * @throws {IllegalArgumentException} If an invalid type is given.
     */
    async removeCheckpoint(conversation, date, type){
        if ( Object.values(MessageCommitCheckpointType).indexOf(type) === -1 ){
            throw new IllegalArgumentException('Invalid type.');
        }
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        if ( !DateUtils.isDate(date) ){
            throw new IllegalArgumentException('Invalid date.');
        }
        await MessageCommitCheckpoint.findAndDelete({
            conversation: conversation.getID(),
            type: type,
            date: date
        });
    }

    /**
     * Removes all checkpoints matching the given type.
     *
     * @param {Conversation} conversation
     * @param {string} type
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid type is given.
     */
    async removeCheckpointsByType(conversation, type){
        if ( Object.values(MessageCommitCheckpointType).indexOf(type) === -1 ){
            throw new IllegalArgumentException('Invalid type.');
        }
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        await MessageCommitCheckpoint.findAndDelete({
            conversation: conversation.getID(),
            type: type
        });
    }
}

export default MessageCommitCheckpointRepository;
