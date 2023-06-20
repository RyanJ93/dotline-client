'use strict';

import StickerPlaceholder from './StickerPlaceholder';

/**
 * @typedef {StickerPlaceholderProperties} StickerProperties
 *
 * @property {string} contentURL
 * @property {boolean} animated
 */

class Sticker extends StickerPlaceholder {
    /**
     * @type {string}
     */
    #contentURL;

    /**
     * @type {boolean}
     */
    #animated;

    /**
     * The class constructor.
     *
     * @param {StickerProperties} properties
     */
    constructor(properties){
        super(properties);

        this.#contentURL = properties.contentURL;
        this.#animated = properties.animated;
    }

    /**
     * Returns the content URL.
     *
     * @returns {string}
     */
    getContentURL(){
        return this.#contentURL;
    }

    /**
     * Returns true if this sticker is animated, false otherwise.
     *
     * @returns {boolean}
     */
    getAnimated(){
        return this.#animated;
    }
}

export default Sticker;
