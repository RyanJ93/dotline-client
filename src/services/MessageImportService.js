'use strict';

import MessageImportProcessStats from '../DTOs/MessageImportProcessStats';
import NotFoundException from '../exceptions/NotFoundException';
import ConversationService from './ConversationService';
import APIEndpoints from '../enum/APIEndpoints';
import MessageService from './MessageService';
import Request from '../facades/Request';
import Service from './Service';

class MessageImportService extends Service {
    #messageImportProcessStats = null;
    #timeoutID = null;

    #updateMessageImportProcessStats(conversationID, length){
        if ( length > 0 ){
            this.#messageImportProcessStats.incrementConversationCounter(conversationID, length);
            this.#messageImportProcessStats.incrementTotalImportedMessageCount(length);
            this._eventBroker.emit('messageImportProgress', this.#messageImportProcessStats);
        }
    }

    async #importConversationMessages(conversation){
        try{
            const messageService = new MessageService(conversation);
            let startingMessage = await messageService.getOldestMessage();
            let endingMessage = await messageService.getNewestMessage();
            let importedMessageList = null;
            if ( endingMessage !== null || startingMessage !== null ){
                while ( endingMessage !== null ){
                    importedMessageList = await messageService.fetchMessages(250, endingMessage.getID());
                    this.#updateMessageImportProcessStats(conversation.getID(), importedMessageList.length);
                    endingMessage = importedMessageList.length === 0 ? null : importedMessageList.shift();
                }
                while ( startingMessage !== null ){
                    importedMessageList = await messageService.fetchMessages(250, null, startingMessage.getID());
                    this.#updateMessageImportProcessStats(conversation.getID(), importedMessageList.length);
                    startingMessage = importedMessageList.length === 0 ? null : importedMessageList.pop();
                }
            }else{
                while ( importedMessageList === null || startingMessage !== null ){
                    const startingID = startingMessage?.getID() ?? null;
                    importedMessageList = await messageService.fetchMessages(250, null, startingID);
                    this.#updateMessageImportProcessStats(conversation.getID(), importedMessageList.length);
                    startingMessage = importedMessageList.length === 0 ? null : importedMessageList.pop();
                }
            }
        }catch(ex){
            if ( ex instanceof NotFoundException ){
                return await new ConversationService().deleteConversationByID(conversation.getID());
            }
            throw ex;
        }
    }

    async #setupMessageImportProcessStats(){
        const response = await Request.get(APIEndpoints.CONVERSATION_STATS), conversationCounters = Object.create(null);
        const totalMessageCount = response.conversationStats.reduce((accumulator, stats) => {
            conversationCounters[stats.conversation] = { total: parseInt(stats.messageCounter), imported: 0 };
            return accumulator + conversationCounters[stats.conversation].total;
        }, 0);
        this.#messageImportProcessStats = new MessageImportProcessStats({
            conversationCounters: conversationCounters,
            totalMessageCount: totalMessageCount,
            totalImportedMessageCount: 0
        });
    }

    initMessageImport(){
        this.#timeoutID = window.setTimeout(async () => {
            const conversationList = await new ConversationService().getConversations();
            await this.#setupMessageImportProcessStats();
            this._eventBroker.emit('messageImportStart', this.#messageImportProcessStats);
            await Promise.all(conversationList.map((conversation) => {
                return this.#importConversationMessages(conversation);
            }));
            this._eventBroker.emit('messageImportEnd', this.#messageImportProcessStats);
            window.clearTimeout(this.#timeoutID);
            this.#timeoutID = null;
        }, 1);
        return this;
    }

    getCurrentMessageImportProcessStats(){
        return this.#messageImportProcessStats;
    }
}

export default MessageImportService;
