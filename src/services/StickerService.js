'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import NotFoundException from '../exceptions/NotFoundException';
import StickerPlaceholder from '../DTOs/StickerPlaceholder';
import APIEndpoints from '../enum/APIEndpoints';
import BinaryUtils from '../utils/BinaryUtils';
import Injector from '../facades/Injector';
import Request from '../facades/Request';
import Sticker from '../DTOs/Sticker';
import Service from './Service';
import StickerPackService from './StickerPackService';

class StickerService extends Service {
    /**
     * @type {StickerRepository}
     */
    #stickerRepository;

    /**
     * The class constructor.
     */
    constructor(){
        super();

        this.#stickerRepository = Injector.inject('StickerRepository');
    }

    /**
     * Fetches all the stickers contained within a given pack ID.
     *
     * @param {string} stickerPackID
     *
     * @returns {Promise<Sticker[]>}
     */
    async fetchStickerPack(stickerPackID){
        const response = await Request.get(APIEndpoints.STICKER_LIST.replace(':stickerPackID', stickerPackID));
        new StickerPackService().findByID(stickerPackID)?.setLoaded(true);
        return response.stickerList.map((stickerProperties) => {
            stickerProperties.contentURL = BinaryUtils.createObjectURLFromDataURI(stickerProperties.content);
            stickerProperties.stickerPackID = stickerPackID;
            const sticker = new Sticker(stickerProperties);
            this.#stickerRepository.storeSticker(sticker);
            return sticker;
        });
    }

    /**
     * Fetches a single sticker given its ID and the ID of the sticker pack it belongs to.
     *
     * @param {string} stickerPackID
     * @param {string} stickerID
     *
     * @returns {Promise<?Sticker>}
     *
     * @throws {IllegalArgumentException} If an invalid sticker pack ID is given.
     * @throws {IllegalArgumentException} If an invalid sticker ID is given.
     */
    async fetchSticker(stickerPackID, stickerID){
        if ( stickerPackID === '' || typeof stickerPackID !== 'string' ){
            throw new IllegalArgumentException('Invalid sticker pack ID.');
        }
        if ( stickerID === '' || typeof stickerID !== 'string' ){
            throw new IllegalArgumentException('Invalid sticker ID.');
        }
        try{
            const url = APIEndpoints.STICKER_GET.replace(':stickerID', stickerID);
            const response = await Request.get(url.replace(':stickerPackID', stickerPackID));
            response.sticker.contentURL = BinaryUtils.createObjectURLFromDataURI(response.sticker.content);
            response.sticker.stickerPackID = stickerPackID;
            const sticker = new Sticker(response.sticker);
            this.#stickerRepository.storeSticker(sticker);
            return sticker;
        }catch(ex){
            if ( !( ex instanceof NotFoundException ) ){
                throw ex;
            }
            return null;
        }
    }

    /**
     * Returns a loaded sticker, if not present it will be fetched from the server.
     *
     * @param {StickerPlaceholder} stickerPlaceholder
     *
     * @returns {Promise<?Sticker>}
     *
     * @throws {IllegalArgumentException} If an invalid sticker placeholder is given.
     */
    async assertStickerFromPlaceholder(stickerPlaceholder){
        if ( !( stickerPlaceholder instanceof StickerPlaceholder ) ){
            throw new IllegalArgumentException('Invalid sticker placeholder.');
        }
        return await this.assertSticker(stickerPlaceholder.getStickerPackID(), stickerPlaceholder.getID());
    }

    /**
     * Returns a loaded sticker, if not present it will be fetched from the server.
     *
     * @param {string} stickerPackID
     * @param {string} stickerID
     *
     * @returns {Promise<?Sticker>}
     *
     * @throws {IllegalArgumentException} If an invalid sticker pack ID is given.
     * @throws {IllegalArgumentException} If an invalid sticker ID is given.
     */
    async assertSticker(stickerPackID, stickerID){
        let sticker = this.#stickerRepository.getStickerByID(stickerPackID, stickerID);
        if ( sticker === null ){
            sticker = await this.fetchSticker(stickerPackID, stickerID);
        }
        return sticker;
    }

    /**
     * Returns, possibly fetching before, stickers contained within a given pack.
     *
     * @param {string} stickerPackID
     *
     * @returns {Promise<Sticker[]>}
     *
     * @throws {IllegalArgumentException} If an invalid sticker pack ID is given.
     */
    async getStickers(stickerPackID){
        let stickerPack = new StickerPackService().findByID(stickerPackID), stickerList;
        if ( stickerPack?.getLoaded() === true ){
            stickerList = this.#stickerRepository.getStickers(stickerPackID);
        }else{
            stickerList = await this.fetchStickerPack(stickerPackID);
        }
        return stickerList;
    }
}

export default StickerService;
