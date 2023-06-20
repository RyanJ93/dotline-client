'use strict';

import APIEndpoints from '../enum/APIEndpoints';
import BinaryUtils from '../utils/BinaryUtils';
import StickerPack from '../DTOs/StickerPack';
import Injector from '../facades/Injector';
import Request from '../facades/Request';
import Service from './Service';

class StickerPackService extends Service {
    /**
     * @type {StickerPackRepository}
     */
    #stickerPackRepository;

    /**
     * The class constructor.
     */
    constructor(){
        super();

        this.#stickerPackRepository = Injector.inject('StickerPackRepository');
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
        return this.#stickerPackRepository.findByID(stickerPackID);
    }

    /**
     * Fetches all the available sticker packs.
     *
     * @returns {Promise<StickerPack[]>}
     */
    async fetchStickerPacks(){
        this.#stickerPackRepository.dropStickerPackList();
        const response = await Request.get(APIEndpoints.STICKER_PACK_LIST);
        const stickerPackList = response.stickerPackList.map((stickerPack) => {
            stickerPack.coverPictureURL = BinaryUtils.createObjectURLFromDataURI(stickerPack.coverPicture);
            stickerPack.createdAt = new Date(stickerPack.createdAt);
            return new StickerPack(stickerPack);
        });
        this.#stickerPackRepository.storeStickerPackList(stickerPackList);
        return stickerPackList;
    }

    /**
     * Returns all the stored sticker packs or null if no sticker pack has been loaded yet.
     *
     * @returns {?StickerPack[]}
     */
    getStickerPackList(){
        return this.#stickerPackRepository.getStickerPackList();
    }
}

export default StickerPackService;
