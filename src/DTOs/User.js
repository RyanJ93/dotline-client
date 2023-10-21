'use strict';

import IllegalArgumentException from '../exceptions/IllegalArgumentException';

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

    _profilePictureID;
    _RSAPublicKey;
    _lastAccess;
    _username;
    _surname;
    _name;
    _id;

    constructor(properties){
        this._profilePictureID = properties.profilePictureID;
        this._RSAPublicKey = properties.RSAPublicKey;
        this._lastAccess = properties.lastAccess;
        this._username = properties.username;
        this._surname = properties.surname;
        this._name = properties.name;
        this._id = properties.id;
    }

    getComputedName(){
        let computedName = this._name ?? '';
        if ( computedName !== '' ){
            computedName += ' ';
        }
        computedName += this._surname ?? '';
        if ( computedName === '' ){
            computedName = '@' + this._username;
        }
        return computedName;
    }

    setProfilePictureID(profilePictureID){
        if ( profilePictureID !== null && ( profilePictureID === '' || typeof profilePictureID !== 'string' ) ){
            throw new IllegalArgumentException('Invalid profile picture ID.');
        }
        this._profilePictureID = profilePictureID;
        return this;
    }

    getProfilePictureID(){
        return this._profilePictureID;
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
