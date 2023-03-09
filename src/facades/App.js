'use strict';

import UserService from '../services/UserService';
import Facade from './Facade';

class App extends Facade {
    static getAuthenticatedUser(){
        return new UserService().getAuthenticatedUser();
    }

    static getAccessToken(){
        return new UserService().getAccessToken();
    }

    static async loadAuthenticatedUserRSAKeys(){
        const userService = new UserService();
        await userService.loadAuthenticatedUserRSAKeys();
    }

    static isUserAuthenticated(){
        const userService = new UserService();
        const authenticatedUserRSAKeys = userService.getAuthenticatedUserRSAKeys();
        const accessToken = userService.getAccessToken();
        return authenticatedUserRSAKeys !== null && accessToken !== null;
    }
}

export default App;
