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
        let startingMessageCommitID = null, messageCommitList = null, firstSOLMessageCommitID = null;
        const messageCommitCheckpointService = new MessageCommitCheckpointService(conversation);
        const messageCommitService = new MessageCommitService(conversation);
        while ( messageCommitList === null || messageCommitList.length > 0 ){
            // Fetch message commit list starting defined message commit ID.
            messageCommitList = await messageCommitService.listMessageCommits(MessageSyncService.MESSAGE_COMMIT_LIST_PAGE_SIZE, null, startingMessageCommitID);
            if ( messageCommitList.length > 0 ){
                const firstEntry = messageCommitList[0], lastEntry = messageCommitList[messageCommitList.length - 1];
                const currentSOLDate = firstEntry.getDate(), currentSOLMessageCommitID = firstEntry.getID();
                const currentEOLDate = lastEntry.getDate(), currentEOLMessageCommitID = lastEntry.getID();
                this.#updateMessageSyncStats(conversation.getID(), messageCommitList.length);
                // Get the first checkpoint right after this chunk's EOL checkpoint date.
                const checkpoint = await messageCommitCheckpointService.getFirstByDate(currentEOLDate);
                if ( checkpoint === null || checkpoint.getType() !== MessageCommitCheckpointType.EOL ){
                    // First checkpoint found is not an EOL or was not found at all, then push this chunk's EOL into the index.
                    await messageCommitCheckpointService.addCheckpoint(currentEOLMessageCommitID, currentEOLDate, MessageCommitCheckpointType.EOL);
                    // After this iteration load the next chunk.
                    startingMessageCommitID = currentEOLMessageCommitID;
                }else{
                    // Schedule a jump to the EOL found.
                    startingMessageCommitID = checkpoint.getMessageCommitID();
                }
                // Store the received message commit list.
                await messageCommitService.storeMessageCommitList(messageCommitList);
                if ( firstSOLMessageCommitID === null ){
                    // This is the first chunk, then add a SOL breakpoint to indicate the beginning of the segment.
                    await messageCommitCheckpointService.addCheckpoint(currentSOLMessageCommitID, currentSOLDate, MessageCommitCheckpointType.SOL);
                    this._eventBroker.emit('conversationHeadReady', conversation.getID());
                    firstSOLMessageCommitID = currentSOLMessageCommitID;
                }
                // Get all the checkpoints available in the index.
                const checkpointList = await messageCommitCheckpointService.getCheckpointList(null, currentEOLDate);
                for ( let i = 0 ; i < checkpointList.length ; i++ ){
                    const type = checkpointList[i].getType(), messageCommitID = checkpointList[i].getMessageCommitID();
                    const isCurrentEOL = type === MessageCommitCheckpointType.EOL && messageCommitID === startingMessageCommitID;
                    const isFirstSOL = type === MessageCommitCheckpointType.SOL && messageCommitID === firstSOLMessageCommitID;
                    if ( !isFirstSOL && !isCurrentEOL ){
                        // This is not the SOL checkpoint added at the beginning then it should be removed.
                        await messageCommitCheckpointService.removeCheckpoint(checkpointList[i]);
                    }
                }
            }
        }
        if ( firstSOLMessageCommitID === null ){
            this._eventBroker.emit('conversationHeadReady', conversation.getID());
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

/**
 * @constant {number}
 */
Object.defineProperty(MessageSyncService, 'MESSAGE_COMMIT_LIST_PAGE_SIZE', { value: 250, writable: false });

export default MessageSyncService;
