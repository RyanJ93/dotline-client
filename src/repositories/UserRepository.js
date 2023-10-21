'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import DateUtils from '../utils/DateUtils';
import Repository from './Repository';
import User from '../models/User';

/**
 * @typedef UserStoreProperties
 *
 * @property {string} RSAPublicKey
 * @property {?string} lastAccess
 * @property {string} username
 * @property {?string} surname
 * @property {?string} name
 * @property {string} id
 */

class UserRepository extends Repository {
    /**
     * Creates or replaces a user.
     *
     * @param {UserStoreProperties} properties
     *
     * @returns {Promise<User>}
     *
     * @throws {IllegalArgumentException} If an invalid properties object is given.
     * @throws {IllegalArgumentException} If an invalid last access date is given.
     * @throws {IllegalArgumentException} If an invalid RSA public key is given.
     * @throws {IllegalArgumentException} If an invalid username is given.
     * @throws {IllegalArgumentException} If an invalid surname is given.
     * @throws {IllegalArgumentException} If an invalid name is given.
     * @throws {IllegalArgumentException} If an invalid ID is given.
     */
    async store(properties){
        if ( properties === null || typeof properties !== 'object' ){
            throw new IllegalArgumentException('Invalid properties.');
        }
        if ( properties.surname !== null && ( properties.surname === '' || typeof properties.surname !== 'string' ) ){
            throw new IllegalArgumentException('Invalid surname.');
        }
        if ( properties.name !== null && ( properties.name === '' || typeof properties.name !== 'string' ) ){
            throw new IllegalArgumentException('Invalid name.');
        }
        if ( properties.RSAPublicKey === '' || typeof properties.RSAPublicKey !== 'string' ){
            throw new IllegalArgumentException('Invalid RSA public key.');
        }
        if ( properties.lastAccess !== null && !DateUtils.isDate(properties.lastAccess) ){
            throw new IllegalArgumentException('Invalid last access date.');
        }
        if ( properties.username === '' || typeof properties.username !== 'string' ){
            throw new IllegalArgumentException('Invalid username.');
        }
        if ( properties.id === '' || typeof properties.id !== 'string' ){
            throw new IllegalArgumentException('Invalid ID.');
        }
        const user = new User();
        user.setProfilePictureID(properties.profilePictureID);
        user.setRSAPublicKey(properties.RSAPublicKey);
        user.setLastAccess(properties.lastAccess);
        user.setUsername(properties.username);
        user.setSurname(properties.surname);
        user.setName(properties.name);
        user.setID(properties.id);
        await user.save();
        return user;
    }

    /**
     * Finds multiple users based on the given user IS list.
     *
     * @param {string[]} userIDList
     *
     * @returns {Promise<User[]>}
     *
     * @throws {IllegalArgumentException} If an invalid user ID list is given.
     */
    async findMany(userIDList){
        if ( !Array.isArray(userIDList) ){
            throw new IllegalArgumentException('Invalid user ID list.');
        }
        return await User.findAll({ id: userIDList });
    }

    /**
     * Finds n user matching the given ID.
     *
     * @param {string} id
     *
     * @returns {Promise<User>}
     *
     * @throws {IllegalArgumentException} If an invalid user ID is given.
     */
    async find(id){
        if ( id === '' || typeof id !== 'string' ){
            throw new IllegalArgumentException('Invalid user ID.');
        }
        return await User.find({ id: id });
    }

    /**
     * Updates user's profile picture ID.
     *
     * @param {User} user
     * @param {?string} profilePictureID
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid profile picture ID is given.
     * @throws {IllegalArgumentException} If an invalid user is given.
     */
    async updateProfilePictureID(user, profilePictureID){
        if ( profilePictureID !== null && ( profilePictureID === '' || typeof profilePictureID !== 'string' ) ){
            throw new IllegalArgumentException('Invalid profile picture ID.');
        }
        if ( !( user instanceof User ) ){
            throw new IllegalArgumentException('Invalid user.');
        }
        await user.setProfilePictureID(profilePictureID).save();
    }
}

export default UserRepository;
