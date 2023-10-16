'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import UserProfilePictureStatus from '../enum/UserProfilePictureStatus';
import UserProfilePicture from '../DTOs/UserProfilePicture';
import Repository from './Repository';

class UserProfilePictureRepository extends Repository {
    /**
     * @type {Object.<string, UserProfilePicture>}
     */
    #userProfilePictures = Object.create(null);

    /**
     * Stores a user profile picture URL.
     *
     * @param {string} userID
     * @param {UserProfilePicture} userProfilePicture
     *
     * @returns {UserProfilePictureRepository}
     *
     * @throws {IllegalArgumentException} If an invalid profile picture is given.
     * @throws {IllegalArgumentException} If an invalid user ID is given.
     */
    storeProfilePicture(userID, userProfilePicture){
        if ( !( userProfilePicture instanceof UserProfilePicture ) ){
            throw new IllegalArgumentException('Invalid profile picture.');
        }
        if ( userID === '' || typeof userID !== 'string' ){
            throw new IllegalArgumentException('Invalid user ID.');
        }
        this.#userProfilePictures[userID] = userProfilePicture;
        return this;
    }

    /**
     * Returns a stored user profile picture URL.
     *
     * @param {string} userID
     *
     * @returns {?UserProfilePicture}
     *
     * @throws {IllegalArgumentException} If an invalid user ID is given.
     */
    getProfilePicture(userID){
        if ( userID === '' || typeof userID !== 'string' ){
            throw new IllegalArgumentException('Invalid user ID.');
        }
        return this.#userProfilePictures[userID] ?? null;
    }

    /**
     *
     * @param userID
     * @returns {?UserProfilePicture}
     */
    #assertProfilePicture(userID){
        let profilePicture = this.getProfilePicture(userID);
        if ( profilePicture?.getStatus() !== UserProfilePictureStatus.FETCHED ){
            profilePicture = null;
        }
        return profilePicture;
    }

    waitForProfilePicture(userID, timeout = UserProfilePictureRepository.DEFAULT_WAIT_TIMEOUT){
        return new Promise((resolve, reject) => {
            if ( timeout === null || isNaN(timeout) || timeout <= 0 ){
                return reject(new IllegalArgumentException('Invalid timeout value.'));
            }
            if ( userID === '' || typeof userID !== 'string' ){
                return reject(new IllegalArgumentException('Invalid user ID.'));
            }
            const timeoutDate = new Date(new Date().getTime() + timeout);
            const profilePicture = this.#assertProfilePicture(userID);
            if ( profilePicture !== null ){
                return resolve(profilePicture);
            }
            const intervalID = window.setInterval(() => {
                const profilePicture = this.#assertProfilePicture(userID), date = new Date();
                if ( profilePicture !== null || date < timeoutDate ){
                    window.clearInterval(intervalID);
                    return resolve(profilePicture);
                }
            }, 1000);
        });
    }

    /**
     * Removes a stored user profile picture URL.
     *
     * @param {string} userID
     *
     * @returns {UserProfilePictureRepository}
     *
     * @throws {IllegalArgumentException} If an invalid user ID is given.
     */
    removeProfilePicture(userID){
        if ( userID === '' || typeof userID !== 'string' ){
            throw new IllegalArgumentException('Invalid user ID.');
        }
        delete this.#userProfilePictures[userID];
        return this;
    }

    /**
     * Checks if a profile picture has been stored for a given user.
     *
     * @param {string} userID
     *
     * @returns {boolean}
     *
     * @throws {IllegalArgumentException} If an invalid user ID is given.
     */
    hasProfilePicture(userID){
        if ( userID === '' || typeof userID !== 'string' ){
            throw new IllegalArgumentException('Invalid user ID.');
        }
        return this.#userProfilePictures[userID] instanceof UserProfilePicture;
    }

    /**
     * Drops all the stored user profile pictures.
     *
     * @returns {UserProfilePictureRepository}
     */
    dropProfilePictures(){
        this.#userProfilePictures = Object.create(null);
        return this;
    }
}

/**
 * @constant {number}
 */
Object.defineProperty(UserProfilePictureRepository, 'DEFAULT_WAIT_TIMEOUT', { value: 30000, writable: false });

export default UserProfilePictureRepository;
