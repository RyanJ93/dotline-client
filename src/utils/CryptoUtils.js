'use strict';

import AESEncryptionParameters from '../DTOs/AESEncryptionParameters';
import BinaryUtils from './BinaryUtils';
import AESStaticParameters from '../DTOs/AESStaticParameters';

class CryptoUtils {
    static generateRSAKeys(){
        return crypto.subtle.generateKey({
            publicExponent: new Uint8Array([1, 0, 1]),
            modulusLength: 4096,
            name: 'RSA-OAEP',
            hash: 'SHA-512',
        },true, ['encrypt', 'decrypt']);
    }

    static generateAESEncryptionParameters(){
        const iv = crypto.getRandomValues(new Uint8Array(12));
        return new AESEncryptionParameters({
            iv: btoa(String.fromCharCode(...iv)),
            keyLength: 256,
            mode: 'GCM'
        });
    }

    static generateAESKey(aesStaticParameters){
        return crypto.subtle.generateKey({
            name: 'AES-' + aesStaticParameters.getMode(),
            length: aesStaticParameters.getKeyLength()
        }, true, ['encrypt', 'decrypt']);
    }

    static async deriveAESKey(baseKey, aesEncryptionParameters){
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

    static async AESEncryptText(text, key, aesEncryptionParameters){
        const iv = Uint8Array.from(atob(aesEncryptionParameters.getIV()), c => c.charCodeAt(0));
        const encryptedContent = await crypto.subtle.encrypt({
            name: 'AES-' + aesEncryptionParameters.getMode(),
            iv: iv
        }, key, new TextEncoder().encode(text));
        return btoa(String.fromCharCode(...new Uint8Array(encryptedContent)));
    }

    static async AESDecryptText(value, key, aesEncryptionParameters){
        const iv = Uint8Array.from(atob(aesEncryptionParameters.getIV()), c => c.charCodeAt(0));
        const encodedValue = Uint8Array.from(atob(value), c => c.charCodeAt(0));
        const decryptedContent = await crypto.subtle.decrypt({
            name: 'AES-' + aesEncryptionParameters.getMode(),
            iv: iv
        }, key, encodedValue);
        return new TextDecoder().decode(new Uint8Array(decryptedContent));
    }

    static async RSAEncryptText(text, publicKey){
        const encryptedContent = await crypto.subtle.encrypt({
            name: 'RSA-OAEP'
        }, publicKey, new TextEncoder().encode(text));
        return btoa(String.fromCharCode(...new Uint8Array(encryptedContent)));
    }

    static async RSADecryptText(value, publicKey, privateKey){
        const importedKey = await CryptoUtils.importRSAKeys(publicKey, privateKey);
        const encodedValue = Uint8Array.from(atob(value), c => c.charCodeAt(0));
        const decryptedContent = await crypto.subtle.decrypt({
            name: 'RSA-OAEP'
        }, importedKey.privateKey, encodedValue);
        return new TextDecoder().decode(new Uint8Array(decryptedContent));
    }

    static async stringHash(text, algorithm){
        const data = new TextEncoder().encode(text);
        const hash = await crypto.subtle.digest(algorithm, data);
        return BinaryUtils.arrayBufferToHEX(hash);
    }

    static async exportKey(key){
        const exportedKey = await crypto.subtle.exportKey('jwk', key);
        return btoa(JSON.stringify(exportedKey));
    }

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
        return {
            privateKey: privateKey,
            publicKey: publicKey
        };
    }

    static async importRSAPublicKey(publicKeyData){
        publicKeyData = JSON.parse(atob(publicKeyData));
        return await crypto.subtle.importKey('jwk', publicKeyData, {
            name: 'RSA-OAEP',
            hash: 'SHA-512',
        }, true, ['encrypt']);
    }

    static async importAESKey(key, aesEncryptionParameters){key = key.replaceAll('"', '');
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

    static async HMACVerify(text, signature, key){
        const signatureBuffer = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
        const textBuffer = new TextEncoder().encode(text);
        return await window.crypto.subtle.verify('HMAC', key, signatureBuffer, textBuffer);
    }
}

export default CryptoUtils;
