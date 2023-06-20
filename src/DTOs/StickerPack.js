'use strict';

/**
 * @typedef StickerPackProperties
 *
 * @property {string} coverPictureURL
 * @property {boolean} [loaded=false]
 * @property {Date} createdAt
 * @property {string} name
 * @property {string} id
 */

class StickerPack {
    /**
     * @type {string}
     */
    #coverPictureURL;

    /**
     * @type {Date}
     */
    #createdAt;

    /**
     * @type {boolean}
     */
    #loaded;

    /**
     * @type {string}
     */
    #name;

    /**
     * @type {string}
     */
    #id;

    /**
     * The class constructor.
     *
     * @param {StickerPackProperties} properties
     */
    constructor(properties){
        this.#coverPictureURL = properties.coverPictureURL;
        this.#loaded = properties.loaded ?? false;
        this.#createdAt = properties.createdAt;
        this.#name = properties.name;
        this.#id = properties.id;
    }

    /**
     * Returns the cover picture URL.
     *
     * @returns {string}
     */
    getCoverPictureURL(){
        return this.#coverPictureURL;
    }

    /**
     * Returns the sticker pack creation date.
     *
     * @returns {Date}
     */
    getCreatedAt(){
        return this.#createdAt;
    }

    /**
     * Sets if the stickers contained within this sticker pack have been loaded or not.
     *
     * @param {boolean} loaded
     *
     * @returns {StickerPack}
     */
    setLoaded(loaded){
        this.#loaded = loaded === true;
        return this;
    }

    /**
     * Returns if the stickers contained within this sticker pack have been loaded or not.
     *
     * @returns {boolean}
     */
    getLoaded(){
        return this.#loaded;
    }

    /**
     * Returns the pack's name.
     *
     * @returns {string}
     */
    getName(){
        return this.#name;
    }

    /**
     * Returns the pack's ID.
     *
     * @returns {string}
     */
    getID(){
        return this.#id;
    }
}

export default StickerPack;
