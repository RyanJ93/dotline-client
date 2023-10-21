'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import RemoteAssetStatus from '../enum/RemoteAssetStatus';
import { default as UserDTO } from '../DTOs/User';
import APIEndpoints from '../enum/APIEndpoints';
import RemoteAsset from '../DTOs/RemoteAsset';
import Injector from '../facades/Injector';
import Request from '../facades/Request';
import User from '../models/User';
import Service from './Service';

class UserProfilePictureService extends Service {
    /**
     * Checks if a given MIME type is a supported profile picture type.
     *
     * @param {string} mimetype
     *
     * @returns {boolean}
     */
    static isSupportedPictureType(mimetype){
        return UserProfilePictureService.ACCEPTED_MIME_TYPES.indexOf(mimetype) >= 0;
    }

    /**
     * @type {UserProfilePictureRepository}
     */
    #userProfilePictureRepository;

    /**
     * Fetches a given profile picture ID for a given user ID.
     *
     * @param {string} userID
     * @param {string} profilePictureID
     * @param {boolean} forceRefresh
     *
     * @returns {Promise<?string>}
     */
    async #fetchProfilePicture(userID, profilePictureID, forceRefresh){
        let remoteAsset = forceRefresh === true ? null : this.#userProfilePictureRepository.getProfilePicture(userID);
        if ( remoteAsset === null || remoteAsset.getStatus() === RemoteAssetStatus.ERROR ){
            // Generate a remote asset object to mark this user's profile picture as under loading.
            const remoteAsset = new RemoteAsset({ status: RemoteAssetStatus.LOADING, url: null });
            const url = APIEndpoints.USER_PROFILE_PICTURE_GET.replace(':profilePictureID', profilePictureID);
            this.#userProfilePictureRepository.storeProfilePicture(userID, remoteAsset);
            // Download this user's profile picture as a Blob object and generate a URL out of it.
            const profilePictureBlob = await Request.download(url.replace(':userID', userID));
            const pfpURL = profilePictureBlob.size > 0 ? URL.createObjectURL(profilePictureBlob) : null;
            // Mark this profile picture as loaded and register corresponding URL.
            remoteAsset.setStatus(RemoteAssetStatus.FETCHED).setURL(pfpURL);
        }else if ( remoteAsset?.getStatus() === RemoteAssetStatus.LOADING ){
            // This user's profile picture is being loaded, wait for a while and, if not loaded, retry.
            remoteAsset = await this.#userProfilePictureRepository.waitForProfilePicture(userID);
            if ( remoteAsset === null ){
                return await this.#fetchProfilePicture(userID, profilePictureID, forceRefresh);
            }
        }
        return remoteAsset?.getURL() ?? null;
    }

    /**
     * The class constructor.
     */
    constructor(){
        super();

        this.#userProfilePictureRepository = Injector.inject('UserProfilePictureRepository');
    }

    /**
     * Changes currently authenticated user's profile picture.
     *
     * @param {File} picture
     *
     * @returns {Promise<string>}
     *
     * @throws {IllegalArgumentException} If an invalid picture file is given.
     */
    async changeProfilePicture(picture){
        if ( !( picture instanceof File ) ){
            throw new IllegalArgumentException('Invalid picture file.');
        }
        if ( !UserProfilePictureService.isSupportedPictureType(picture.type) ){
            throw new IllegalArgumentException('Unsupported file type.');
        }
        const response = await Request.put(APIEndpoints.USER_PROFILE_PICTURE_CHANGE, { picture: picture });
        return response.profilePictureID;
    }

    /**
     * Removes currently authenticated user's profile picture.
     *
     * @returns {Promise<void>}
     */
    async removeProfilePicture(){
        await Request.delete(APIEndpoints.USER_PROFILE_PICTURE_REMOVE);
    }

    /**
     * Returns the URL for a given user's profile picture.
     *
     * @param {User} user
     * @param {boolean} [forceRefresh=false]
     *
     * @returns {Promise<?string>}
     *
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async getUserProfilePicture(user, forceRefresh = false){
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        if ( user.getProfilePictureID() === null ){
            return null;
        }
        return await this.#fetchProfilePicture(user.getID(), user.getProfilePictureID(), forceRefresh);
    }

    /**
     * Returns the profile picture URL for a given user represented using a DTO object.
     *
     * @param {User} user
     * @param {boolean} [forceRefresh=false]
     *
     * @returns {Promise<?string>}
     *
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async getProfilePictureFromUserDTO(user, forceRefresh = false){
        if ( !( user instanceof UserDTO ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        if ( user.getProfilePictureID() === null ){
            return null;
        }
        return await this.#fetchProfilePicture(user.getID(), user.getProfilePictureID(), forceRefresh);
    }

    /**
     * Removes a stored user profile picture URL.
     *
     * @param {User} user
     *
     * @returns {UserProfilePictureService}
     *
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    removeLoadedProfilePicture(user){
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        this.#userProfilePictureRepository.removeProfilePicture(user.getID());
        return this;
    }
}

/**
 * @constant {string[]}
 */
Object.defineProperty(UserProfilePictureService, 'ACCEPTED_MIME_TYPES', {
    value: Object.freeze(['image/avif', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
    writable: false
});

export default UserProfilePictureService;
