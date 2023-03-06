'use strict';
class AESEncryptionParameters {
    #keyLength;
    #mode;
    #iv;

    constructor(properties){
        this.#keyLength = properties.keyLength;
        this.#mode = properties.mode;
        this.#iv = properties.iv;
    }

    getKeyLength(){
        return this.#keyLength;
    }

    getMode(){
        return this.#mode;
    }

    getIV(){
        return this.#iv;
    }
}

export default AESEncryptionParameters;
