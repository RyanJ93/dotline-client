'use strict';

import UserRepository from '../../repositories/UserRepository';
import Injector from './Injector';

class UserRepositoryInjector extends Injector {
    inject(){
        return new UserRepository();
    }
}

export default UserRepositoryInjector;
