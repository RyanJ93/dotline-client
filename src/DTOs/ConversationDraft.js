'use strict';

import App from '../facades/App';

class ConversationDraft {
    #members;

    constructor(properties){
        this.#members = properties.members;
    }

    getComputedName(){
        const usernameList = this.getMembers().map((member) => member.getUsername());
        const authenticatedUserUsername = App.getAuthenticatedUser().getUsername();
        return usernameList.filter((username) => {
            return username !== authenticatedUserUsername;
        }).join(', ');
    }

    isDMConversation(){
        return this.getMembers().length === 2;
    }

    getMembers(){
        return this.#members;
    }
}

export default ConversationDraft;
