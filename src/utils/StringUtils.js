'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';

class StringUtils {
    /**
     * Returns a string representation of a given size in bytes.
     *
     * @param {number} size
     *
     * @returns {string}
     *
     * @throws {IllegalArgumentException} If an invalid size is given.
     */
    static sizeToHumanReadableString(size){
        if ( size === null || isNaN(size) || size < 0 ){
            throw new IllegalArgumentException('Invalid size.');
        }
        let i = 0, multipleName = 'Bytes', humanReadableString;
        while ( Math.floor(size / 1024) > 0 && i < StringUtils.SIZE_MULTIPLES.length ){
            multipleName = StringUtils.SIZE_MULTIPLES[i];
            size = size / 1024;
            i++;
        }
        humanReadableString = ( i === 0 ? size : ( Math.round(size * 100) / 100 ) ) + ' ' + multipleName;
        return humanReadableString;
    }

    /**
     * Checks if the given string contains one single character and that's an emoji.
     *
     * @param {string} string
     *
     * @returns {boolean}
     */
    static isSingleEmoji(string){
        return typeof string === 'string' && string.length === 2 && /\p{Emoji}/u.test(string);
    }

    /**
     * Checks if the given username is a valid one.
     *
     * @param {string} username
     *
     * @returns {boolean}
     *
     * @throws {IllegalArgumentException} If an invalid username string is given.
     */
    static isValidUsername(username){
        if ( typeof username !== 'string' ){
            throw new IllegalArgumentException('Invalid username.');
        }
        return username !== '' && /[a-z0-9.-_]{3,16}/i.test(username);
    }
}

/**
 * @constant {string[]}
 */
Object.defineProperty(StringUtils, 'SIZE_MULTIPLES', {
    value: Object.freeze(['KB', 'MB', 'GB', 'TB']),
    writable: false
});

export default StringUtils;
