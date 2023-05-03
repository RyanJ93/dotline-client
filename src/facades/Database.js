'use strict';

import Injector from './Injector.js';
import Facade from './Facade.js';

class Database extends Facade {
    /**
     * Returns the connection to the database.
     *
     * @returns {JsStore.Connection}
     */
    static getConnection(){
        return Injector.inject('database');
    }
}

export default Database;
