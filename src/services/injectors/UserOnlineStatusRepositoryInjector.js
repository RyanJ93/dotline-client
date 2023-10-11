'use strict';

import UserOnlineStatusRepository from '../../repositories/UserOnlineStatusRepository';
import Injector from './Injector';

class UserOnlineStatusRepositoryInjector extends Injector {
    /**
     * @type {?UserOnlineStatusRepository}
     */
    static #instance = null;

    inject(){
        if ( UserOnlineStatusRepositoryInjector.#instance === null ){
            UserOnlineStatusRepositoryInjector.#instance = new UserOnlineStatusRepository();
        }
        return UserOnlineStatusRepositoryInjector.#instance;
    }
}

export default UserOnlineStatusRepositoryInjector;
