'use strict';

import UnauthorizedException from '../exceptions/UnauthorizedException';
import NotFoundException from '../exceptions/NotFoundException';
import AuthenticatedUser from '../DTOs/AuthenticatedUser';
import APIEndpoints from '../enum/APIEndpoints';
import CryptoUtils from '../utils/CryptoUtils';
import CryptoService from './CryptoService';
import Injector from '../facades/Injector';
import Request from '../facades/Request';
import User from '../DTOs/User';
import Service from './Service';

class UserService extends Service {
    async #finalizeUserAuthenticationRequest(response, password, isSession){
        const cryptoService = new CryptoService(), accessToken = response.accessToken.accessToken;
        const authenticatedUser = AuthenticatedUser.makeFromHTTPResponse(response);
        await cryptoService.extractAndStoreAuthenticatedUserRSAKeys(authenticatedUser, password, isSession);
        this.#authenticatedUserRepository.storeAuthenticatedUser(authenticatedUser, isSession);
        this.#accessTokenRepository.storeAccessToken(accessToken, isSession);
        await this.#webSocketClient.connect();
        return authenticatedUser;
    }

    #destroyUserSession(){
        this.#authenticatedUserRepository.dropAuthenticatedUser();
        new CryptoService().dropAuthenticatedUserRSAKeys();
        this.#accessTokenRepository.dropAccessToken();
    }

    #authenticatedUserRepository;
    #accessTokenRepository;
    #webSocketClient;
    #userRepository;

    constructor(){
        super();

        this.#authenticatedUserRepository = Injector.inject('AuthenticatedUserRepository');
        this.#accessTokenRepository = Injector.inject('AccessTokenRepository');
        this.#webSocketClient = Injector.inject('WebSocketClient');
        this.#userRepository = Injector.inject('UserRepository');
    }

    generateUserKeys(password){
        const cryptoService = new CryptoService();
        return cryptoService.generateUserKeys(password);
    }

    async isUsernameAvailable(username){
        const response = await Request.get(APIEndpoints.USER_VERIFY_USERNAME, { username: username });
        return response.isUsernameAvailable === true;
    }

    async signup(username, password, authenticatedUserExportedRSAKeys){
        const RSAPrivateKeyEncryptionParameters = authenticatedUserExportedRSAKeys.getAESEncryptionParameters();
        const passwordHash = await CryptoUtils.stringHash(password, 'SHA-512');
        const response = await Request.post(APIEndpoints.USER_SIGNUP, {
            RSAPrivateKeyEncryptionParametersKeyLength: RSAPrivateKeyEncryptionParameters.getKeyLength(),
            RSAPrivateKeyEncryptionParametersMode: RSAPrivateKeyEncryptionParameters.getMode(),
            RSAPrivateKeyEncryptionParametersIV: RSAPrivateKeyEncryptionParameters.getIV(),
            RSAPrivateKey: authenticatedUserExportedRSAKeys.getEncryptedRSAPrivateKey(),
            RSAPublicKey: authenticatedUserExportedRSAKeys.getRSAPublicKey(),
            password: passwordHash,
            username: username
        }, false);
        return this.#finalizeUserAuthenticationRequest(response, password, false);
    }

    async login(username, password, isSession = false){
        const passwordHash = await CryptoUtils.stringHash(password, 'SHA-512');
        const response = await Request.post(APIEndpoints.USER_LOGIN, {
            password: passwordHash,
            username: username
        }, true);
        return this.#finalizeUserAuthenticationRequest(response, password, isSession);
    }

    async getUserInfo(){
        if ( this.#accessTokenRepository.getAccessToken() === null ){
            this.#destroyUserSession();
            throw new UnauthorizedException('No access token found.');
        }
        try{
            const response = await Request.get(APIEndpoints.USER_INFO, null, true);
            const authenticatedUser = AuthenticatedUser.makeFromHTTPResponse(response);
            this.#authenticatedUserRepository.storeAuthenticatedUser(authenticatedUser, true);
            await this.#webSocketClient.connect();
            return authenticatedUser;
        }catch(ex){
            if ( ex instanceof UnauthorizedException || ex instanceof NotFoundException ){
                this.#destroyUserSession();
            }
            throw ex;
        }
    }

    getAuthenticatedUser(){
        return this.#authenticatedUserRepository.getAuthenticatedUser();
    }

    getAccessToken(){
        return this.#accessTokenRepository.getAccessToken();
    }

    loadAuthenticatedUserRSAKeys(){
        return new CryptoService().loadAuthenticatedUserRSAKeys();
    }

    getAuthenticatedUserRSAKeys(){
        return new CryptoService().getAuthenticatedUserRSAKeys();
    }

    async searchByUsername(username){
        const response = await Request.get(APIEndpoints.USER_SEARCH, {
            username: username
        }, true);
        return response.userList.map((user) => {
            return User.makeFromHTTPResponse({
                user: user
            });
        });
    }

    async storeUser(properties){
        const lastAccess = properties.lastAccess === null ? null : new Date(properties.lastAccess);
        return await this.#userRepository.store(properties.id, properties.username, properties.RSAPublicKey, lastAccess);
    }

    async getUsersByIDList(userIDList){
        return await this.#userRepository.findMany(userIDList);
    }

    async getUserByID(userID){
        return await this.#userRepository.find(userID);
    }

    async checkOnlineUsers(userIDList){
        const response = await this.#webSocketClient.send({
            payload: { userIDList: userIDList },
            action: 'checkOnlineUser'
        });
        return response.payload;
    }
}

export default UserService;
