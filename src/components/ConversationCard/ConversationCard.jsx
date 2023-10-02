'use strict';

import MessageService from '../../services/MessageService';
import EntityIcon from '../EntityIcon/EntityIcon';
import { withTranslation } from 'react-i18next';
import DateLabel from '../DateLabel/DateLabel';
import styles from './ConversationCard.scss';
import Event from '../../facades/Event';
import App from '../../facades/App';
import React from 'react';

class ConversationCard extends React.Component {
    #conversationCardRef = React.createRef();
    #userTypingMessageTimeoutID = null;
    #dateLabelRef = React.createRef();

    #setLastMessage(message){
        if ( message !== null && message.getConversation().getID() === this.props.conversation?.getID() ){
            if ( this.state.lastMessage === null || this.state.lastMessage.getCreatedAt() < message.getCreatedAt() ){
                this.setState((prev) => ({ ...prev, lastMessage: message }));
                this.#dateLabelRef.current?.setDate(message.getCreatedAt());
            }
        }
    }

    #refreshUnreadMessageCount(){
        new MessageService(this.props.conversation).getUnreadMessageCount().then((unreadMessageCount) => {
            unreadMessageCount = unreadMessageCount >= 1000 ? '999+' : unreadMessageCount.toString();
            this.setState((prev) => ({ ...prev, unreadMessageCount: unreadMessageCount }));
        });
    }

    #computeLastMessageText(){
        let lastMessageText = this.state.lastMessage?.getPreviewContent() ?? '';
        if ( this.state.userTypingMessage !== null ){
            lastMessageText = this.state.userTypingMessage;
        }
        return lastMessageText;
    }

    _handleUserTyping(conversation, user){
        const isThisConversation = conversation?.getID() === this.props.conversation?.getID();
        const isEventReferredToMe = user?.getID() === App.getAuthenticatedUser().getID();
        const { t } = this.props, userTypingMessage = t('conversationCard.typing');
        if ( isThisConversation && !isEventReferredToMe ){
            if ( this.#userTypingMessageTimeoutID !== null ){
                window.clearTimeout(this.#userTypingMessageTimeoutID);
            }
            this.setState((prev) => ({ ...prev, userTypingMessage: userTypingMessage }));
            this.#userTypingMessageTimeoutID = window.setTimeout(() => {
                this.setState((prev) => ({ ...prev, userTypingMessage: null }));
            }, 2000);
        }
    }

    constructor(props){
        super(props);

        this.state = { lastMessage: null, userTypingMessage: null, unreadMessageCount: 0 };
        this._handleUserTyping = this._handleUserTyping.bind(this);
    }

    componentDidMount(){
        Event.getBroker().on('conversationHeadReady', () => {
            new MessageService(this.props.conversation).getNewestMessage().then((message) => this.#setLastMessage(message));
        });
        Event.getBroker().on('localDataCleared', () => this.setState((prev) => ({ ...prev, lastMessage: null, unreadMessageCount: 0 })));
        Event.getBroker().on('messageSyncEnd', () => this.#refreshUnreadMessageCount());
        Event.getBroker().on('messageEdit', () => this.#refreshUnreadMessageCount());
        Event.getBroker().on('userTyping', this._handleUserTyping);
        Event.getBroker().on('messageAdded', (message) => {
            this.#refreshUnreadMessageCount();
            this.#setLastMessage(message);
        });
        new MessageService(this.props.conversation).getNewestMessage().then((message) => {
            this.#refreshUnreadMessageCount();
            this.#setLastMessage(message);
        });
    }

    render(){
        const conversationName = this.props.conversation.getComputedName();
        const lastMessageText = this.#computeLastMessageText();
        const { unreadMessageCount } = this.state;
        return (
            <div className={styles.conversationCard} ref={this.#conversationCardRef}>
                <EntityIcon text={conversationName} />
                <div className={styles.lastMessage}>
                    <p className={styles.name}>{conversationName}</p>
                    <div className={styles.messagePreviewWrapper}>
                        <p className={styles.messagePreview}>{lastMessageText}</p>
                    </div>
                </div>
                <div className={styles.dateWrapper}>
                    <p className={styles.date}>
                        <DateLabel ref={this.#dateLabelRef} />
                    </p>
                    { unreadMessageCount > 0 && <p className={styles.unreadMessageCounter + ' bg-accent text-white'}>{unreadMessageCount}</p> }
                </div>
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(ConversationCard);
