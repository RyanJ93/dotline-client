'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import MessageCommitCheckpointType from '../enum/MessageCommitCheckpointType';
import MessageCommitCheckpoint from '../models/MessageCommitCheckpoint';
import Conversation from '../models/Conversation';
import DateUtils from '../utils/DateUtils';
import Repository from './Repository';

class MessageCommitCheckpointRepository extends Repository {
    /**
     * Returns the first message commit checkpoint matching the given type.
     *
     * @param {Conversation} conversation
     * @param {string} type
     * @param {?Date} [date]
     * @param {boolean} [lower=true]
     *
     * @returns {Promise<?MessageCommitCheckpoint>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid type is given.
     * @throws {IllegalArgumentException} If an invalid date is given.
     */
    async getFirstByType(conversation, type, date = null, lower = true){
        if ( Object.values(MessageCommitCheckpointType).indexOf(type) === -1 ){
            throw new IllegalArgumentException('Invalid type.');
        }
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        const filter = { conversation: conversation.getID(), type: type };
        const order = { date: 'desc' };
        if ( date !== null ){
            if ( !DateUtils.isDate(date) ){
                throw new IllegalArgumentException('Invalid date.');
            }
            if ( lower === true ){
                filter.date = { ['<=']: date };
            }else{
                filter.date = { ['>=']: date };
                order.date = 'asc';
            }
        }
        return await MessageCommitCheckpoint.find(filter, { order: order });
    }

    /**
     * Returns the first message commit checkpoint based on a given date.
     *
     * @param {Conversation} conversation
     * @param {Date} date
     * @param {boolean} [lower=true]
     *
     * @returns {Promise<?MessageCommitCheckpoint>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid date is given.
     */
    async getFirstByDate(conversation, date = null, lower = true){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        if ( !DateUtils.isDate(date) ){
            throw new IllegalArgumentException('Invalid date.');
        }
        const filter = { conversation: conversation.getID() };
        const order = { date: 'desc' };
        if ( lower === true ){
            filter.date = { ['<=']: date };
        }else{
            filter.date = { ['>=']: date };
            order.date = 'asc';
        }
        return await MessageCommitCheckpoint.find(filter, { order: order });
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
    async removeCheckpointByDate(conversation, date, type){
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
     * Removes a given message commit checkpoint instance.
     *
     * @param {MessageCommitCheckpoint} messageCommitCheckpoint
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid message commit checkpoint is given.
     */
    async removeCheckpoint(messageCommitCheckpoint){
        if ( !( messageCommitCheckpoint instanceof MessageCommitCheckpoint ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        await messageCommitCheckpoint.delete();
    }

    /**
     * Removes all checkpoints matching the given conversation and type.
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

    /**
     * Returns all the checkpoints for a given conversation in descending order.
     *
     * @param {Conversation} conversation
     * @param {?Date} [startingDate]
     * @param {?Date} [endingDate]
     *
     * @returns {Promise<MessageCommitCheckpoint[]>}
     *
     * @throws {IllegalArgumentException} If an invalid conversation is given.
     * @throws {IllegalArgumentException} If an invalid starting date is given.
     * @throws {IllegalArgumentException} If an invalid ending date is given.
     */
    async getCheckpointList(conversation, startingDate = null, endingDate = null){
        if ( !( conversation instanceof Conversation ) ){
            throw new IllegalArgumentException('Invalid conversation.');
        }
        const filter = { conversation: conversation.getID() };
        if ( startingDate !== null ){
            if ( !DateUtils.isDate(startingDate) ){
                throw new IllegalArgumentException('Invalid starting date.');
            }
            filter.date = { ['<=']: startingDate };
        }
        if ( endingDate !== null ){
            if ( !DateUtils.isDate(endingDate) ){
                throw new IllegalArgumentException('Invalid ending date.');
            }
            filter.date = { ['>=']: endingDate };
        }
        return await MessageCommitCheckpoint.findAll(filter, { order: { date: 'desc' } });
    }
}

export default MessageCommitCheckpointRepository;
