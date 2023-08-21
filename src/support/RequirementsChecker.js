'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import { compareVersions } from 'compare-versions';
import App from '../facades/App';

class RequirementsChecker {
    /**
     * Checks if the browser being used is supported or not.
     *
     * @returns {boolean}
     */
    static isBrowserSupported(){
        let isBrowserSupported = true;
        for ( const requiredAPIName in RequirementsChecker.REQUIRED_API_ASSERT_CHECKLIST ){
            if ( !RequirementsChecker.REQUIRED_API_ASSERT_CHECKLIST[requiredAPIName]() ){
                console.warn('Unsupported API detected: ' + requiredAPIName);
                isBrowserSupported = false;
            }
        }
        return isBrowserSupported;
    }

    /**
     * Checks if the given server version is supported by this client.
     *
     * @param {string} serverVersion
     *
     * @returns {boolean}
     *
     * @throws {IllegalArgumentException} If an invalid server version is given.
     */
    static isServerSupported(serverVersion){
        if ( serverVersion === '' || typeof serverVersion !== 'string' ){
            throw new IllegalArgumentException('Invalid server version.');
        }
        return compareVersions(serverVersion, App.getVersion()) === 0;
    }
}

/**
 * @constant {Object.<string, Function>}
 */
Object.defineProperty(RequirementsChecker, 'REQUIRED_API_ASSERT_CHECKLIST', {
    value: {
        ['Web Crypto']: () => { return ( typeof window.crypto?.subtle  === 'object' && window.crypto?.subtle !== null ) },
        ['IndexedDB']: () => { return ( typeof window.indexedDB === 'object' && window.indexedDB !== null ) },
        ['IntersectionObserver']: () => { return ( typeof window.IntersectionObserver === 'function' ) },
        ['Drag-n-drop']: () => { return ( 'draggable' in document.createElement('span') ) },
        ['Web Audio']: () => { return ( !!document.createElement('audio').canPlayType ) },
        ['Geolocation']: () => { return ( typeof window.Geolocation === 'function' ) },
        ['File API']: () => { return ( typeof window.FileReader === 'function' ) }
    },
    writable: false
});

export default RequirementsChecker;
