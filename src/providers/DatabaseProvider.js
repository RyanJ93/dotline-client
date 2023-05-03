'use strict';

import DatabaseInjector from '../services/injectors/DatabaseInjector';
import InjectionManager from '../support/InjectionManager';
import workerInjector from 'jsstore/dist/worker_injector';
import * as JsStore from 'jsstore';
import Provider from './Provider';

class DatabaseProvider extends Provider {
    async run() {
        const connection = new JsStore.Connection();
        connection.addPlugin(workerInjector);
        // connection.logStatus = true;
        await connection.initDb({
            name: 'dot_line',
            tables: [{
                name: 'conversations',
                columns: {
                    encryptionParameters: { notNull: true, dataType: 'string' },
                    members: { notNull: true, dataType: 'array' },
                    name: { notNull: false, dataType: 'string' },
                    id: { primaryKey: true, dataType: 'string' }
                }
            }, {
                name: 'messages',
                columns: {
                    isSignatureValid: { notNull: true, dataType: 'boolean' },
                    conversationID: { notNull: false, dataType: 'string' },
                    createdAt: { notNull: true, dataType: 'date_time' },
                    updatedAt: { notNull: true, dataType: 'date_time' },
                    isEdited: { notNull: true, dataType: 'boolean' },
                    content: { notNull: true, dataType: 'string' },
                    userID: { notNull: false, dataType: 'string' },
                    type: { notNull: true, dataType: 'string' },
                    id: { notNull: true, dataType: 'string' }
                }
            }, {
                name: 'users',
                columns: {
                    lastAccess: { notNull: false, dataType: 'date_time' },
                    RSAPublicKey: { notNull: true, dataType: 'string' },
                    username: { notNull: true, dataType: 'string' },
                    id: { primaryKey: true, dataType: 'string' }
                }
            }, {
                name: 'conversationMembers',
                columns: {
                    conversationID: { notNull: true, dataType: 'string' },
                    encryptionKey: { notNull: true, dataType: 'string' },
                    userID: { notNull: true, dataType: 'string' }
                }
            }]
        });
        InjectionManager.getInstance().register('database', new DatabaseInjector(connection));
    }
}

export default DatabaseProvider;
