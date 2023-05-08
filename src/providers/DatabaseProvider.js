'use strict';

import DatabaseInjector from '../services/injectors/DatabaseInjector';
import InjectionManager from '../support/InjectionManager';
import workerInjector from 'jsstore/dist/worker_injector';
import databaseSchema from '../support/database/schema';
import * as JsStore from 'jsstore';
import Provider from './Provider';

class DatabaseProvider extends Provider {
    /**
     * Sets up local database and its connection.
     *
     * @returns {Promise<void>}
     */
    async run() {
        const connection = new JsStore.Connection();
        connection.addPlugin(workerInjector);
        // connection.logStatus = true;
        await connection.initDb(databaseSchema);
        InjectionManager.getInstance().register('database', new DatabaseInjector(connection));
    }
}

export default DatabaseProvider;
