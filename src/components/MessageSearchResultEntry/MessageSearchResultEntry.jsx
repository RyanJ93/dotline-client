'use strict';

import styles from './MessageSearchResultEntry.scss';
import EntityIcon from '../EntityIcon/EntityIcon';
import DateUtils from '../../utils/DateUtils';
import React from 'react';

class MessageSearchResultEntry extends React.Component {
    render(){
        const conversationName = this.props.message.getConversation().getComputedName();
        const date = DateUtils.getPassedTime(this.props.message.getCreatedAt());
        return (
            <div className={styles.messageSearchResultEntry}>
                <EntityIcon text={conversationName} />
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
