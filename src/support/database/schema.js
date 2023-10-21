'use strict';

export default Object.freeze({
    name: 'dot_line',
    tables: [{
        name: 'conversations',
        columns: {
            _primaryKey: { primaryKey: true, dataType: 'string' },
            encryptionParameters: { notNull: true, dataType: 'string' },
            members: { notNull: true, dataType: 'array' },
            name: { notNull: false, dataType: 'string' },
            id: { dataType: 'string' }
        }
    }, {
        name: 'messages',
        columns: {
            _primaryKey: { primaryKey: true, dataType: 'string' },
            isSignatureValid: { notNull: true, dataType: 'boolean' },
            conversationID: { notNull: true, dataType: 'string' },
            createdAt: { notNull: true, dataType: 'date_time' },
            updatedAt: { notNull: true, dataType: 'date_time' },
            attachments: { notNull: true, dataType: 'array' },
            isEdited: { notNull: true, dataType: 'boolean' },
            content: { notNull: true, dataType: 'string' },
            userID: { notNull: false, dataType: 'string' },
            read: { notNull: false, dataType: 'boolean' },
            type: { notNull: true, dataType: 'string' },
            id: { notNull: true, dataType: 'string' }
        }
    }, {
        name: 'users',
        columns: {
            _primaryKey: { primaryKey: true, dataType: 'string' },
            profilePictureID: { notNull: false, dataType: 'string' },
            lastAccess: { notNull: false, dataType: 'date_time' },
            RSAPublicKey: { notNull: true, dataType: 'string' },
            username: { notNull: true, dataType: 'string' },
            surname: { notNull: false, dataType: 'string' },
            name: { notNull: false, dataType: 'string' },
            id: { notNull: true, dataType: 'string' }
        }
    }, {
        name: 'message_commit_checkpoints',
        columns: {
            _primaryKey: { primaryKey: true, dataType: 'string' },
            messageCommitID: { notNull: true, dataType: 'string' },
            conversationID: { notNull: true, dataType: 'string' },
            date: { notNull: true, dataType: 'date_time' },
            type: { notNull: true, dataType: 'string' }
        }
    }]
});
