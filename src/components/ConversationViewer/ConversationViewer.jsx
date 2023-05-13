'use strict';

import ConversationViewerHeader from '../ConversationViewerHeader/ConversationViewerHeader';
import ConversationService from '../../services/ConversationService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import MessageEditor from '../MessageEditor/MessageEditor';
import MessageService from '../../services/MessageService';
import MessageCard from '../MessageCard/MessageCard';
import Conversation from '../../models/Conversation';
import styles from './ConversationViewer.scss';
import DateUtils from '../../utils/DateUtils';
import DOMUtils from '../../utils/DOMUtils';
import Event from '../../facades/Event';
import React from 'react';
import App from '../../facades/App';

class ConversationViewer extends React.Component {
    #conversationViewerRef = React.createRef();
    #scrollDownButtonRef = React.createRef();
    #messageEditorRef = React.createRef();
    #messageListRef = React.createRef();
    #messageTypingSemaphore = true;
    #messageMarkIndex = new Set();
    #intersectionObserver = null;
    #messagePageLoading = false;

    #getSortedMessageList(){
        return Array.from(this.state.messageList.values()).sort((a, b) => {
            return a.getCreatedAt().getTime() - b.getCreatedAt().getTime();
        });
    }

    #renderMessageLoader(){
        return this.state.loading === true ? <div className={styles.loader} /> : null;
    }

    #renderMessageList(){
        let messageList = this.#getSortedMessageList(), renderedMessageList = [], previousPassedDate = null;
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

    #scrollListToBottom(){
        const scrollHeight = this.#messageListRef.current.scrollHeight;
        DOMUtils.scrollTop(this.#messageListRef.current, scrollHeight);
        this.#updateScrollDownButtonVisibility();
    }

    #triggerMessageListUpdate(scrollToBottom = false){
        this.forceUpdate(() => {
            const elementList = this.#messageListRef.current.querySelectorAll('div[data-message-id]');
            this.#intersectionObserver = new IntersectionObserver(this._handleIntersectionChange, {
                root: this.#messageListRef.current,
                threshold: 1
            });
            elementList.forEach((element) => this.#intersectionObserver.observe(element));
            this.#updateScrollDownButtonVisibility();
            if ( scrollToBottom === true ){
               window.setTimeout(() => {
                  this.#scrollListToBottom();
               }, 250);
            }
        });
    }

    #loadConversationMessages(startingID = null){
        if ( this.#messagePageLoading === false ){
            if ( typeof startingID !== 'string' ){
                this.#messageMarkIndex.clear();
                this.state.messageList.clear();
            }
            const scrollToBottom = this.state.messageList.size === 0;
            if ( this.state.conversation instanceof Conversation ){
                this.setState((prev) => ({ ...prev, loading: true }));
                this.#messagePageLoading = true;
                new MessageService(this.state.conversation).getMessages(50, null, startingID).then((messageList) => {
                    messageList.forEach((message) => this.state.messageList.set(message.getID(), message));
                    this.setState((prev) => ({ ...prev, loading: false }));
                    this.#triggerMessageListUpdate(scrollToBottom);
                    this.#messagePageLoading = false;
                });
            }
        }
    }

    async #markMessageAsRead(message){
        const wrapperElement = this.#conversationViewerRef.current.closest('div[data-selected]');
        const isViewerActive = wrapperElement?.getAttribute('data-selected') === 'true';
        if ( isViewerActive && !message.getRead() && !this.#messageMarkIndex.has(message.getID()) ){
            this.#messageMarkIndex.add(message.getID());
            await new MessageService(this.state.conversation, message).markAsRead();
            this.#messageMarkIndex.delete(message.getID());
            this.#triggerMessageListUpdate();
        }
    }

    #addMessage(message){
        const isMine = message.getUser().getID() === App.getAuthenticatedUser().getID();
        this.state.messageList.set(message.getID(), message);
        this.#triggerMessageListUpdate();
        if ( isMine ){
            this.#scrollListToBottom();
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
        this.#addMessage(message);
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

    _handleIntersectionChange(entries, observer){
        entries.forEach((entry) => {
            if ( entry.isIntersecting === true ){
                const message = this.state.messageList.get(entry.target.getAttribute('data-message-id'));
                if ( typeof message !== 'undefined' ){
                    this.#markMessageAsRead(message);
                }
            }
        });
    }

    #updateScrollDownButtonVisibility(){
        const scrollTop = parseInt(this.#messageListRef.current.scrollTop);
        const scrollHeight = this.#messageListRef.current.scrollHeight;
        const offsetHeight = this.#messageListRef.current.offsetHeight;
        const isActive = scrollTop < ( scrollHeight - offsetHeight - 50 );
        this.#scrollDownButtonRef.current.style.display = isActive ? 'block' : 'none';
    }

    _handleScroll(event){
        if ( parseInt(event.target.scrollTop) <= 50 ){
            const startingID = this.#getSortedMessageList()[0]?.getID() ?? null;
            this.#loadConversationMessages(startingID);
        }
        this.#updateScrollDownButtonVisibility();
    }

    _handleConversationHeadReady(conversationID){
        if ( this.state.conversation?.getID() === conversationID ){
            this.#loadConversationMessages();
        }
    }

    _handleLocalDataCleared(){
        this.setState((prev) => ({ ...prev, loading: true }), () => {
            this.#messageMarkIndex.clear();
            this.state.messageList.clear();
        });
    }

    constructor(props){
        super(props);

        this.state = { conversation: ( this.props.conversation ?? null ), userTypingMessage: null, messageList: new Map(), loading: true };
        this._handleConversationHeadReady = this._handleConversationHeadReady.bind(this);
        this._handleIntersectionChange = this._handleIntersectionChange.bind(this);
        this._handleConversationAction = this._handleConversationAction.bind(this);
        this._handleConversationClose = this._handleConversationClose.bind(this);
        this._handleLocalDataCleared = this._handleLocalDataCleared.bind(this);
        this._handleMessageDelete = this._handleMessageDelete.bind(this);
        this._handleMessageAction = this._handleMessageAction.bind(this);
        this._handleMessageTyping = this._handleMessageTyping.bind(this);
        this._handleMessageAdded = this._handleMessageAdded.bind(this);
        this._handleMessageSend = this._handleMessageSend.bind(this);
        this._handleScroll = this._handleScroll.bind(this);
    }

    componentDidMount(){
        Event.getBroker().on('conversationHeadReady', this._handleConversationHeadReady);
        Event.getBroker().on('localDataCleared', this._handleLocalDataCleared);
        Event.getBroker().on('messageDelete', this._handleMessageDelete);
        Event.getBroker().on('messageAdded', this._handleMessageAdded);
        this.#messageListRef.current.onscroll = this._handleScroll;
        this.#loadConversationMessages();
    }

    render(){
        return (
            <section className={styles.conversationViewer} ref={this.#conversationViewerRef}>
                <div>
                    <ConversationViewerHeader conversation={this.state.conversation} user={this.state.user} onConversationClose={this._handleConversationClose} onConversationAction={this._handleConversationAction} />
                </div>
                <div className={styles.content} ref={this.#messageListRef}>
                    {this.#renderMessageLoader()}
                    {this.#renderMessageList()}
                    <div className={styles.scrollDownButton} onClick={() => this.#scrollListToBottom()} ref={this.#scrollDownButtonRef}>
                        <FontAwesomeIcon icon='fa-solid fa-chevron-circle-down' />
                    </div>
                </div>
                <div className={styles.messageEditorWrapper}>
                    <MessageEditor ref={this.#messageEditorRef} onMessageSend={this._handleMessageSend} onTyping={this._handleMessageTyping} />
                </div>
            </section>
        );
    }
}

export default ConversationViewer;
