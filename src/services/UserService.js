'use strict';

import AuthenticatedUserExportedRSAKeys from '../DTOs/AuthenticatedUserExportedRSAKeys';
import AuthenticatedUser from '../DTOs/AuthenticatedUser';
import RSAKeychain from '../support/RSAKeychain';
import CryptoUtils from '../utils/CryptoUtils';
import Request from '../facades/Request';
import App from '../facades/App';
import Service from './Service';

class UserService extends Service {
    async #loadAuthenticatedUserKeys(authenticatedUser, password){
        const aesEncryptionParameters = authenticatedUser.getRSAPrivateKeyEncryptionParameters();
        const key = await CryptoUtils.deriveAESKey(password, aesEncryptionParameters);
        const encryptedPrivateKey = authenticatedUser.getRSAPrivateKey();
        const publicKey = authenticatedUser.getRSAPublicKey();
        const privateKey = await CryptoUtils.AESDecryptText(encryptedPrivateKey, key, aesEncryptionParameters);
        const importedRSAKeys = await CryptoUtils.importRSAKeys(publicKey, privateKey);
        RSAKeychain.getInstance().setAuthenticatedUserRSAKeys(importedRSAKeys);
    }

    async #completeUserAuthentication(authenticatedUser, password, accessToken){
        await this.#loadAuthenticatedUserKeys(authenticatedUser, password);
        App.setAuthenticatedUser(authenticatedUser);
        App.setAccessToken(accessToken);
    }

    async #finalizeUserAuthenticationRequest(response, password){
        const authenticatedUser = new AuthenticatedUser(response.user);
        const accessToken = response.accessToken.accessToken;
        await this.#completeUserAuthentication(authenticatedUser, password, accessToken);
        return authenticatedUser;
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

    async isUsernameAvailable(username){
        const response = await Request.get(UserService.VERIFY_USERNAME_ENDPOINT_URL, { username: username });
        return response.isUsernameAvailable === true;
    }

    async signup(username, password, authenticatedUserExportedRSAKeys){
        const RSAPrivateKeyEncryptionParameters = authenticatedUserExportedRSAKeys.getAESEncryptionParameters();
        const passwordHash = await CryptoUtils.stringHash(password, 'SHA-512');
        const response = await Request.post(UserService.SIGNUP_ENDPOINT_URL, {
            RSAPrivateKeyEncryptionParametersKeyLength: RSAPrivateKeyEncryptionParameters.getKeyLength(),
            RSAPrivateKeyEncryptionParametersMode: RSAPrivateKeyEncryptionParameters.getMode(),
            RSAPrivateKeyEncryptionParametersIV: RSAPrivateKeyEncryptionParameters.getIV(),
            RSAPrivateKey: authenticatedUserExportedRSAKeys.getEncryptedRSAPrivateKey(),
            RSAPublicKey: authenticatedUserExportedRSAKeys.getRSAPublicKey(),
            password: passwordHash,
            username: username
        });
        return this.#finalizeUserAuthenticationRequest(response, password);
    }

    async login(username, password){
        const passwordHash = await CryptoUtils.stringHash(password, 'SHA-512');
        const response = await Request.post(UserService.LOGIN_ENDPOINT_URL, {
            password: passwordHash,
            username: username
        });
        return this.#finalizeUserAuthenticationRequest(response, password);
    }
}

Object.defineProperty(UserService, 'VERIFY_USERNAME_ENDPOINT_URL', {
    value: '/api/user/verify-username',
    writable: false
});

Object.defineProperty(UserService, 'SIGNUP_ENDPOINT_URL', {
    value: '/api/user/signup',
    writable: false
});

Object.defineProperty(UserService, 'LOGIN_ENDPOINT_URL', {
    value: '/api/user/login',
    writable: false
});

export default UserService;
