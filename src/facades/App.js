'use strict';

import Facade from './Facade';

class App extends Facade {
    static #authenticatedUser;
    static #accessToken;

    static setAuthenticatedUser(authenticatedUser){
        App.#authenticatedUser = authenticatedUser;
    }

    static getAuthenticatedUser(){
        return App.#authenticatedUser;
    }

    static setAccessToken(accessToken){
        App.#accessToken = accessToken;
    }

    static getAccessToken(){
        return App.#accessToken;
    }
}

export default App;
