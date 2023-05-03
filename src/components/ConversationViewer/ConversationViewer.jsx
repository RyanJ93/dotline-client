'use strict';

import ConversationViewerHeader from '../ConversationViewerHeader/ConversationViewerHeader';
import ConversationService from '../../services/ConversationService';
import MessageEditor from '../MessageEditor/MessageEditor';
import MessageService from '../../services/MessageService';
import MessageCard from '../MessageCard/MessageCard';
import Conversation from '../../models/Conversation';
import styles from './ConversationViewer.scss';
import DateUtils from '../../utils/DateUtils';
import Event from '../../facades/Event';
import React from 'react';

class ConversationViewer extends React.Component {
    #messageEditorRef = React.createRef();
    #messageListRef = React.createRef();
    #messageTypingSemaphore = true;

    #renderMessageList(){
        let messageList = Array.from(this.state.messageList.values()).sort((a, b) => {
            return a.getCreatedAt().getTime() - b.getCreatedAt().getTime();
        }), renderedMessageList = [], previousPassedDate = null;
        messageList.forEach((message) => {
            const currentPassedDate = DateUtils.getPassedDate(message.getCreatedAt());
            if ( currentPassedDate !== previousPassedDate ){
                renderedMessageList.push(<li key={currentPassedDate} className={styles.dateSeparator}>{currentPassedDate}</li>);
                previousPassedDate = currentPassedDate;
            }
            renderedMessageList.push(
                <li key={message.getID()}>
                    <MessageCard onMessageAction={this._handleMessageAction} message={message} />
                </li>
            );
        });
        return <ul className={styles.messageList}>{renderedMessageList}</ul>;
    }

    #triggerMessageListUpdate(){
        this.forceUpdate(() => {
            const scrollHeight = this.#messageListRef.current.scrollHeight;
            this.#messageListRef.current.scrollTo(0, scrollHeight);
        });
    }

    #loadConversationMessages(){
        this.state.messageList.clear();
        if ( this.state.conversation instanceof Conversation ){
            new MessageService(this.state.conversation).getMessages().then((messageList) => {
                messageList.forEach((message) => this.state.messageList.set(message.getID(), message));
                this.#triggerMessageListUpdate();
            });
        }
    }

    _handleConversationAction(action, conversation){
        switch(action){
            case 'delete-global':
            case 'delete-local': {
                if ( typeof this.props.onConversationDelete === 'function' ){
                    this.props.onConversationDelete(conversation, action === 'delete-global');
                }
            }break;
        }
    }

    _handleMessageAction(action, message){
        switch(action){
            case 'edit': {
                this.#messageEditorRef.current.setMessage(message);
            }break;
            case 'delete-global':
            case 'delete-local': {
                if ( typeof this.props.onMessageDelete === 'function' ){
                    this.props.onMessageDelete(message, action === 'delete-global');
                }
            }break;
        }
    }

    _handleMessageAdded(message){
        this.addMessage(message);
    }

    _handleMessageDelete(messageID){
        this.state.messageList.delete(messageID);
    }

    _handleConversationClose(){
        if ( typeof this.props.onConversationClose === 'function' ){
            this.props.onConversationClose();
        }
    }

    async _handleMessageTyping(){
        if ( this.state.conversation instanceof Conversation && this.#messageTypingSemaphore === true ){
            this.#messageTypingSemaphore = false;
            window.setInterval(async () => this.#messageTypingSemaphore = true, 3000);
            await new ConversationService(this.state.conversation).notifyTyping();
        }
    }

    _handleMessageSend(text, message){
        if ( typeof this.props.onMessageSend === 'function' ){
            this.props.onMessageSend(text, this.state.conversation, message);
        }
    }

    constructor(props){
        super(props);

        this.state = { conversation: ( this.props.conversation ?? null ), userTypingMessage: null, messageList: new Map() };
        this._handleConversationAction = this._handleConversationAction.bind(this);
        this._handleConversationClose = this._handleConversationClose.bind(this);
        this._handleMessageDelete = this._handleMessageDelete.bind(this);
        this._handleMessageAction = this._handleMessageAction.bind(this);
        this._handleMessageTyping = this._handleMessageTyping.bind(this);
        this._handleMessageAdded = this._handleMessageAdded.bind(this);
        this._handleMessageSend = this._handleMessageSend.bind(this);
    }

    componentDidMount(){
        Event.getBroker().on('messageDelete', this._handleMessageDelete);
        Event.getBroker().on('messageAdded', this._handleMessageAdded);
        this.#loadConversationMessages();
    }

    setConversation(conversation){
        this.setState((prev) => {
            return { ...prev, conversation: conversation };
        }, () => this.#loadConversationMessages());
        return this;
    }

    getConversation(){
        return this.state.conversation;
    }

    addMessage(message){
        this.state.messageList.set(message.getID(), message);
        this.#triggerMessageListUpdate();
        return this;
    }

    render(){
        return (
            <section className={styles.conversationViewer}>
                <div>
                    <ConversationViewerHeader conversation={this.state.conversation} user={this.state.user} onConversationClose={this._handleConversationClose} onConversationAction={this._handleConversationAction} />
                </div>
                <div className={styles.content} ref={this.#messageListRef}>
                    {this.#renderMessageList()}
                </div>
                <div className={styles.messageEditorWrapper}>
                    <MessageEditor ref={this.#messageEditorRef} onMessageSend={this._handleMessageSend} onTyping={this._handleMessageTyping} />
                </div>
            </section>
        );
    }
}

export default ConversationViewer;
