'use strict';

/**
 * @typedef UserSettingsProperties
 *
 * @property {string} locale
 * @property {string} theme
 */

class UserSettings {
    /**
     * Makes an instance of this class based on the body of a given HTTP response.
     *
     * @param {Response} response
     *
     * @returns {UserSettings}
     */
    static makeFromHTTPResponse(response){
        return new UserSettings(response.userSettings);
    }

    /**
     * Generates a user settings object containing the default settings.
     *
     * @returns {UserSettings}
     */
    static makeDefaultUserSettingsObject(){
        return new UserSettings({
            locale: UserSettings.DEFAULT_LOCALE,
            theme: UserSettings.DEFAULT_THEME
        });
    }

    /**
     * @type {string}
     */
    #locale;

    /**
     * @type {string}
     */
    #theme;

    /**
     * The class constructor.
     *
     * @param {UserSettingsProperties} properties
     */
    constructor(properties){
        this.#locale = properties.locale;
        this.#theme = properties.theme;
    }

    /**
     * Returns the user defined locale.
     *
     * @returns {string}
     */
    getLocale(){
        return this.#locale;
    }

    /**
     * Returns the user defined theme.
     *
     * @returns {string}
     */
    getTheme(){
        return this.#theme;
    }

    /**
     * Generates a JSON representation of this class.
     *
     * @returns {UserSettingsProperties}
     */
    toJSON(){
        return {
            locale: this.#locale,
            theme: this.#theme
        };
    }
}

/**
 * @constant {string}
 */
Object.defineProperty(UserSettings, 'DEFAULT_LOCALE', {
    value: 'en',
    writable: false
});

/**
 * @constant {string}
 */
Object.defineProperty(UserSettings, 'DEFAULT_THEME', {
    value: 'auto',
    writable: false
});

export default UserSettings;
