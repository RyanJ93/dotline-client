'use strict';

class AuthenticatedUserExportedRSAKeys {
    #AESEncryptionParameters;
    #encryptedRSAPrivateKey;
    #RSAPrivateKey;
    #RSAPublicKey;

    constructor(properties){
        this.#AESEncryptionParameters = properties.AESEncryptionParameters;
        this.#encryptedRSAPrivateKey = properties.encryptedRSAPrivateKey;
        this.#RSAPrivateKey = properties.RSAPrivateKey;
        this.#RSAPublicKey = properties.RSAPublicKey;
    }

    getAESEncryptionParameters(){
        return this.#AESEncryptionParameters;
    }

    getEncryptedRSAPrivateKey(){
        return this.#encryptedRSAPrivateKey;
    }

    getRSAPrivateKey(){
        return this.#RSAPrivateKey;
    }

    getRSAPublicKey(){
        return this.#RSAPublicKey;
    }
}

export default AuthenticatedUserExportedRSAKeys;
