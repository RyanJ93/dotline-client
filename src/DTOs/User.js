'use strict';

class User {
    static makeFromHTTPResponse(response){
        let { lastAccess } = response.user;
        if ( lastAccess !== null ){
            lastAccess = new Date(lastAccess);
        }
        return new User(Object.assign(response.user, {
            lastAccess: lastAccess
        }));
    }

    _RSAPublicKey;
    _lastAccess;
    _username;
    _id;

    constructor(properties){
        this._RSAPublicKey = properties.RSAPublicKey;
        this._lastAccess = properties.lastAccess;
        this._username = properties.username;
        this._id = properties.id;
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

    getID(){
        return this._id;
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
