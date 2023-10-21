'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import Repository from './Repository';

class UserOnlineStatusRepository extends Repository {
    /**
     * @type {Object.<string, boolean>}
     */
    #userOnlineStatusMap = Object.create(null);

    /**
     * Sets online status for a given user ID.
     *
     * @param {string} userID
     * @param {boolean} isOnline
     *
     * @throws {IllegalArgumentException} If an invalid user ID is given.
     */
    setUserOnlineStatus(userID, isOnline){
        if ( userID === '' || typeof userID !== 'string' ){
            throw new IllegalArgumentException('Invalid user ID.');
        }
        this.#userOnlineStatusMap[userID] = isOnline === true;
        return this;
    }

    /**
     * Sets online status for multiple users.
     *
     * @param {Object.<string, boolean>} userMap
     * @param {boolean} [withReset=true]
     *
     * @returns {UserOnlineStatusRepository}
     *
     * @throws {IllegalArgumentException} If an invalid user map is given.
     */
    setMultipleUserOnlineStatus(userMap, withReset = true){
        if ( userMap === null || typeof userMap !== 'object' ){
            throw new IllegalArgumentException('Invalid user map.');
        }
        if ( withReset === true ){
            this.resetUserOnlineStatuses();
        }
        for ( const userID in userMap ){
            this.#userOnlineStatusMap[userID] = userMap[userID] === true;
        }
        return this;
    }

    /**
     * Returns if a user has been marked as online or not.
     *
     * @param {string} userID
     *
     * @returns {boolean}
     *
     * @throws {IllegalArgumentException} If an invalid user ID is given.
     */
    isUserOnline(userID){
        if ( userID === '' || typeof userID !== 'string' ){
            throw new IllegalArgumentException('Invalid user ID.');
        }
        return this.#userOnlineStatusMap[userID] === true;
    }

    /**
     * Checks if a user online status has been defined or not.
     *
     * @param {string} userID
     *
     * @returns {boolean}
     *
     * @throws {IllegalArgumentException} If an invalid user ID is given.
     */
    isUserTracked(userID){
        if ( userID === '' || typeof userID !== 'string' ){
            throw new IllegalArgumentException('Invalid user ID.');
        }
        return typeof this.#userOnlineStatusMap[userID] === 'boolean';
    }

    /**
     * Returns all the user IDs defined to be tracked.
     *
     * @returns {string[]}
     */
    getTrackedUserIDList(){
        return Object.keys(this.#userOnlineStatusMap);
    }

    /**
     * Removes the given user ID from the internal user map.
     *
     * @param {string} userID
     *
     * @returns {UserOnlineStatusRepository}
     *
     * @throws {IllegalArgumentException} If an invalid user ID is given.
     */
    removeUserOnlineStatus(userID){
        if ( userID === '' || typeof userID !== 'string' ){
            throw new IllegalArgumentException('Invalid user ID.');
        }
        delete this.#userOnlineStatusMap[userID];
        return this;
    }

    /**
     * Marks all the defined users as offline.
     *
     * @returns {UserOnlineStatusRepository}
     */
    resetUserOnlineStatuses(){
        for ( const userID in this.#userOnlineStatusMap ){
            this.#userOnlineStatusMap[userID] = false;
        }
        return this;
    }

    /**
     * Drops all the defined users.
     *
     * @returns {UserOnlineStatusRepository}
     */
    clearUserOnlineStatusMap(){
        this.#userOnlineStatusMap = Object.create(null);
        return this;
    }
}

export default UserOnlineStatusRepository;
