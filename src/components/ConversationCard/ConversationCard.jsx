'use strict';

import MessageService from '../../services/MessageService';
import EntityIcon from '../EntityIcon/EntityIcon';
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
        if ( message !== null && ( this.state.lastMessage === null || this.state.lastMessage.getCreatedAt() < message.getCreatedAt() ) ){
            this.setState((prev) => ({ ...prev, lastMessage: message }));
            this.#dateLabelRef.current?.setDate(message.getCreatedAt());
        }
    }

    #refreshUnreadMessageCount(){
        new MessageService(this.state.conversation).getUnreadMessageCount().then((unreadMessageCount) => {
            unreadMessageCount = unreadMessageCount >= 1000 ? '999+' : unreadMessageCount.toString();
            this.setState((prev) => ({ ...prev, unreadMessageCount: unreadMessageCount }));
        });
    }

    #renderUnreadMessageCount(){
        let renderedUnreadMessageCount = null;
        if ( this.state.unreadMessageCount > 0 ){
            renderedUnreadMessageCount = <p className={styles.unreadMessageCounter}>{this.state.unreadMessageCount}</p>;
        }
        return renderedUnreadMessageCount;
    }

    #computeLastMessageText(){
        let lastMessageText = null;
        if ( this.state.userTypingMessage !== null ){
            lastMessageText = this.state.userTypingMessage;
        }else if ( this.state.lastMessage !== null ){
            lastMessageText = this.state.lastMessage.getContent();
            if ( lastMessageText === '' ){
                const count = this.state.lastMessage.getAttachments().length;
                if ( count > 0 ){
                    lastMessageText = count + ' files';
                }
            }
        }
        return lastMessageText;
    }

    _handleMessageAdded(message){
        this.#refreshUnreadMessageCount();
        this.#setLastMessage(message);
    }

    _handleMessageEdit(){
        this.#refreshUnreadMessageCount();
    }

    _handleUserTyping(conversation, user){
        const isThisConversation = conversation?.getID() === this.state.conversation?.getID();
        const isEventReferredToMe = user?.getID() === App.getAuthenticatedUser().getID();
        if ( isThisConversation && !isEventReferredToMe ){
            if ( this.#userTypingMessageTimeoutID !== null ){
                window.clearTimeout(this.#userTypingMessageTimeoutID);
            }
            this.setState((prev) => { return { ...prev, userTypingMessage: 'Typing...' } });
            this.#userTypingMessageTimeoutID = window.setTimeout(() => {
                this.setState((prev) => { return { ...prev, userTypingMessage: null } });
            }, 2000);
        }
    }

    _handleConversationHeadReady(){
        new MessageService(this.state.conversation).getNewestMessage().then((message) => this.#setLastMessage(message));
    }

    _handleMessageSyncEnd(){
        this.#refreshUnreadMessageCount();
    }

    _handleLocalDataCleared(){
        this.setState((prev) => ({ ...prev, lastMessage: null, unreadMessageCount: 0 }));
    }

    constructor(props){
        super(props);

        this.state = { conversation: props.conversation, lastMessage: null, userTypingMessage: null, unreadMessageCount: 0 };
        this._handleConversationHeadReady = this._handleConversationHeadReady.bind(this);
        this._handleLocalDataCleared = this._handleLocalDataCleared.bind(this);
        this._handleMessageSyncEnd = this._handleMessageSyncEnd.bind(this);
        this._handleMessageAdded = this._handleMessageAdded.bind(this);
        this._handleMessageEdit = this._handleMessageEdit.bind(this);
        this._handleUserTyping = this._handleUserTyping.bind(this);
    }

    componentDidMount(){
        Event.getBroker().on('conversationHeadReady', this._handleConversationHeadReady);
        Event.getBroker().on('localDataCleared', this._handleLocalDataCleared);
        Event.getBroker().on('messageSyncEnd', this._handleMessageSyncEnd);
        Event.getBroker().on('messageAdded', this._handleMessageAdded);
        Event.getBroker().on('messageEdit', this._handleMessageEdit);
        Event.getBroker().on('userTyping', this._handleUserTyping);
        new MessageService(this.state.conversation).getNewestMessage().then((message) => {
            this.#refreshUnreadMessageCount();
            this.#setLastMessage(message);
        });
    }

    setConversation(conversation){
        this.setState((prev) => ({ ...prev, conversation: conversation }));
        return this;
    }

    getConversation(){
        return this.state.conversation;
    }

    render(){
        const conversationName = this.state.conversation.getComputedName();
        const lastMessageText = this.#computeLastMessageText();
        return (
            <div className={styles.conversationCard} ref={this.#conversationCardRef}>
                <EntityIcon text={conversationName} />
                <div className={styles.lastMessage}>
                    <p className={styles.name}>{conversationName}</p>
                    <p className={styles.messagePreview}>{lastMessageText}</p>
                </div>
                <div className={styles.dateWrapper}>
                    <p className={styles.date}>
                        <DateLabel ref={this.#dateLabelRef} />
                    </p>
                    {this.#renderUnreadMessageCount()}
                </div>
            </div>
        );
    }
}

export default ConversationCard;
