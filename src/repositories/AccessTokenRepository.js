'use strict';

import Repository from './Repository';

class AccessTokenRepository extends Repository {
    #accessToken = null;

    storeAccessToken(accessToken, isSession = false){
        const storage = isSession === true ? window.sessionStorage : window.localStorage;
        storage.setItem('accessToken', accessToken);
        this.#accessToken = accessToken;
    }

    getAccessToken(){
        if ( this.#accessToken === null ){
            this.#accessToken = window.localStorage.getItem('accessToken');
            if ( typeof this.#accessToken !== 'string' ){
                this.#accessToken = window.sessionStorage.getItem('accessToken');
            }
        }
        return this.#accessToken;
    }

    dropAccessToken(){
        window.sessionStorage.removeItem('accessToken');
        window.localStorage.removeItem('accessToken');
        this.#accessToken = null;
    }
}

export default AccessTokenRepository;
