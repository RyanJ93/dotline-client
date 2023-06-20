'use strict';

import StickerPackRepository from '../../repositories/StickerPackRepository';
import Injector from './Injector';

class StickerPackRepositoryInjector extends Injector {
    /**
     * @type {?StickerPackRepository}
     */
    #stickerPackRepository = null;

    inject(){
        if ( this.#stickerPackRepository === null ){
            this.#stickerPackRepository = new StickerPackRepository();
        }
        return this.#stickerPackRepository;
    }
}

export default StickerPackRepositoryInjector;
