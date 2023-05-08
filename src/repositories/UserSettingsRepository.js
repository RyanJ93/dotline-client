'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import UserSettings from '../DTOs/UserSettings';
import Repository from './Repository';

class UserSettingsRepository extends Repository {
    /**
     * @type {?UserSettings}
     */
    #userSettings = null;

    /**
     * Stores the given user settings object.
     *
     * @param {UserSettings} userSettings
     * @param {boolean} [isSession=false]
     *
     * @throws {IllegalArgumentException} If some invalid user settings are given.
     */
    storeUserSettings(userSettings, isSession = false){
        if ( !( userSettings instanceof UserSettings ) ){
            throw new IllegalArgumentException('Invalid user settings.');
        }
        const storage = isSession === true ? window.sessionStorage : window.localStorage;
        storage.setItem('userSettings', JSON.stringify(userSettings));
        this.#userSettings = userSettings;
    }

    /**
     * Returns if user settings have been stored as session or not.
     *
     * @returns {boolean}
     */
    storedAsSession(){
        const jsonString = window.sessionStorage.getItem('userSettings');
        return typeof jsonString == 'string' && jsonString !== '';
    }

    /**
     * Returns the user settings defined.
     *
     * @returns {?UserSettings}
     */
    getUserSettings(){
        if ( this.#userSettings === null ){
            const storage = this.storedAsSession() ? window.sessionStorage : window.localStorage;
            this.#userSettings = UserSettings.makeDefaultUserSettingsObject();
            const jsonString = storage.getItem('userSettings');
            if ( typeof jsonString === 'string' ){
                this.#userSettings = new UserSettings(JSON.parse(jsonString));
            }
        }
        return this.#userSettings;
    }

    /**
     * Drops saved user settings.
     */
    dropUserSettings(){
        window.sessionStorage.removeItem('userSettings');
        window.localStorage.removeItem('userSettings');
        this.#userSettings = null;
    }
}

export default UserSettingsRepository;
