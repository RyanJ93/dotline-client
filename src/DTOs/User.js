'use strict';

class User {
    _RSAPublicKey;
    _lastAccess;
    _username;

    constructor(properties){
        this._RSAPublicKey = properties.RSAPublicKey;
        this._lastAccess = properties.lastAccess;
        this._username = properties.username;
    }

    getRSAPublicKey(){
        return this._RSAPublicKey;
    }

    getLastAccess(){
        return this._lastAccess;
    }

    getUsername(){
        return this._username;
    }

    toJSON(){
        return{
            RSAPublicKey: this._RSAPublicKey,
            lastAccess: this._lastAccess,
            username: this._username
        };
    }
}

export default User;
