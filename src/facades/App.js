'use strict';

import UserService from '../services/UserService';
import Facade from './Facade';

class App extends Facade {
    /**
     * Returns application version number.
     *
     * @returns {string}
     */
    static getVersion(){
        return VERSION;
    }

    /**
     * Returns the authenticated user.
     *
     * @returns {?AuthenticatedUser}
     */
    static getAuthenticatedUser(){
        return new UserService().getAuthenticatedUser();
    }

    /**
     * Returns the authenticated user's access token.
     *
     * @returns {?string}
     */
    static getAccessToken(){
        return new UserService().getAccessToken();
    }

    /**
     * Imports authenticated user's keys.
     *
     * @returns {Promise<CryptoKeyPair>}
     */
    static async loadAuthenticatedUserRSAKeys(){
        await new UserService().loadAuthenticatedUserRSAKeys();
    }

    static isUserAuthenticated(){
        const userService = new UserService();
        const authenticatedUserRSAKeys = userService.getAuthenticatedUserRSAKeys();
        const accessToken = userService.getAccessToken();
        return authenticatedUserRSAKeys !== null && accessToken !== null;
    }
}

export default App;
