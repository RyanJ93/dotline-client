'use strict';

import Repository from './Repository';
import User from '../models/User';

class UserRepository extends Repository {
    async store(id, username, RSAPublicKey, lastAccess){
        const user = new User();
        user.setRSAPublicKey(RSAPublicKey);
        user.setLastAccess(lastAccess);
        user.setUsername(username);
        user.setID(id);
        await user.save();
        return user;
    }

    async findMany(IDList){
        return await User.findAll({ id: IDList });
    }

    async find(id){
        return await User.find({ id: id });
    }
}

export default UserRepository;
