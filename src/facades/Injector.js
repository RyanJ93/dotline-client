'use strict';

import InjectionManager from '../support/InjectionManager.js';
import Facade from './Facade.js';

class Injector extends Facade {
    /**
     * Injects an injectable registered asset given its name.
     *
     * @param {string} name
     * @param {any[]} parameters
     *
     * @returns {?Injectable}
     */
    static inject(name, parameters = []){
        return InjectionManager.getInstance().inject(name, parameters);
    }
}

export default Injector;
