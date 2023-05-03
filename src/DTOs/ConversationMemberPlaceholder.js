'use strict';

import Serializable from '../support/traits/Serializable';

class ConversationMemberPlaceholder extends Serializable {
    static unserialize(data){
        return new ConversationMemberPlaceholder(JSON.parse(data));
    }

    #encryptionKey;
    #signingKey;
    #userID;

    constructor(properties){
        super();

        this.#encryptionKey = properties.encryptionKey;
        this.#signingKey = properties.signingKey;
        this.#userID = properties.userID;
    }

    getEncryptionKey(){
        return this.#encryptionKey;
    }

    setSigningKey(){
        return this.#signingKey;
    }

    getUserID(){
        return this.#userID;
    }

    toJSON(){
        return {
            encryptionKey: this.#encryptionKey,
            signingKey: this.#signingKey,
            userID: this.#userID
        };
    }

    serialize(){
        return JSON.stringify(this.toJSON());
    }
}

export default ConversationMemberPlaceholder;
