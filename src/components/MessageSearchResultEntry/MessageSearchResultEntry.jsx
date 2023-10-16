'use strict';

import styles from './MessageSearchResultEntry.scss';
import EntityIcon from '../EntityIcon/EntityIcon';
import DateUtils from '../../utils/DateUtils';
import App from '../../facades/App';
import React from 'react';

class MessageSearchResultEntry extends React.Component {
    #renderEntityIcon(){
        const conversation = this.props.message.getConversation();
        if ( conversation.isDMConversation() ){
            const members = conversation.getMembers(), userID = App.getAuthenticatedUser().getID();
            const user = members[0].getUser().getID() === userID ? members[1].getUser() : members[0].getUser();
            return <EntityIcon user={user} />;
        }
        return <EntityIcon text={conversation.getComputedName()} />;
    }

    render(){
        const conversationName = this.props.message.getConversation().getComputedName();
        const date = DateUtils.getPassedTime(this.props.message.getCreatedAt());
        return (
            <div className={styles.messageSearchResultEntry}>
                {this.#renderEntityIcon()}
                <div className={styles.lastMessage + ' text-primary'}>
                    <p className={styles.name}>{conversationName}</p>
                    <p className={styles.messagePreview}>{this.props.message.getContent()}</p>
                </div>
                <div className={styles.dateWrapper + ' text-primary'}>
                    <p className={styles.date}>{date}</p>
                </div>
            </div>
        );
    }
}

export default MessageSearchResultEntry;
