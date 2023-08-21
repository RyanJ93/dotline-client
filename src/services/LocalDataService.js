'use strict';

import ConversationService from '../services/ConversationService';
import databaseSchema from '../support/database/schema';
import MessageSyncService from './MessageSyncService';
import UserService from '../services/UserService';
import Database from '../facades/Database';
import Service from './Service';
import UserSettingsService from './UserSettingsService';

class LocalDataService extends Service {
    /**
     * Drops internal database.
     *
     * @returns {Promise<void>}
     */
    static #dropDatabase(){
        return new Promise((resolve, reject) => {
            const DBDeleteRequest = window.indexedDB.deleteDatabase(databaseSchema.name);
            DBDeleteRequest.onsuccess = () => { resolve() };
            DBDeleteRequest.onerror = () => { reject() };
        });
    }

    /**
     * Drops locally stored information.
     *
     * @param {boolean} [dropSchema=false]
     *
     * @returns {Promise<void>}
     */
    async dropLocalData(dropSchema = false){
        this._eventBroker.emit('localDataCleared');
        const connection = Database.getConnection();
        if ( dropSchema === true ){
            // TODO: find a way to regenerate the database.
        }
        await Promise.all(databaseSchema.tables.map((table) => {
            return connection.clear(table.name);
        }));
    }

    /**
     * Removes and then re-import local data.
     *
     * @param {boolean} [dropSchema=false]
     *
     * @returns {Promise<void>}
     */
    async refreshLocalData(dropSchema = false){
        await this.dropLocalData(dropSchema);
        await this.ensureLocalData();
    }

    /**
     * Ensures and update locally stored data.
     *
     * @returns {Promise<void>}
     */
    async ensureLocalData(){
        const userSettingsService = new UserSettingsService();
        await new UserService().getUserInfo();
        await new ConversationService().fetchConversations();
        await userSettingsService.fetch();
        userSettingsService.applyLocalSettings();
        this._eventBroker.emit('localDataImported');
        new MessageSyncService().initSync();
        //new MessageImportService().initMessageImport();
    }
}

export default LocalDataService;
