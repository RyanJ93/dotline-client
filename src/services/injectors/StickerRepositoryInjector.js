'use strict';

import StickerRepository from '../../repositories/StickerRepository';
import Injector from './Injector';

class StickerRepositoryInjector extends Injector {
    /**
     * @type {?StickerRepository}
     */
    #stickerRepository = null;

    inject(){
        if ( this.#stickerRepository === null ){
            this.#stickerRepository = new StickerRepository();
        }
        return this.#stickerRepository;
    }
}

export default StickerRepositoryInjector;
