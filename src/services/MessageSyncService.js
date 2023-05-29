'use strict';

import MessageCommitCheckpointService from './MessageCommitCheckpointService';
import MessageCommitCheckpointType from '../enum/MessageCommitCheckpointType';
import MessageCommitService from './MessageCommitService';
import ConversationService from './ConversationService';
import MessageSyncStats from '../DTOs/MessageSyncStats';
import APIEndpoints from '../enum/APIEndpoints';
import Request from '../facades/Request';
import Service from './Service';

class MessageSyncService extends Service {
    /**
     * @type {?MessageSyncStats}
     */
    #messageSyncStats = null;

    /**
     * @type {?number}
     */
    #timeoutID = null;

    /**
     * Updates message synchronization stats.
     *
     * @param {string} conversationID
     * @param {number} length
     */
    #updateMessageSyncStats(conversationID, length){
        if ( length > 0 ){
            this.#messageSyncStats.incrementConversationCounter(conversationID, length);
            this.#messageSyncStats.incrementTotalProcessedMessageCount(length);
            this._eventBroker.emit('messageSyncProgress', this.#messageSyncStats);
        }
    }

    /**
     * Fetches synchronization stats and sets up the message synchronization stats object.
     *
     * @returns {Promise<void>}
     */
    async #setupMessageSyncStats(){
        const response = await Request.get(APIEndpoints.CONVERSATION_COMMIT_STATS), conversationCounters = Object.create(null);
        const totalMessageCommitCount = response.messageCommitCounterList.reduce((accumulator, stats) => {
            conversationCounters[stats.conversation] = { total: parseInt(stats.commitCounter), imported: 0 };
            return accumulator + conversationCounters[stats.conversation].total;
        }, 0);
        this.#messageSyncStats = new MessageSyncStats({
            totalMessageCommitCount: totalMessageCommitCount,
            conversationCounters: conversationCounters,
            totalProcessedMessageCount: 0
        });
    }

    /**
     * Synchronizes a single given conversation.
     *
     * @param {Conversation} conversation
     *
     * @returns {Promise<void>}
     */
    async #syncConversation(conversation){
        let previousEOLDate = null, previousEOLMessageCommitID = null, createdSOLMessageCommitID;
        const messageCommitCheckpointService = new MessageCommitCheckpointService(conversation);
        let startingMessageCommitID = null, messageCommitList = null, index = 0;
        const messageCommitService = new MessageCommitService(conversation);
        while ( messageCommitList === null || messageCommitList.length > 0 ){
            // Fetch and process message commit list.
            messageCommitList = await messageCommitService.listMessageCommits(250, null, startingMessageCommitID);
            this.#updateMessageSyncStats(conversation.getID(), messageCommitList.length);
            let isFirstChunk = ( index === 0 ), removedSOLCount = 0;
            index++;
            if ( messageCommitList.length === 0 ){
                // No message commit left or no message commit available at all.
                if ( previousEOLDate !== null && previousEOLMessageCommitID !== null ){
                    // No message commit left, EOL has been reached then remove all previous EOLs and add a new one.
                    await messageCommitCheckpointService.removeCheckpointsByType(MessageCommitCheckpointType.EOL);
                    await messageCommitCheckpointService.addCheckpoint(previousEOLMessageCommitID, previousEOLDate, MessageCommitCheckpointType.EOL);
                }
                continue;
            }
            const currentEOLMessageCommitID = startingMessageCommitID = messageCommitList[messageCommitList.length - 1].getID();
            const currentSOLDate = messageCommitList[0].getDate(), currentSOLMessageCommitID = messageCommitList[0].getID();
            const SOL = await messageCommitCheckpointService.getFirstByType(MessageCommitCheckpointType.SOL);
            previousEOLMessageCommitID = messageCommitList[messageCommitList.length - 1].getID();
            const currentEOLDate = messageCommitList[messageCommitList.length - 1].getDate();
            previousEOLDate = messageCommitList[messageCommitList.length - 1].getDate();
            if ( SOL !== null && currentSOLDate.getTime() === SOL.getDate().getTime() ){
                // Current segment intersected an older one, continue starting from that segment's end.
                const EOL = await messageCommitCheckpointService.getFirstByType(MessageCommitCheckpointType.EOL);
                startingMessageCommitID = EOL.getMessageCommitID();
                continue;
            }
            if ( isFirstChunk ){
                // It's the first message commit list chunk, add a SOL checkpoint and, since conversation head has bene loaded, trigger proper event.
                await messageCommitCheckpointService.addCheckpoint(currentSOLMessageCommitID, currentSOLDate, MessageCommitCheckpointType.SOL);
                this._eventBroker.emit('conversationHeadReady', conversation.getID());
                createdSOLMessageCommitID = currentSOLMessageCommitID;
            }
            // Get and remove all the SOL checkpoints having a date greater than current one and different from current one.
            const messageCommitCheckpointList = await messageCommitCheckpointService.getGreaterByType(currentSOLDate, MessageCommitCheckpointType.SOL);
            for ( let i = 0 ; i < messageCommitCheckpointList.length ; i++ ){
                if ( messageCommitCheckpointList[i].getMessageCommitID() !== createdSOLMessageCommitID ){
                    await messageCommitCheckpointService.removeCheckpoint(messageCommitCheckpointList[i].getDate(), MessageCommitCheckpointType.SOL);
                    removedSOLCount++;
                }
            }
            const EOL = await messageCommitCheckpointService.getFirstByType(MessageCommitCheckpointType.EOL);
            if ( removedSOLCount > 0 && EOL !== null ){
                // Move to the closest EOL checkpoint.
                startingMessageCommitID = EOL.getMessageCommitID();
                continue;
            }
            // Remove the closest EOL checkpoint and add a new one.
            await messageCommitCheckpointService.addCheckpoint(currentEOLMessageCommitID, currentEOLDate, MessageCommitCheckpointType.EOL);
            if ( EOL !== null ){
                await messageCommitCheckpointService.removeCheckpoint(EOL.getDate(), MessageCommitCheckpointType.EOL);
            }
        }
    }

    /**
     * Initializes synchronization for all the conversations.
     *
     * @returns {MessageSyncService}
     */
    initSync(){
        this.#timeoutID = window.setTimeout(async () => {
            const [ conversationList ] = await Promise.all([new ConversationService().getConversations(), this.#setupMessageSyncStats()]);
            this._eventBroker.emit('messageSyncStart', this.#messageSyncStats);
            await Promise.all(conversationList.map((conversation) => this.#syncConversation(conversation)));
            this._eventBroker.emit('messageSyncEnd', this.#messageSyncStats);
            window.clearTimeout(this.#timeoutID);
            this.#timeoutID = null;
        }, 1);
        return this;
    }
}

export default MessageSyncService;
