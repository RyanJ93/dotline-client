'use strict';

class MessageImportProcessStats {
    #totalImportedMessageCount;
    #conversationCounters;
    #totalMessageCount;

    constructor(properties){
        this.#totalImportedMessageCount = properties.totalImportedMessageCount;
        this.#conversationCounters = properties.conversationCounters;
        this.#totalMessageCount = properties.totalMessageCount;
    }

    incrementTotalImportedMessageCount(importedMessageCount){
        this.#totalImportedMessageCount += importedMessageCount;
        if ( this.#totalImportedMessageCount > this.#totalMessageCount ){
            this.#totalImportedMessageCount = this.#totalMessageCount;
        }
        return this;
    }

    incrementConversationCounter(conversation, counter){
        this.#conversationCounters[conversation].imported += counter;
        const { total, imported } = this.#conversationCounters[conversation];
        if ( total > imported ){
            this.#conversationCounters[conversation].imported = total;
        }
        return this;
    }

    getTotalImportedMessageCount(){
        return this.#totalImportedMessageCount;
    }

    getConversationCounter(conversation){
        return this.#conversationCounters[conversation] ?? null;
    }

    getConversationCounters(){
        return this.#conversationCounters;
    }

    getTotalMessageCount(){
        return this.#totalMessageCount;
    }
}

export default MessageImportProcessStats;
