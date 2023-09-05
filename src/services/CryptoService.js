'use strict';

import AuthenticatedUserExportedRSAKeys from '../DTOs/AuthenticatedUserExportedRSAKeys';
import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import UserRecoveryParams from '../DTOs/UserRecoveryParams';
import AuthenticatedUser from '../DTOs/AuthenticatedUser';
import CryptoUtils from '../utils/CryptoUtils';
import Injector from '../facades/Injector';
import Service from './Service';

class CryptoService extends Service {
    /**
     * @type {AuthenticatedUserRSAKeysRepository}
     */
    #authenticatedUserRSAKeysRepository;

    /**
     * Generates a recovery key for the given exported RSA private key.
     *
     * @param {string} exportedPrivateKey
     *
     * @returns {Promise<UserRecoveryParams>}
     */
    async #generateRecoveryKeyFromExportedPrivateKey(exportedPrivateKey){
        const aesEncryptionParameters = CryptoUtils.generateAESEncryptionParameters();
        const recoveryKey = await CryptoUtils.generateAESKey(aesEncryptionParameters);
        const encryptedRSAPrivateKey = await CryptoUtils.AESEncryptText(exportedPrivateKey, recoveryKey, aesEncryptionParameters);
        const exportedRecoveryKey = await CryptoUtils.exportKey(recoveryKey);
        return new UserRecoveryParams({
            AESEncryptionParameters: aesEncryptionParameters,
            encryptedRSAPrivateKey: encryptedRSAPrivateKey,
            recoveryKey: exportedRecoveryKey
        });
    }

    /**
     * The class constructor.
     */
    constructor(){
        super();

        this.#authenticatedUserRSAKeysRepository = Injector.inject('AuthenticatedUserRSAKeysRepository');
    }

    /**
     * Loads from browser storage authenticated user's decrypted RSA keys and then returns them.
     *
     * @returns {Promise<?ImportedRSAKeys>}
     */
    async loadAuthenticatedUserRSAKeys(){
        return this.#authenticatedUserRSAKeysRepository.loadAuthenticatedUserRSAKeys();
    }

    /**
     * Returns stored authenticated user's decrypted RSA keys.
     *
     * @returns {?ImportedRSAKeys}
     */
    getAuthenticatedUserRSAKeys(){
        return this.#authenticatedUserRSAKeysRepository.getAuthenticatedUserRSAKeys();
    }

    /**
     * Drops authenticated user's decrypted RSA keys.
     *
     * @returns {CryptoService}
     */
    dropAuthenticatedUserRSAKeys(){
        this.#authenticatedUserRSAKeysRepository.dropAuthenticatedUserRSAKeys();
        return this;
    }

    /**
     * Extracts and decrypts authenticated user's RSA keys and then stores them into the browser storage.
     *
     * @param {AuthenticatedUser} authenticatedUser
     * @param {string} password
     * @param {boolean} [isSession=false]
     *
     * @returns {Promise<void>}
     *
     * @throws {IllegalArgumentException} If an invalid authenticated user is given.
     * @throws {IllegalArgumentException} If an invalid password is given.
     */
    async extractAndStoreAuthenticatedUserRSAKeys(authenticatedUser, password, isSession = false){
        if ( !( authenticatedUser instanceof AuthenticatedUser ) ){
            throw new IllegalArgumentException('Invalid authenticated user.');
        }
        if ( password === '' || typeof password !== 'string' ){
            throw new IllegalArgumentException('Invalid password.');
        }
        const aesEncryptionParameters = authenticatedUser.getRSAPrivateKeyEncryptionParameters();
        const key = await CryptoUtils.deriveAESKey(password, aesEncryptionParameters);
        const encryptedPrivateKey = authenticatedUser.getRSAPrivateKey();
        const publicKey = authenticatedUser.getRSAPublicKey();
        const privateKey = await CryptoUtils.AESDecryptText(encryptedPrivateKey, key, aesEncryptionParameters);
        const importedRSAKeys = await CryptoUtils.importRSAKeys(publicKey, privateKey);
        await this.#authenticatedUserRSAKeysRepository.storeAuthenticatedUserRSAKeys(importedRSAKeys, isSession);
    }

    /**
     * Encrypts a pair of RSA keys.
     *
     * @param {ImportedRSAKeys} rsaKeys
     * @param {string} password
     *
     * @returns {Promise<AuthenticatedUserExportedRSAKeys>}
     *
     * @throws {IllegalArgumentException} If an invalid password is given.
     */
    async encryptRSAKeys(rsaKeys, password){
        if ( password === '' || typeof password !== 'string' ){
            throw new IllegalArgumentException('Invalid password.');
        }
        const [ exportedPrivateKey, exportedPublicKey ] = await Promise.all([
            CryptoUtils.exportKey(rsaKeys.privateKey),
            CryptoUtils.exportKey(rsaKeys.publicKey)
        ]);
        const aesEncryptionParameters = CryptoUtils.generateAESEncryptionParameters();
        const key = await CryptoUtils.deriveAESKey(password, aesEncryptionParameters);
        const encryptedRSAPrivateKey = await CryptoUtils.AESEncryptText(exportedPrivateKey, key, aesEncryptionParameters);
        return new AuthenticatedUserExportedRSAKeys({
            AESEncryptionParameters: aesEncryptionParameters,
            encryptedRSAPrivateKey: encryptedRSAPrivateKey,
            RSAPrivateKey: exportedPrivateKey,
            RSAPublicKey: exportedPublicKey
        });
    }

    /**
     * Generates a recovery key for the given RSA keys.
     *
     * @param {?AuthenticatedUserExportedRSAKeys} authenticatedUserExportedRSAKeys
     *
     * @returns {Promise<UserRecoveryParams>}
     *
     * @throws {IllegalArgumentException} If some invalid exported RSA keys are given.
     */
    async generateRecoveryKey(authenticatedUserExportedRSAKeys = null){
        if ( authenticatedUserExportedRSAKeys !== null && !( authenticatedUserExportedRSAKeys instanceof AuthenticatedUserExportedRSAKeys ) ){
            throw new IllegalArgumentException('Invalid exported RSA keys.');
        }
        let exportedPrivateKey;
        if ( authenticatedUserExportedRSAKeys === null ){
            exportedPrivateKey = await CryptoUtils.exportKey(this.getAuthenticatedUserRSAKeys().privateKey);
        }else{
            exportedPrivateKey = authenticatedUserExportedRSAKeys.getRSAPrivateKey();
        }
        return await this.#generateRecoveryKeyFromExportedPrivateKey(exportedPrivateKey);
    }

    /**
     * Generates a new RSA key pair.
     *
     * @param {string} password
     *
     * @returns {Promise<AuthenticatedUserExportedRSAKeys>}
     *
     * @throws {IllegalArgumentException} If an invalid password is given.
     */
    async generateUserKeys(password){
        const rsaKeys = await CryptoUtils.generateRSAKeys();
        return await this.encryptRSAKeys(rsaKeys, password);
    }

    /**
     * Decrypts RSA-encrypted data using the authenticated user's RSA keys stored.
     *
     * @param {any} data
     *
     * @returns {Promise<string>}
     */
    async RSADecrypt(data){
        const { privateKey } = this.getAuthenticatedUserRSAKeys();
        return await CryptoUtils.RSADecryptText(data, privateKey);
    }
}

export default CryptoService;
