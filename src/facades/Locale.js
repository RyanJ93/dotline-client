'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import supported_locales from '../support/locales/supported_locales';
import Facade from './Facade';
import i18n from 'i18next';

class Locale extends Facade {
    /**
     * Changes the application language.
     *
     * @param {string} language
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid language is given.
     */
    static async changeLanguage(language){
        if ( language === '' || typeof language !== 'string' ){
            throw new IllegalArgumentException('Invalid language.');
        }
        const index = language.indexOf('-');
        if ( index > 0 ){
            language = language.substring(0, index);
        }
        return await i18n.changeLanguage(language);
    }

    /**
     * Returns the code of the locale being used.
     *
     * @returns {string}
     */
    static getCurrentLocale(){
        return i18n.language;
    }

    /**
     * Returns all the properties of the locale being used.
     *
     * @returns {?LocaleProperties}
     */
    static getCurrentLocaleProperties(){
        let currentLocale = Locale.getCurrentLocale(), currentLocaleProperties = null, i = 0;
        while ( currentLocaleProperties === null && i < supported_locales.length ){
            if ( supported_locales[i].code === currentLocale ){
                currentLocaleProperties = supported_locales[i];
            }
            i++;
        }
        return currentLocaleProperties;
    }

    /**
     * Returns all the supported locales.
     *
     * @returns {LocaleProperties[]}
     */
    static getSupportedLocales(){
        return supported_locales;
    }
}

export default Locale;
