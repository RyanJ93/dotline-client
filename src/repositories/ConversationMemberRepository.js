'use strict';

import ConversationMember from '../models/ConversationMember';
import Repository from './Repository';

class ConversationMemberRepository extends Repository {
    async store(conversation, user, encryptionKey){
        const conversationMember = new ConversationMember();
        conversationMember.setEncryptionKey(encryptionKey);
        conversationMember.setConversation(conversation);
        conversationMember.setUser(user);
        await conversationMember.save();
        return conversationMember;
    }

    async findByConversation(conversation){
        return await ConversationMember.find({
            conversationID: conversation.getID()
        });
    }

    async findOne(conversation, user){
        return await ConversationMember.find({
            conversationID: conversation.getID(),
            userID: user.getID()
        });
    }
}

export default ConversationMemberRepository;
