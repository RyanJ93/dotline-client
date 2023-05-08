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
    _surname;
    _name;
    _id;

    constructor(properties){
        this._RSAPublicKey = properties.RSAPublicKey;
        this._lastAccess = properties.lastAccess;
        this._username = properties.username;
        this._surname = properties.surname;
        this._name = properties.name;
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

    getSurname(){
        return this._surname;
    }

    getName(){
        return this._name;
    }

    getID(){
        return this._id;
    }

    toJSON(){
        return{
            RSAPublicKey: this._RSAPublicKey,
            lastAccess: this._lastAccess,
            username: this._username,
            surname: this._surname,
            name: this._name
        };
    }
}

export default User;
