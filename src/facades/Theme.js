'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import Facade from './Facade';

class Theme extends Facade {
    /**
     * Detects the theme being used.
     *
     * @returns {string}
     */
    static detectTheme(){
        let detectedTheme = 'light', definedTheme = document.querySelector('html').getAttribute('data-theme');
        if ( definedTheme !== '' && typeof definedTheme === 'string' ){
            detectedTheme = definedTheme;
        }else if ( typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches ){
            detectedTheme = 'dark';
        }
        return detectedTheme;
    }

    /**
     * Sets the theme to use.
     *
     * @param {string} theme
     *
     * @throws {IllegalArgumentException} If an invalid theme is given.
     */
    static setTheme(theme){
        if ( theme === '' || typeof theme !== 'string' ){
            throw new IllegalArgumentException('Invalid theme.');
        }
        document.querySelector('html').setAttribute('data-theme', theme);
    }
}

export default Theme;
