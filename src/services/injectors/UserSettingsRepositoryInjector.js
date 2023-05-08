'use strict';

import UserSettingsRepository from '../../repositories/UserSettingsRepository';
import Injector from './Injector';

class UserSettingsRepositoryInjector extends Injector {
    inject(){
        return new UserSettingsRepository();
    }
}

export default UserSettingsRepositoryInjector;
