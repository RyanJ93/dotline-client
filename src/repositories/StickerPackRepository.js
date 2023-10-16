'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import Repository from './Repository';

class StickerPackRepository extends Repository {
    /**
     * @type {?Object.<string, StickerPack>}
     */
    #stickerPacks = null;

    /**
     * Stores a given sticker pack list.
     *
     * @param {StickerPack[]} stickerPackList
     *
     * @returns {StickerPackRepository}
     *
     * @throws {IllegalArgumentException} If an invalid sticker pack list is given.
     */
    storeStickerPackList(stickerPackList){
        if ( !Array.isArray(stickerPackList) ){
            throw new IllegalArgumentException('Invalid sticker pack list.');
        }
        this.dropStickerPackList();
        stickerPackList.forEach((stickerPack) => {
            this.#stickerPacks[stickerPack.getID()] = stickerPack;
        });
        return this;
    }

    /**
     * Drops all the stored sticker packs.
     *
     * @returns {StickerPackRepository}
     */
    dropStickerPackList(){
        this.#stickerPacks= Object.create(null);
        return this;
    }

    /**
     * Returns the sticker pack matching the given ID or nll if none was found.
     *
     * @param {string} stickerPackID
     *
     * @returns {?StickerPack}
     *
     * @throws {IllegalArgumentException} If an invalid sticker pack ID is given.
     */
    findByID(stickerPackID){
        if ( stickerPackID === '' || typeof stickerPackID !== 'string' ){
            throw new IllegalArgumentException('Invalid sticker pack ID');
        }
        return this.#stickerPacks === null ? null : ( this.#stickerPacks[stickerPackID] ?? null );
    }

    /**
     * Returns all the stored sticker packs or null if no sticker pack has been loaded yet.
     *
     * @returns {?StickerPack[]}
     */
    getStickerPackList(){
        return this.#stickerPacks === null ? null : Object.values(this.#stickerPacks);
    }
}

export default StickerPackRepository;
