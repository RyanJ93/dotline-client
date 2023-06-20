'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';

/**
 * @typedef StickerPlaceholderProperties
 *
 * @property {string} stickerPackID
 * @property {string} emoji
 * @property {string} id
 */

class StickerPlaceholder {
    /**
     * Generates an instance of this class based on the given JSON serialized sticker.
     *
     * @param {string} serializedSticker
     *
     * @returns {StickerPlaceholder}
     *
     * @throws {IllegalArgumentException} If an invalid serialized sticker is given.
     */
    static makeFromSerializedSticker(serializedSticker){
        if ( serializedSticker === '' || typeof serializedSticker !== 'string' ){
            throw new IllegalArgumentException('Invalid serialized sticker.');
        }
        const properties = JSON.parse(serializedSticker);
        properties.id = properties.stickerID;
        return new StickerPlaceholder(properties);
    }

    /**
     * @type {string}
     *
     * @protected
     */
    _stickerPackID;

    /**
     * @type {string}
     *
     * @protected
     */
    _emoji;

    /**
     * @type {string}
     *
     * @protected
     */
    _id;

    /**
     * The class constructor.
     *
     * @param {StickerPlaceholderProperties} properties
     */
    constructor(properties){
        this._stickerPackID = properties.stickerPackID;
        this._emoji = properties.emoji;
        this._id = properties.id;
    }

    /**
     * Returns the ID of the sticker pack this sticker belongs to.
     *
     * @returns {string}
     */
    getStickerPackID(){
        return this._stickerPackID;
    }

    /**
     * Returns the emoji representing this sticker.
     *
     * @returns {string}
     */
    getEmoji(){
        return this._emoji;
    }

    /**
     * Returns the sticker ID.
     *
     * @returns {string}
     */
    getID(){
        return this._id;
    }

    /**
     * Returns a JSON serialized representation of this class.
     *
     * @returns {string}
     */
    toSerializedSticker(){
        return JSON.stringify({
            stickerPackID: this._stickerPackID,
            stickerID: this._id,
            emoji: this._emoji
        });
    }
}

export default StickerPlaceholder;
