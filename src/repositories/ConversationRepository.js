'use strict';

import Conversation from '../models/Conversation';
import Repository from './Repository';

class ConversationRepository extends Repository {
    async store(id, encryptionParameters, signingParameters, members, name){
        const conversation = new Conversation();
        conversation.setEncryptionParameters(encryptionParameters);
        conversation.setSigningParameters(signingParameters);
        conversation.setMembers(members);
        conversation.setName(name);
        conversation.setID(id);
        await conversation.save();
        return conversation;
    }

    async getByID(id){
        return await Conversation.find({ where: { id: id } });
    }

    async getAll(){
        return await Conversation.findAll({});
    }

    async deleteByID(conversationID){
        await Conversation.findAndDelete({ id: conversationID });
    }

    async delete(conversation){
        await conversation.delete();
    }
}

export default ConversationRepository;
