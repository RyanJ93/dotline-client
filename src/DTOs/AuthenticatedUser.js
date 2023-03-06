'use strict';

import AESEncryptionParameters from './AESEncryptionParameters';
import User from './User';

class AuthenticatedUser extends User {
    #RSAPrivateKeyEncryptionParameters;
    #RSAPrivateKey;

    constructor(properties){
        super(properties);

        this.#RSAPrivateKeyEncryptionParameters = new AESEncryptionParameters(properties.RSAPrivateKeyEncryptionParameters);
        this.#RSAPrivateKey = properties.RSAPrivateKey;
    }

    getRSAPrivateKeyEncryptionParameters(){
        return this.#RSAPrivateKeyEncryptionParameters;
    }

    getRSAPrivateKey(){
        return this.#RSAPrivateKey;
    }
}

export default AuthenticatedUser;
