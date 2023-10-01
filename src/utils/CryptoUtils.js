'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import AESEncryptionParameters from '../DTOs/AESEncryptionParameters';
import AESStaticParameters from '../DTOs/AESStaticParameters';
import BinaryUtils from './BinaryUtils';

/**
 * @typedef ImportedRSAKeys
 *
 * @property {CryptoKey} privateKey
 * @property {CryptoKey} publicKey
 */

/**
 * @typedef ExportedRSAKeys
 *
 * @property {string} privateKey
 * @property {string} publicKey
 */

class CryptoUtils {
    /**
     * Generates a new pair of RSA keys.
     *
     * @returns {Promise<CryptoKeyPair>}
     */
    static generateRSAKeys(){
        return crypto.subtle.generateKey({
            publicExponent: new Uint8Array([1, 0, 1]),
            modulusLength: 4096,
            name: 'RSA-OAEP',
            hash: 'SHA-512',
        }, true, ['encrypt', 'decrypt']);
    }

    /**
     * Generates some new AES encryption parameters.
     *
     * @returns {AESEncryptionParameters}
     */
    static generateAESEncryptionParameters(){
        const iv = crypto.getRandomValues(new Uint8Array(12));
        return new AESEncryptionParameters({
            iv: btoa(String.fromCharCode(...iv)),
            keyLength: 256,
            mode: 'GCM'
        });
    }

    /**
     * Generates a new AES encryption/decryption key.
     *
     * @param {AESStaticParameters} aesStaticParameters
     *
     * @returns {Promise<CryptoKey>}
     *
     * @throws {IllegalArgumentException} If some invalid AES encryption parameters are given.
     */
    static generateAESKey(aesStaticParameters){
        if ( !( aesStaticParameters instanceof AESStaticParameters ) ){
            throw new IllegalArgumentException('Invalid AES encryption parameters.');
        }
        return crypto.subtle.generateKey({
            name: 'AES-' + aesStaticParameters.getMode(),
            length: aesStaticParameters.getKeyLength()
        }, true, ['encrypt', 'decrypt']);
    }

    /**
     * Generates a new AES encryption/decryption key based on a given password/key.
     *
     * @param {string} baseKey
     * @param {AESEncryptionParameters} aesEncryptionParameters
     *
     * @returns {Promise<CryptoKey>}
     *
     * @throws {IllegalArgumentException} If some invalid AES encryption parameters are given.
     * @throws {IllegalArgumentException} If an invalid base key is given.
     */
    static async deriveAESKey(baseKey, aesEncryptionParameters){
        if ( !( aesEncryptionParameters instanceof AESEncryptionParameters ) ){
            throw new IllegalArgumentException('Invalid AES encryption parameters.');
        }
        if ( baseKey === '' || typeof baseKey !== 'string' ){
            throw new IllegalArgumentException('Invalid base key.');
        }
        const salt = await CryptoUtils.stringHash(baseKey, 'SHA-512');
        const encodedBaseKey = new TextEncoder().encode(baseKey);
        const importedKey = await crypto.subtle.importKey('raw', encodedBaseKey, {
            name: 'PBKDF2'
        }, false, ['deriveBits', 'deriveKey']);
        return await crypto.subtle.deriveKey({
            salt: new TextEncoder().encode(salt),
            iterations: 1000,
            hash: 'SHA-512',
            name: 'PBKDF2'
        }, importedKey, {
            name: 'AES-' + aesEncryptionParameters.getMode(),
            length: aesEncryptionParameters.getKeyLength()
        }, true, ['encrypt', 'decrypt']);
    }

    /**
     * Encrypts a given text using the AES algorithm.
     *
     * @param {string} text
     * @param {CryptoKey} key
     * @param {AESEncryptionParameters} aesEncryptionParameters
     *
     * @returns {Promise<string>}
     *
     * @throws {IllegalArgumentException} If some invalid AES encryption parameters are given.
     * @throws {IllegalArgumentException} If an invalid AES encryption key is given.
     * @throws {IllegalArgumentException} If an invalid text is given.
     */
    static async AESEncryptText(text, key, aesEncryptionParameters){
        if ( !( aesEncryptionParameters instanceof AESEncryptionParameters ) ){
            throw new IllegalArgumentException('Invalid AES encryption parameters.');
        }
        if ( !( key instanceof CryptoKey ) ){
            throw new IllegalArgumentException('Invalid AES encryption key.');
        }
        if ( text === '' || typeof text !== 'string' ){
            throw new IllegalArgumentException('Invalid text.');
        }
        const encryptedContent = await crypto.subtle.encrypt({
            name: 'AES-' + aesEncryptionParameters.getMode(),
            iv: aesEncryptionParameters.getIVAsTypedArray()
        }, key, new TextEncoder().encode(text));
        return btoa(String.fromCharCode(...new Uint8Array(encryptedContent)));
    }

    /**
     * Encrypts a given binary file using the AES algorithm.
     *
     * @param {ArrayBuffer} fileContent
     * @param {CryptoKey} key
     * @param {AESEncryptionParameters} aesEncryptionParameters
     *
     * @returns {Promise<ArrayBuffer>}
     *
     * @throws {IllegalArgumentException} If some invalid AES encryption parameters are given.
     * @throws {IllegalArgumentException} If an invalid AES encryption key is given.
     * @throws {IllegalArgumentException} If an invalid file content is given.
     */
    static async AESEncryptFile(fileContent, key, aesEncryptionParameters){
        if ( !( aesEncryptionParameters instanceof AESEncryptionParameters ) ){
            throw new IllegalArgumentException('Invalid AES encryption parameters.');
        }
        if ( !( key instanceof CryptoKey ) ){
            throw new IllegalArgumentException('Invalid AES encryption key.');
        }
        if ( !( fileContent instanceof ArrayBuffer ) ){
            throw new IllegalArgumentException('Invalid file content.');
        }
        return await crypto.subtle.encrypt({
            name: 'AES-' + aesEncryptionParameters.getMode(),
            iv: aesEncryptionParameters.getIVAsTypedArray()
        }, key, fileContent);
    }

    /**
     * Decrypts a given value using the AES algorithm.
     *
     * @param {string} value
     * @param {CryptoKey} key
     * @param {AESEncryptionParameters} aesEncryptionParameters
     *
     * @returns {Promise<string>}
     *
     * @throws {IllegalArgumentException} If some invalid AES encryption parameters are given.
     * @throws {IllegalArgumentException} If an invalid AES encryption key is given.
     * @throws {IllegalArgumentException} If an invalid value is given.
     */
    static async AESDecryptText(value, key, aesEncryptionParameters){
        if ( !( aesEncryptionParameters instanceof AESEncryptionParameters ) ){
            throw new IllegalArgumentException('Invalid AES encryption parameters.');
        }
        if ( !( key instanceof CryptoKey ) ){
            throw new IllegalArgumentException('Invalid AES encryption key.');
        }
        if ( value === '' || typeof value !== 'string' ){
            throw new IllegalArgumentException('Invalid value.');
        }
        const decryptedContent = await crypto.subtle.decrypt({
            name: 'AES-' + aesEncryptionParameters.getMode(),
            iv: aesEncryptionParameters.getIVAsTypedArray()
        }, key, Uint8Array.from(atob(value), c => c.charCodeAt(0)));
        return new TextDecoder().decode(new Uint8Array(decryptedContent));
    }

    /**
     * Decrypts a given binary file using the AES algorithm.
     *
     * @param {ArrayBuffer} fileContent
     * @param {CryptoKey} key
     * @param {AESEncryptionParameters} aesEncryptionParameters
     *
     * @returns {Promise<ArrayBuffer>}
     *
     * @throws {IllegalArgumentException} If some invalid AES encryption parameters are given.
     * @throws {IllegalArgumentException} If an invalid AES encryption key is given.
     * @throws {IllegalArgumentException} If an invalid file content is given.
     */
    static async AESDecryptFile(fileContent, key, aesEncryptionParameters){
        if ( !( aesEncryptionParameters instanceof AESEncryptionParameters ) ){
            throw new IllegalArgumentException('Invalid AES encryption parameters.');
        }
        if ( !( key instanceof CryptoKey ) ){
            throw new IllegalArgumentException('Invalid AES encryption key.');
        }
        if ( !( fileContent instanceof ArrayBuffer ) ){
            throw new IllegalArgumentException('Invalid file content.');
        }
        // data = await data.arrayBuffer();
        return await crypto.subtle.decrypt({
            name: 'AES-' + aesEncryptionParameters.getMode(),
            iv: aesEncryptionParameters.getIVAsTypedArray()
        }, key, fileContent);
    }

    /**
     * Encrypts a given text using the RSA algorithm.
     *
     * @param {string} text
     * @param {CryptoKey} publicKey
     *
     * @returns {Promise<string>}
     *
     * @throws {IllegalArgumentException} If an invalid RSA public key is given.
     * @throws {IllegalArgumentException} If an invalid text is given.
     */
    static async RSAEncryptText(text, publicKey){
        if ( !( publicKey instanceof CryptoKey ) ){
            throw new IllegalArgumentException('Invalid RSA public key.');
        }
        if ( text === '' || typeof text !== 'string' ){
            throw new IllegalArgumentException('Invalid text.');
        }
        const encryptedContent = await crypto.subtle.encrypt({
            name: 'RSA-OAEP'
        }, publicKey, new TextEncoder().encode(text));
        return btoa(String.fromCharCode(...new Uint8Array(encryptedContent)));
    }

    /**
     * Decrypts a given value using the RSA algorithm.
     *
     * @param {string} value
     * @param {CryptoKey} privateKey
     *
     * @returns {Promise<string>}
     *
     * @throws {IllegalArgumentException} If an invalid RSA private key is given.
     * @throws {IllegalArgumentException} If an invalid value is given.
     */
    static async RSADecryptText(value, privateKey){
        if ( !( privateKey instanceof CryptoKey ) ){
            throw new IllegalArgumentException('Invalid RSA private key.');
        }
        if ( value === '' || typeof value !== 'string' ){
            throw new IllegalArgumentException('Invalid value.');
        }
        const encodedValue = Uint8Array.from(atob(value), c => c.charCodeAt(0));
        const decryptedContent = await crypto.subtle.decrypt({
            name: 'RSA-OAEP'
        }, privateKey, encodedValue);
        return new TextDecoder().decode(new Uint8Array(decryptedContent));
    }

    /**
     * Computes the hash value of a given string.
     *
     * @param {string} text
     * @param {string} algorithm
     *
     * @returns {Promise<string>}
     *
     * @throws {IllegalArgumentException} If an invalid algorithm is given.
     * @throws {IllegalArgumentException} If an invalid text is given.
     */
    static async stringHash(text, algorithm){
        if ( algorithm === '' || typeof algorithm !== 'string' ){
            throw new IllegalArgumentException('Invalid algorithm.');
        }
        if ( text === '' || typeof text !== 'string' ){
            throw new IllegalArgumentException('Invalid text.');
        }
        const data = new TextEncoder().encode(text);
        const hash = await crypto.subtle.digest(algorithm, data);
        return BinaryUtils.arrayBufferToHEX(hash);
    }

    /**
     * Exports a given key to string.
     *
     * @param {CryptoKey} key
     *
     * @returns {Promise<string>}
     */
    static async exportKey(key){
        const exportedKey = await crypto.subtle.exportKey('jwk', key);
        return btoa(JSON.stringify(exportedKey));
    }

    /**
     *
     * @param {string} publicKeyData
     * @param {string} privateKeyData
     *
     * @returns {Promise<ImportedRSAKeys>}
     */
    static async importRSAKeys(publicKeyData, privateKeyData){
        privateKeyData = JSON.parse(atob(privateKeyData));
        publicKeyData = JSON.parse(atob(publicKeyData));
        const [ privateKey, publicKey ] = await Promise.all([
            crypto.subtle.importKey('jwk', privateKeyData, {
                name: 'RSA-OAEP',
                hash: 'SHA-512',
            }, true, ['decrypt']),
            crypto.subtle.importKey('jwk', publicKeyData, {
                name: 'RSA-OAEP',
                hash: 'SHA-512',
            }, true, ['encrypt'])
        ]);
        return { privateKey: privateKey, publicKey: publicKey };
    }

    static async importRSAPrivateKey(privateKeyData){
        privateKeyData = JSON.parse(atob(privateKeyData));
        return await crypto.subtle.importKey('jwk', privateKeyData, {
            name: 'RSA-OAEP',
            hash: 'SHA-512',
        }, true, ['decrypt']);
    }

    static async importRSAPublicKey(publicKeyData){
        publicKeyData = JSON.parse(atob(publicKeyData));
        return await crypto.subtle.importKey('jwk', publicKeyData, {
            name: 'RSA-OAEP',
            hash: 'SHA-512',
        }, true, ['encrypt']);
    }

    static async importAESKey(key, aesEncryptionParameters){
        key = key.replaceAll('"', '');
        const keyData = JSON.parse(atob(key));
        const iv = Uint8Array.from(atob(aesEncryptionParameters.getIV()), c => c.charCodeAt(0));
        return await crypto.subtle.importKey('jwk', keyData, {
            name: 'AES-' + aesEncryptionParameters.getMode(),
            iv: iv
        }, true, ['encrypt', 'decrypt']);
    }

    static async generateHMACKey(hmacSigningParameters){
        return crypto.subtle.generateKey({
            hash: { name: hmacSigningParameters.getHashName() },
            name: 'HMAC'
        }, true, ['sign', 'verify']);
    }

    static async importHMACKey(key, hmacSigningParameters){key = key.replaceAll('"', '');
        const keyData = JSON.parse(atob(key));
        return await crypto.subtle.importKey('jwk', keyData, {
            hash: { name: hmacSigningParameters.getHashName() },
            name: 'HMAC'
        }, true, ['sign', 'verify']);
    }

    static async HMACSign(text, key){
        const buffer = new TextEncoder().encode(text);
        const signature = await window.crypto.subtle.sign('HMAC', key, buffer);
        return btoa(String.fromCharCode(...new Uint8Array(signature)));
    }

    static async HMACFileSign(fileContent, key){
        const signature = await window.crypto.subtle.sign('HMAC', key, fileContent);
        return btoa(String.fromCharCode(...new Uint8Array(signature)));
    }

    static async HMACVerify(text, signature, key){
        const signatureBuffer = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
        const textBuffer = new TextEncoder().encode(text);
        return await window.crypto.subtle.verify('HMAC', key, signatureBuffer, textBuffer);
    }
}

export default CryptoUtils;
