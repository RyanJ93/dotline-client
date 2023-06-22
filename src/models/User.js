'use strict';

import Model from './Model';

class User extends Model {
    constructor(){
        super();

        this._mapping = {
            keys: ['id'],
            tableName: 'users',
            fields: {
                RSAPublicKey: { name: 'RSAPublicKey', type: 'string' },
                lastAccess: { name: 'lastAccess', type: 'date' },
                username: { name: 'username', type: 'string' },
                surname: { name: 'surname', type: 'string' },
                name: { name: 'name', type: 'string' },
                id: { name: 'id', type: 'timeuuid' }
            }
        };
    }

    getComputedUser(){
        let computedName = this._attributes?.name ?? '';
        if ( computedName !== '' ){
            computedName += ' ';
        }
        computedName += this._attributes?.surname ?? '';
        if ( computedName === '' ){
            computedName = '@' + this._attributes?.username;
        }
        return computedName;
    }

    setRSAPublicKey(RSAPublicKey){
        this._attributes.RSAPublicKey = RSAPublicKey;
        return this;
    }

    getRSAPublicKey(){
        return this._attributes?.RSAPublicKey ?? null;
    }

    setLastAccess(lastAccess){
        this._attributes.lastAccess = lastAccess;
        return this;
    }

    getLastAccess(){
        return this._attributes?.lastAccess ?? null;
    }

    setUsername(username){
        this._attributes.username = username;
        return this;
    }

    getUsername(){
        return this._attributes?.username ?? null;
    }

    setSurname(surname){
        this._attributes.surname = surname;
        return this;
    }

    getSurname(){
        return this._attributes?.surname ?? null;
    }

    setName(name){
        this._attributes.name = name;
        return this;
    }

    getName(){
        return this._attributes?.name ?? null;
    }

    setID(id){
        this._attributes.id = id;
        return this;
    }

    getID(){
        return this._attributes?.id ?? null;
    }
}

export default User;
