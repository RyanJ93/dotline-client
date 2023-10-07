'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import APIEndpoints from '../enum/APIEndpoints';
import UserSettings from '../DTOs/UserSettings';
import Injector from '../facades/Injector';
import Request from '../facades/Request';
import Locale from '../facades/Locale';
import Service from './Service';

class UserSettingsService extends Service {
    /**
     * @type {UserSettingsRepository}
     */
    #userSettingsRepository;

    /**
     * Triggers events in order to inform listeners user settings have changed.
     *
     * @param {UserSettings} userSettings
     */
    #triggerChangeEvents(userSettings){
        window.setTimeout(() => {
            this._eventBroker.emit('localeChange', userSettings.getLocale());
            this._eventBroker.emit('themeChange', userSettings.getTheme());
        }, 250);
    }

    /**
     * The class constructor.
     */
    constructor(){
        super();

        this.#userSettingsRepository = Injector.inject('UserSettingsRepository');
    }

    /**
     * Applies stored user settings.
     */
    applyLocalSettings(){
        const userSettings = this.#userSettingsRepository.getUserSettings();
        if ( userSettings !== null ){
            document.querySelector('html').setAttribute('data-theme', userSettings.getTheme());
            Locale.changeLanguage(userSettings.getLocale());
            this.#triggerChangeEvents(userSettings);
        }
    }

    /**
     * Fetches and stores user settings.
     *
     * @param {boolean} isSession
     *
     * @returns {Promise<UserSettings>}
     */
    async fetch(isSession = false){
        const response = await Request.get(APIEndpoints.USER_SETTINGS_GET);
        const userSettings = new UserSettings(response.userSettings);
        this.#userSettingsRepository.storeUserSettings(userSettings, isSession);
        this._eventBroker.emit('userSettingsLoaded', userSettings);
        return userSettings;
    }

    /**
     * Updates user settings.
     *
     * @param {string} locale
     * @param {string} theme
     *
     * @returns {Promise<UserSettings>}
     *
     * @throws {IllegalArgumentException} If an invalid locale is given.
     * @throws {IllegalArgumentException} If an invalid theme is given.
     */
    async update(locale, theme){
        if ( locale === '' || typeof locale !== 'string' ){
            throw new IllegalArgumentException('Invalid locale.');
        }
        if ( theme === '' || typeof theme !== 'string' ){
            throw new IllegalArgumentException('Invalid theme.');
        }
        const response = await Request.patch(APIEndpoints.USER_SETTINGS_EDIT, {
            locale: locale,
            theme: theme
        });
        const isSession = this.#userSettingsRepository.storedAsSession();
        const userSettings = new UserSettings(response.userSettings);
        this.#userSettingsRepository.storeUserSettings(userSettings, isSession);
        return userSettings;
    }
}

export default UserSettingsService;
