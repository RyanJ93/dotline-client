'use strict';

import UserProfilePictureRepository from '../../repositories/UserProfilePictureRepository';
import Injector from './Injector';

class UserProfilePictureRepositoryInjector extends Injector {
    /**
     * @type {?UserProfilePictureRepository}
     */
    static #instance = null;

    /**
     *
     * @returns {?UserProfilePictureRepository}
     */
    inject(){
        if ( UserProfilePictureRepositoryInjector.#instance === null ){
            UserProfilePictureRepositoryInjector.#instance = new UserProfilePictureRepository();
        }
        return UserProfilePictureRepositoryInjector.#instance;
    }
}

export default UserProfilePictureRepositoryInjector;
