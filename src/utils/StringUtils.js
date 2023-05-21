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
}

/**
 * @constant {string[]}
 */
Object.defineProperty(StringUtils, 'SIZE_MULTIPLES', {
    value: Object.freeze(['KB', 'MB', 'GB', 'TB']),
    writable: false
});

export default StringUtils;
