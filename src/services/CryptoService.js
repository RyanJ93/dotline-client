'use strict';

import AuthenticatedUserExportedRSAKeys from '../DTOs/AuthenticatedUserExportedRSAKeys';
import CryptoUtils from '../utils/CryptoUtils';
import Injector from '../facades/Injector';
import Service from './Service';

class CryptoService extends Service {
    #authenticatedUserRSAKeysRepository;

    constructor(){
        super();

        this.#authenticatedUserRSAKeysRepository = Injector.inject('AuthenticatedUserRSAKeysRepository');
    }

    async extractAndStoreAuthenticatedUserRSAKeys(authenticatedUser, password, isSession = false){
        const aesEncryptionParameters = authenticatedUser.getRSAPrivateKeyEncryptionParameters();
        const key = await CryptoUtils.deriveAESKey(password, aesEncryptionParameters);
        const encryptedPrivateKey = authenticatedUser.getRSAPrivateKey();
        const publicKey = authenticatedUser.getRSAPublicKey();
        const privateKey = await CryptoUtils.AESDecryptText(encryptedPrivateKey, key, aesEncryptionParameters);
        const importedRSAKeys = await CryptoUtils.importRSAKeys(publicKey, privateKey);
        await this.#authenticatedUserRSAKeysRepository.storeAuthenticatedUserRSAKeys(importedRSAKeys, isSession);
    }

    async loadAuthenticatedUserRSAKeys(){
        return this.#authenticatedUserRSAKeysRepository.loadAuthenticatedUserRSAKeys();
    }

    getAuthenticatedUserRSAKeys(){
        return this.#authenticatedUserRSAKeysRepository.getAuthenticatedUserRSAKeys();
    }

    dropAuthenticatedUserRSAKeys(){
        this.#authenticatedUserRSAKeysRepository.dropAuthenticatedUserRSAKeys();
        return this;
    }

    async generateUserKeys(password){
        const aesEncryptionParameters = CryptoUtils.generateAESEncryptionParameters();
        const key = await CryptoUtils.deriveAESKey(password, aesEncryptionParameters);
        const rsaKeys = await CryptoUtils.generateRSAKeys();
        const [ RSAPrivateKey, RSAPublicKey ] = await Promise.all([
            CryptoUtils.exportKey(rsaKeys.privateKey),
            CryptoUtils.exportKey(rsaKeys.publicKey)
        ]);
        const encryptedRSAPrivateKey = await CryptoUtils.AESEncryptText(RSAPrivateKey, key, aesEncryptionParameters);
        return new AuthenticatedUserExportedRSAKeys({
            AESEncryptionParameters: aesEncryptionParameters,
            encryptedRSAPrivateKey: encryptedRSAPrivateKey,
            RSAPrivateKey: RSAPrivateKey,
            RSAPublicKey: RSAPublicKey
        });
    }
}

export default CryptoService;
