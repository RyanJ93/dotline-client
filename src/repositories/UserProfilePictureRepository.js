'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import RemoteAssetStatus from '../enum/RemoteAssetStatus';
import RemoteAsset from '../DTOs/RemoteAsset';
import Repository from './Repository';

class UserProfilePictureRepository extends Repository {
    /**
     * @type {Object.<string, RemoteAsset>}
     */
    #userProfilePictures = Object.create(null);

    /**
     * Returns the profile picture corresponding to the given user ID, if it has been fetched.
     *
     * @param {string} userID
     *
     * @returns {?RemoteAsset}
     */
    #assertProfilePicture(userID){
        let profilePicture = this.getProfilePicture(userID);
        if ( profilePicture?.getStatus() !== RemoteAssetStatus.FETCHED ){
            profilePicture = null;
        }
        return profilePicture;
    }

    /**
     * Stores a user profile picture URL.
     *
     * @param {string} userID
     * @param {RemoteAsset} remoteAsset
     *
     * @returns {UserProfilePictureRepository}
     *
     * @throws {IllegalArgumentException} If an invalid remote asset is given.
     * @throws {IllegalArgumentException} If an invalid user ID is given.
     */
    storeProfilePicture(userID, remoteAsset){
        if ( !( remoteAsset instanceof RemoteAsset ) ){
            throw new IllegalArgumentException('Invalid remote asset.');
        }
        if ( userID === '' || typeof userID !== 'string' ){
            throw new IllegalArgumentException('Invalid user ID.');
        }
        this.#userProfilePictures[userID] = remoteAsset;
        return this;
    }

    /**
     * Returns a stored user profile picture.
     *
     * @param {string} userID
     *
     * @returns {?RemoteAsset}
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
     * Waits for a given user profile picture to be fetched.
     *
     * @param {string} userID
     * @param {number} timeout
     *
     * @returns {Promise<RemoteAsset>}
     *
     * @throws {IllegalArgumentException} If an invalid timeout value is given.
     * @throws {IllegalArgumentException} If an invalid URL is given.
     */
    waitForProfilePicture(userID, timeout = UserProfilePictureRepository.DEFAULT_WAIT_TIMEOUT){
        return new Promise((resolve, reject) => {
            if ( timeout === null || isNaN(timeout) || timeout <= 0 ){
                return reject(new IllegalArgumentException('Invalid timeout value.'));
            }
            if ( userID === '' || typeof userID !== 'string' ){
                return reject(new IllegalArgumentException('Invalid user ID.'));
            }
            const timeoutDate = new Date(new Date().getTime() + timeout);
            const remoteAsset = this.#assertProfilePicture(userID);
            if ( remoteAsset !== null ){
                return resolve(remoteAsset);
            }
            const intervalID = window.setInterval(() => {
                const remoteAsset = this.#assertProfilePicture(userID), date = new Date();
                if ( remoteAsset !== null || date < timeoutDate ){
                    window.clearInterval(intervalID);
                    return resolve(remoteAsset);
                }
            }, 1000);
        });
    }

    /**
     * Removes a stored user profile picture.
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
        return this.#userProfilePictures[userID] instanceof RemoteAsset;
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
