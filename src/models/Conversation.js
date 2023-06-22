'use strict';

import HMACSigningParameters from '../DTOs/HMACSigningParameters';
import AESStaticParameters from '../DTOs/AESStaticParameters';
import App from '../facades/App';
import Model from './Model';

class Conversation extends Model {
    constructor(){
        super();

        this._mapping = {
            tableName: 'conversations',
            keys: ['id'],
            fields: {
                encryptionParameters: { name: 'encryptionParameters', DTO: AESStaticParameters },
                signingParameters: { name: 'signingParameters', DTO: HMACSigningParameters },
                members: { name: 'members', type: 'array' },
                name: { name: 'name', type: 'string' },
                id: { name: 'id', type: 'timeuuid' }
            }
        };
    }

    getComputedName(){
        let name = this.getName();
        if ( name === null ){
            const authenticatedUserID = App.getAuthenticatedUser().getID(), nameList = [];
            this.getMembers().forEach((member) => {
                if ( member.getUser().getID() !== authenticatedUserID ){
                    nameList.push(member.getUser().getComputedUser());
                }
            });
            name = nameList.join(', ');
        }
        return name;
    }

    isDMConversation(){
        return this.getName() === null && this.getMembers().length === 2;
    }

    setEncryptionParameters(encryptionParameters){
        this._attributes.encryptionParameters = encryptionParameters;
        return this;
    }

    getEncryptionParameters(){
        return this._attributes.encryptionParameters ?? null;
    }

    setSigningParameters(signingParameters){
        this._attributes.signingParameters = signingParameters;
        return this;
    }

    getSigningParameters(){
        return this._attributes.signingParameters ?? null;
    }

    setMembers(members){
        this._attributes.members = members;
        return this;
    }

    getMembers(){
        return this._attributes.members ?? null;
    }

    setName(name){
        this._attributes.name = name;
        return this;
    }

    getName(){
        return this._attributes.name ?? null;
    }

    setID(id){
        this._attributes.id = id;
        return this;
    }

    getID(){
        return this._attributes.id ?? null;
    }
}

export default Conversation;
