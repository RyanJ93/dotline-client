'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import Repository from './Repository';
import Sticker from '../DTOs/Sticker';

class StickerRepository extends Repository {
    /**
     * @type {Object.<string, Object.<string, Sticker>>}
     */
    #stickers = Object.create(null);

    /**
     * Checks if a sticker pack has been loaded.
     *
     * @param {string} stickerPackID
     *
     * @returns {boolean}
     *
     * @throws {IllegalArgumentException} If an invalid sticker pack ID is given.
     */
    stickerPackExists(stickerPackID){
        if ( stickerPackID === '' || typeof stickerPackID !== 'string' ){
            throw new IllegalArgumentException('Invalid sticker pack ID.');
        }
        return typeof this.#stickers[stickerPackID] !== 'undefined';
    }

    /**
     * Checks if a sticker has been loaded.
     *
     * @param {string} stickerPackID
     * @param {string} stickerID
     *
     * @returns {boolean}
     *
     * @throws {IllegalArgumentException} If an invalid sticker pack ID is given.
     * @throws {IllegalArgumentException} If an invalid sticker ID is given.
     */
    stickerExistsByID(stickerPackID, stickerID){
        if ( stickerID === '' || typeof stickerID !== 'string' ){
            throw new IllegalArgumentException('Invalid sticker ID.');
        }
        return this.stickerPackExists(stickerPackID) && this.#stickers[stickerPackID][stickerID] instanceof Sticker;
    }

    /**
     * Returns all the stickers stored belonging to a given sticker pack ID.
     *
     * @param {string} stickerPackID
     *
     * @returns {?Sticker[]}
     *
     * @throws {IllegalArgumentException} If an invalid sticker pack ID is given.
     */
    getStickers(stickerPackID){
        let stickerList = null;
        if ( typeof this.#stickers[stickerPackID] !== 'undefined' ){
            stickerList = Object.values(this.#stickers[stickerPackID]);
        }
        return stickerList;
    }

    /**
     * Returns a sticker matching the given sticker and sticker pack ID.
     *
     * @param {string} stickerPackID
     * @param {string} stickerID
     *
     * @returns {?Sticker}
     *
     * @throws {IllegalArgumentException} If an invalid sticker pack ID is given.
     * @throws {IllegalArgumentException} If an invalid sticker ID is given.
     */
    getStickerByID(stickerPackID, stickerID){
        if ( stickerPackID === '' || typeof stickerPackID !== 'string' ){
            throw new IllegalArgumentException('Invalid sticker pack ID.');
        }
        if ( stickerID === '' || typeof stickerID !== 'string' ){
            throw new IllegalArgumentException('Invalid sticker ID.');
        }
        let sticker = null;
        if ( typeof this.#stickers[stickerPackID] !== 'undefined' ){
            if ( this.#stickers[stickerPackID][stickerID] instanceof Sticker ){
                sticker = this.#stickers[stickerPackID][stickerID];
            }
        }
        return sticker;
    }

    /**
     * Stores a given sticker.
     *
     * @param {Sticker} sticker
     *
     * @throws {IllegalArgumentException} If an invalid sticker is given.
     */
    storeSticker(sticker){
        if ( !( sticker instanceof Sticker ) ){
            throw new IllegalArgumentException('Invalid sticker.');
        }
        const stickerPackID = sticker.getStickerPackID();
        if ( typeof this.#stickers[stickerPackID] === 'undefined' ){
            this.#stickers[stickerPackID] = Object.create(null);
        }
        this.#stickers[stickerPackID][sticker.getID()] = sticker;
    }

    /**
     * Removes a given sticker.
     *
     * @param {Sticker} sticker
     *
     * @throws {IllegalArgumentException} If an invalid sticker is given.
     */
    deleteSticker(sticker){
        if ( !( sticker instanceof Sticker ) ){
            throw new IllegalArgumentException('Invalid sticker.');
        }
        const stickerPackID = sticker.getStickerPackID();
        if ( typeof this.#stickers[stickerPackID] !== 'undefined' ){
            delete this.#stickers[stickerPackID][sticker.getID()];
        }
    }

    /**
     * Drops all the stored tickers.
     */
    dropStickers(){
        this.#stickers = Object.create(null);
    }
}

export default StickerRepository;
