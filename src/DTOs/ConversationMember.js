'use strict';

class ConversationMember {
    #encryptionKey;
    #signingKey;
    #user;

    constructor(properties){
        this.#encryptionKey = properties.encryptionKey;
        this.#signingKey = properties.signingKey;
        this.#user = properties.user;
    }

    getEncryptionKey(){
        return this.#encryptionKey;
    }

    getSigningKey(){
        return this.#signingKey;
    }

    getUser(){
        return this.#user;
    }

    toJSON(){
        return {
            encryptionKey: this.#encryptionKey,
            signingKey: this.#signingKey,
            user: this.#user
        };
    }
}

export default ConversationMember;
