'use strict';

import AuthenticatedUserExportedRSAKeys from '../DTOs/AuthenticatedUserExportedRSAKeys';
import IllegalArgumentException from '../exceptions/IllegalArgumentException';
import UnauthorizedException from '../exceptions/UnauthorizedException';
import NotFoundException from '../exceptions/NotFoundException';
import AuthenticatedUser from '../DTOs/AuthenticatedUser';
import AccessTokenService from './AccessTokenService';
import LocalDataService from './LocalDataService';
import APIEndpoints from '../enum/APIEndpoints';
import CryptoUtils from '../utils/CryptoUtils';
import CryptoService from './CryptoService';
import Injector from '../facades/Injector';
import Request from '../facades/Request';
import User from '../DTOs/User';
import Service from './Service';

class UserService extends Service {
    /**
     * Completes user authentication request.
     *
     * @param {Response} response
     * @param {string} password
     * @param {boolean} isSession
     *
     * @returns {Promise<AuthenticatedUser>}
     */
    async #finalizeUserAuthenticationRequest(response, password, isSession){
        const authenticatedUser = AuthenticatedUser.makeFromHTTPResponse(response);
        await new CryptoService().extractAndStoreAuthenticatedUserRSAKeys(authenticatedUser, password, isSession);
        new AccessTokenService().storeAccessToken(response.accessToken.accessToken, isSession);
        this.#authenticatedUserRepository.storeAuthenticatedUser(authenticatedUser);
        this._eventBroker.emit('userAuthenticated', authenticatedUser);
        await this.#webSocketClient.connect();
        return authenticatedUser;
    }

    /**
     * Destroys user authentication session.
     */
    #destroyUserSession(){
        this.#authenticatedUserRepository.dropAuthenticatedUser();
        new CryptoService().dropAuthenticatedUserRSAKeys();
        new AccessTokenService().dropAccessToken();
    }

    /**
     * @type {AuthenticatedUserRepository}
     */
    #authenticatedUserRepository;

    /**
     * @type {WebSocketClient}
     */
    #webSocketClient;

    /**
     * @type {UserRepository}
     */
    #userRepository;

    /**
     * The class constructor.
     */
    constructor(){
        super();

        this.#authenticatedUserRepository = Injector.inject('AuthenticatedUserRepository');
        this.#webSocketClient = Injector.inject('WebSocketClient');
        this.#userRepository = Injector.inject('UserRepository');
    }

    /**
     * Generates some new user keys based on the provided password.
     *
     * @param {string} password
     *
     * @returns {Promise<AuthenticatedUserExportedRSAKeys>}
     *
     * @throws {IllegalArgumentException} If an invalid password is given.
     */
    async generateUserKeys(password){
        if ( password === '' || typeof password !== 'string' ){
            throw new IllegalArgumentException('Invalid password.');
        }
        return await new CryptoService().generateUserKeys(password);
    }

    /**
     * Checks if the given username has been already taken or not.
     *
     * @param {string} username
     *
     * @returns {Promise<boolean>}
     *
     * @throws {IllegalArgumentException} If an invalid username is given.
     */
    async isUsernameAvailable(username){
        if ( username === '' || typeof username !== 'string' ){
            throw new IllegalArgumentException('Invalid username.');
        }
        const response = await Request.get(APIEndpoints.USER_VERIFY_USERNAME, { username: username });
        return response.isUsernameAvailable === true;
    }

    /**
     * Registers a new user.
     *
     * @param {string} username
     * @param {string} password
     * @param {AuthenticatedUserExportedRSAKeys} authenticatedUserExportedRSAKeys
     *
     * @returns {Promise<User>}
     *
     * @throws {IllegalArgumentException} If some invalid user keys are given.
     * @throws {IllegalArgumentException} If an invalid username is given.
     * @throws {IllegalArgumentException} If an invalid password is given.
     */
    async signup(username, password, authenticatedUserExportedRSAKeys){
        if ( !( authenticatedUserExportedRSAKeys instanceof AuthenticatedUserExportedRSAKeys ) ){
            throw new IllegalArgumentException('Invalid user keys.');
        }
        if ( username === '' || typeof username !== 'string' ){
            throw new IllegalArgumentException('Invalid username.');
        }
        if ( password === '' || typeof password !== 'string' ){
            throw new IllegalArgumentException('Invalid password.');
        }
        const RSAPrivateKeyEncryptionParameters = authenticatedUserExportedRSAKeys.getAESEncryptionParameters();
        const response = await Request.post(APIEndpoints.USER_SIGNUP, {
            RSAPrivateKeyEncryptionParametersKeyLength: RSAPrivateKeyEncryptionParameters.getKeyLength(),
            RSAPrivateKeyEncryptionParametersMode: RSAPrivateKeyEncryptionParameters.getMode(),
            RSAPrivateKeyEncryptionParametersIV: RSAPrivateKeyEncryptionParameters.getIV(),
            RSAPrivateKey: authenticatedUserExportedRSAKeys.getEncryptedRSAPrivateKey(),
            RSAPublicKey: authenticatedUserExportedRSAKeys.getRSAPublicKey(),
            password: ( await CryptoUtils.stringHash(password, 'SHA-512') ),
            username: username
        }, false);
        return this.#finalizeUserAuthenticationRequest(response, password, false);
    }

    /**
     * Logs a user in.
     *
     * @param {string} username
     * @param {string} password
     * @param {boolean} [isSession=false]
     *
     * @returns {Promise<AuthenticatedUser>}
     *
     * @throws {IllegalArgumentException} If an invalid username is given.
     * @throws {IllegalArgumentException} If an invalid password is given.
     */
    async login(username, password, isSession = false){
        if ( username === '' || typeof username !== 'string' ){
            throw new IllegalArgumentException('Invalid username.');
        }
        if ( password === '' || typeof password !== 'string' ){
            throw new IllegalArgumentException('Invalid password.');
        }
        const response = await Request.post(APIEndpoints.USER_LOGIN, {
            password: ( await CryptoUtils.stringHash(password, 'SHA-512') ),
            username: username
        }, true);
        return this.#finalizeUserAuthenticationRequest(response, password, isSession);
    }

    /**
     * Fetches authenticated user's information.
     *
     * @returns {Promise<AuthenticatedUser>}
     *
     * @throws {UnauthorizedException} If the user is not authenticated.
     * @throws {NotFoundException} If the user is no more authenticated.
     */
    async getUserInfo(){
        if (  new AccessTokenService().getAccessToken() === null ){
            this.#destroyUserSession();
            throw new UnauthorizedException('No access token found.');
        }
        try{
            const response = await Request.get(APIEndpoints.USER_INFO, null, true);
            const authenticatedUser = AuthenticatedUser.makeFromHTTPResponse(response);
            this.#authenticatedUserRepository.storeAuthenticatedUser(authenticatedUser);
            this._eventBroker.emit('userAuthenticated', authenticatedUser);
            await this.#webSocketClient.connect();
            return authenticatedUser;
        }catch(ex){
            if ( ex instanceof UnauthorizedException || ex instanceof NotFoundException ){
                this.#destroyUserSession();
            }
            throw ex;
        }
    }

    /**
     * Returns the authenticated user.
     *
     * @returns {?AuthenticatedUser}
     */
    getAuthenticatedUser(){
        return this.#authenticatedUserRepository.getAuthenticatedUser();
    }

    /**
     * Returns the authenticated user's access token.
     *
     * @returns {?string}
     */
    getAccessToken(){
        return new AccessTokenService().getAccessToken();
    }

    /**
     * Imports authenticated user's keys.
     *
     * @returns {Promise<CryptoKeyPair>}
     */
    loadAuthenticatedUserRSAKeys(){
        return new CryptoService().loadAuthenticatedUserRSAKeys();
    }

    /**
     * Returns authenticated user's keys.
     *
     * @returns {Promise<CryptoKeyPair>}
     */
    getAuthenticatedUserRSAKeys(){
        return new CryptoService().getAuthenticatedUserRSAKeys();
    }

    /**
     * Returns all the users matching a given username.
     *
     * @param {string} username
     * @param {number} [limit=10]
     *
     * @returns {Promise<User[]>}
     *
     * @throws {IllegalArgumentException} If an invalid username is given.
     */
    async searchByUsername(username, limit = 10){
        if ( username === '' || typeof username !== 'string' ){
            throw new IllegalArgumentException('Invalid username.');
        }
        const response = await Request.get(APIEndpoints.USER_SEARCH, { username: username, limit: limit }, true);
        return response.userList.map((user) => User.makeFromHTTPResponse({ user: user }));
    }

    /**
     * Stores a new user given its public properties.
     *
     * @param {UserStoreProperties} properties
     *
     * @returns {Promise<User>}
     *
     * @throws {IllegalArgumentException} If an invalid properties object is given.
     */
    async storeUser(properties){
        if ( properties === null || typeof properties !== 'object' ){
            throw new IllegalArgumentException('Invalid properties.');
        }
        properties.lastAccess = properties.lastAccess === null ? null : new Date(properties.lastAccess);
        return await this.#userRepository.store(properties);
    }

    /**
     * Returns a list of user matching the given list of user IDs.
     *
     * @param {string[]} userIDList
     *
     * @returns {Promise<User[]>}
     *
     * @throws {IllegalArgumentException} If an invalid user ID list is given.
     */
    async getUsersByIDList(userIDList){
        if ( !Array.isArray(userIDList) ){
            throw new IllegalArgumentException('Invalid user ID list.');
        }
        return await this.#userRepository.findMany(userIDList);
    }

    /**
     * Returns the user matching the given ID.
     *
     * @param {string} userID
     *
     * @returns {Promise<?User>}
     *
     * @throws {IllegalArgumentException} If an invalid user ID is given.
     */
    async getUserByID(userID){
        if ( userID === '' || typeof userID !== 'string' ){
            throw new IllegalArgumentException('Invalid user ID.');
        }
        return await this.#userRepository.find(userID);
    }

    /**
     * Check if the given users are online at the moment or not.
     *
     * @param {string[]} userIDList
     *
     * @returns {Promise<Object.<string, boolean>>}
     *
     * @throws {IllegalArgumentException} If an invalid user ID list is given.
     */
    async checkOnlineUsers(userIDList){
        if ( !Array.isArray(userIDList) ){
            throw new IllegalArgumentException('Invalid user ID list.');
        }
        const response = await this.#webSocketClient.send({
            payload: { userIDList: userIDList },
            action: 'checkOnlineUser'
        });
        return response?.payload ?? {};
    }

    /**
     * Updates the authenticated user.
     *
     * @param {string} username
     * @param {string} name
     * @param {string} surname
     *
     * @returns {Promise<void>}
     *
     * @throws {DuplicatedUsernameException} If the given username has already been taken.
     * @throws {IllegalArgumentException} If an invalid username is given.
     * @throws {IllegalArgumentException} If an invalid surname is given.
     * @throws {IllegalArgumentException} If an invalid name is given.
     */
    async edit(username, name, surname){
        if ( surname !== null && ( surname === '' || typeof surname !== 'string' ) ){
            throw new IllegalArgumentException('Invalid surname.');
        }
        if ( name !== null && ( name === '' || typeof name !== 'string' ) ){
            throw new IllegalArgumentException('Invalid name.');
        }
        if ( username === '' || typeof username !== 'string' ){
            throw new IllegalArgumentException('Invalid username.');
        }
        const data = { username: username, surname: surname, name: name };
        const response = await Request.patch(APIEndpoints.USER_EDIT, data, true);
        const authenticatedUser = AuthenticatedUser.makeFromHTTPResponse(response);
        this.#authenticatedUserRepository.storeAuthenticatedUser(authenticatedUser);
        const user = await this.storeUser(response.user);
        this._eventBroker.emit('userUpdated', user);
    }

    /**
     * Logs the authenticated user out.
     *
     * @returns {Promise<void>}
     */
    async logout(){
        await this.#webSocketClient.disconnect();
        try{
            await Request.get(APIEndpoints.USER_LOGOUT);
        }catch(ex){
            if ( !( ex instanceof UnauthorizedException )){
                throw ex;
            }
        }
        this._eventBroker.emit('logout');
        await new LocalDataService().dropLocalData();
    }

    /**
     * Changes the user's password.
     *
     * @param {string} currentPassword
     * @param {string} newPassword
     *
     * @throws {IllegalArgumentException} If an invalid current password is given.
     * @throws {IllegalArgumentException} If an invalid new password is given.
     */
    async changePassword(currentPassword, newPassword){
        if ( currentPassword === '' || typeof currentPassword !== 'string' ){
            throw new IllegalArgumentException('Invalid current password.');
        }
        if ( newPassword === '' || typeof newPassword !== 'string' ){
            throw new IllegalArgumentException('Invalid new password.');
        }
        const cryptoService = new CryptoService(), rsaKeys = cryptoService.getAuthenticatedUserRSAKeys();
        const authenticatedUserExportedRSAKeys = await cryptoService.encryptRSAKeys(rsaKeys, newPassword);
        const RSAPrivateKeyEncryptionParameters = authenticatedUserExportedRSAKeys.getAESEncryptionParameters();
        await Request.patch(APIEndpoints.USER_CHANGE_PASSWORD, {
            RSAPrivateKeyEncryptionParametersKeyLength: RSAPrivateKeyEncryptionParameters.getKeyLength(),
            RSAPrivateKeyEncryptionParametersMode: RSAPrivateKeyEncryptionParameters.getMode(),
            RSAPrivateKeyEncryptionParametersIV: RSAPrivateKeyEncryptionParameters.getIV(),
            RSAPrivateKey: authenticatedUserExportedRSAKeys.getEncryptedRSAPrivateKey(),
            currentPassword: ( await CryptoUtils.stringHash(currentPassword, 'SHA-512') ),
            newPassword: ( await CryptoUtils.stringHash(newPassword, 'SHA-512') )
        });
    }
}

export default UserService;
