'use strict';

import { initReactI18next } from 'react-i18next';
import backend from 'i18next-xhr-backend';
import Provider from './Provider';
import i18n from 'i18next';

class LocaleProvider extends Provider {
    #setupI18n(){
        const localeSeparator = navigator.language.indexOf('-');
        const language = localeSeparator === -1 ? navigator.language : navigator.language.substr(0, localeSeparator);
        return i18n.use(initReactI18next).use(backend).init({
            fallbackLng: 'en',
            lng: language,
            backend: {
                addPath: 'locales/{{lng}}.missing.json',
                loadPath: 'locales/{{lng}}.json'
            }
        });
    }

    async run(){
        await this.#setupI18n();
        window.changeLanguage = (language) => i18n.changeLanguage(language);
    }
}

export default LocaleProvider;
