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

    _handleMessageAdded(message){
        this.#setLastMessage(message);
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

    constructor(props){
        super(props);

        this.state = { conversation: props.conversation, lastMessage: null, userTypingMessage: null };
        this._handleMessageAdded = this._handleMessageAdded.bind(this);
        this._handleUserTyping = this._handleUserTyping.bind(this);
    }

    componentDidMount(){
        Event.getBroker().on('messageAdded', this._handleMessageAdded);
        Event.getBroker().on('userTyping', this._handleUserTyping);
        new MessageService(this.state.conversation).getNewestMessage().then((message) => {
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
        let lastMessageText = null;
        if ( this.state.userTypingMessage !== null ){
            lastMessageText = this.state.userTypingMessage;
        }else if ( this.state.lastMessage !== null ){
            lastMessageText = this.state.lastMessage.getContent();
        }
        return (
            <div className={styles.conversationCard} ref={this.#conversationCardRef}>
                <EntityIcon text={conversationName} />
                <div className={styles.info}>
                    <p className={styles.date}>
                        <DateLabel ref={this.#dateLabelRef} />
                    </p>
                    <p className={styles.name}>{conversationName}</p>
                    <p className={styles.messagePreview}>{lastMessageText}</p>
                </div>
            </div>
        );
    }
}

export default ConversationCard;
