'use strict';

import Injector from '../facades/Injector';
import Service from './Service';

class UserOnlineStatusService extends Service {
    /**
     * @type {UserOnlineStatusRepository}
     */
    #userOnlineStatusRepository;

    /**
     * @type {WebSocketClient}
     */
    #webSocketClient;

    /**
     * The class constructor.
     */
    constructor(){
        super();

        this.#userOnlineStatusRepository = Injector.inject('UserOnlineStatusRepository');
        this.#webSocketClient = Injector.inject('WebSocketClient');
    }

    /**
     * Unsubscribes to user status changes.
     *
     * @param {string} userID
     *
     * @returns {UserOnlineStatusService}
     *
     * @throws {IllegalArgumentException} If an invalid user ID is given.
     */
    unsubscribeToUserOnlineStatusChange(userID){
        this.#userOnlineStatusRepository.removeUserOnlineStatus(userID);
        return this;
    }

    /**
     * Subscribes to user status changes.
     *
     * @param {string} userID
     *
     * @returns {UserOnlineStatusService}
     *
     * @throws {IllegalArgumentException} If an invalid user ID is given.
     */
    subscribeToUserOnlineStatusChange(userID){
        this.#userOnlineStatusRepository.setUserOnlineStatus(userID, false);
        this.fetchOnlineUsers().catch((ex) => console.log(ex));
        return this;
    }

    /**
     * Checks if a subscription was made to the given user.
     *
     * @param {string} userID
     *
     * @returns {boolean}
     *
     * @throws {IllegalArgumentException} If an invalid user ID is given.
     */
    subscribedToUserOnlineStatusChange(userID){
        return this.#userOnlineStatusRepository.isUserTracked(userID);
    }

    /**
     * Unsubscribes to every user.
     *
     * @returns {UserOnlineStatusService}
     */
    unsubscribeToEveryone(){
        this.#userOnlineStatusRepository.clearUserOnlineStatusMap();
        return this;
    }

    /**
     * Checks if the user matching the given ID should be online or not.
     *
     * @param {string} userID
     *
     * @returns {boolean}
     *
     * @throws {IllegalArgumentException} If an invalid user ID is given.
     */
    isUserOnline(userID){
        return this.#userOnlineStatusRepository.isUserOnline(userID);
    }

    /**
     * check online status for those users whom there is a subscription to.
     *
     * @returns {Promise<Object.<string, boolean>>}
     */
    async fetchOnlineUsers(){
        const userIDList = this.#userOnlineStatusRepository.getTrackedUserIDList();
        if ( userIDList.length === 0 || !this.#webSocketClient.isClientReady() ){
            return Object.create(null);
        }
        const response = await this.#webSocketClient.send({
            payload: { userIDList: userIDList },
            action: 'checkOnlineUser'
        });
        const userMap = response?.payload ?? {};
        this.#userOnlineStatusRepository.setMultipleUserOnlineStatus(userMap);
        return userMap;
    }
}

export default UserOnlineStatusService;
