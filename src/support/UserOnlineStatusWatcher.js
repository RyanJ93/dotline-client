'use strict';

import UserOnlineStatusService from '../services/UserOnlineStatusService';

class UserOnlineStatusWatcher {
    /**
     * @type {?UserOnlineStatusWatcher}
     */
    static #instance = null;

    /**
     * Returns an instance of this class as a singleton.
     *
     * @returns {UserOnlineStatusWatcher}
     */
    static getInstance(){
        if ( UserOnlineStatusWatcher.#instance === null ){
            UserOnlineStatusWatcher.#instance = new UserOnlineStatusWatcher();
        }
        return UserOnlineStatusWatcher.#instance;
    }

    /**
     * @type {?number}
     */
    #intervalID = null;

    /**
     * Starts the recurring user online status update process.
     *
     * @param {boolean} [resetUserList=false]
     *
     * @returns {UserOnlineStatusWatcher}
     */
    startPollingCheck(resetUserList = false){
        if ( this.#intervalID === null ){
            if ( resetUserList === true ){
                new UserOnlineStatusService().unsubscribeToEveryone();
            }
            // Instantly update the user list.
            new UserOnlineStatusService().fetchOnlineUsers().catch((ex) => console.error(ex));
            this.#intervalID = window.setInterval(() => {
                new UserOnlineStatusService().fetchOnlineUsers().catch((ex) => console.error(ex));
            }, UserOnlineStatusWatcher.POLLING_INTERVAL);
        }
        return this;
    }

    /**
     * Stops the recurring user online status update process.
     *
     * @param {boolean} [resetUserList=false]
     *
     * @returns {UserOnlineStatusWatcher}
     */
    stopPollingCheck(resetUserList = false){
        if ( this.#intervalID !== null ){
            if ( resetUserList === true ){
                new UserOnlineStatusService().unsubscribeToEveryone();
            }
            window.clearInterval(this.#intervalID);
            this.#intervalID = null;
        }
        return this;
    }
}

/**
 * @constant {number}
 */
Object.defineProperty(UserOnlineStatusWatcher, 'POLLING_INTERVAL', { value: 3000, writable: false });

export default UserOnlineStatusWatcher;
