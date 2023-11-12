'use strict';

import MessageSyncService from '../services/MessageSyncService';
import App from '../facades/App';

class MessageSyncManager {
    /**
     * @type {?MessageSyncManager}
     */
    static #instance = null;

    /**
     * Returns the class instance as a singleton.
     *
     * @returns {MessageSyncManager}
     */
    static getInstance(){
        if ( MessageSyncManager.#instance === null ){
            MessageSyncManager.#instance = new MessageSyncManager();
        }
        return MessageSyncManager.#instance;
    }

    /**
     * @type {boolean}
     */
    #isSyncProcessRunning = false;

    /**
     * @type {MessageSyncService}
     */
    #messageSyncService;

    /**
     * The class constructor.
     */
    constructor(){
        this.#messageSyncService = new MessageSyncService();
    }

    /**
     * Returns if the messages synchronization process is running or not.
     *
     * @returns {boolean}
     */
    isSyncProcessRunning(){
        return this.#isSyncProcessRunning;
    }

    /**
     * Initialized the messages synchronization process.
     *
     * @param {?messageSyncCompletitionCallback} [callback]
     *
     * @returns {MessageSyncManager}
     */
    initMessageSync(callback = null){
        if ( this.#isSyncProcessRunning === false && App.isUserAuthenticated() ){
            this.#messageSyncService.initSync(() => {
                this.#isSyncProcessRunning = false;
                if ( typeof callback === 'function' ){
                    callback();
                }
            });
        }
        return this;
    }
}

export default MessageSyncManager;
