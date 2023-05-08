'use strict';

import AESEncryptionParameters from './AESEncryptionParameters';
import User from './User';

class AuthenticatedUser extends User {
    /**
     *
     * @param response
     * @returns {AuthenticatedUser}
     */
    static makeFromHTTPResponse(response){
        return new AuthenticatedUser(response.user);
    }

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

    toJSON(){
        const object = super.toJSON();
        object.RSAPrivateKeyEncryptionParameters = this.#RSAPrivateKeyEncryptionParameters;
        object.RSAPrivateKey = this.#RSAPrivateKey;
        return object;
    }
}

export default AuthenticatedUser;
