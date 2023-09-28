'use strict';

import ConversationViewerHeader from '../ConversationViewerHeader/ConversationViewerHeader';
import AttachmentLightBox from '../AttachmentLightBox/AttachmentLightBox';
import ConversationService from '../../services/ConversationService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import MessageEditor from '../MessageEditor/MessageEditor';
import MessageService from '../../services/MessageService';
import MessageCard from '../MessageCard/MessageCard';
import Conversation from '../../models/Conversation';
import { withTranslation } from 'react-i18next';
import styles from './ConversationViewer.scss';
import DateUtils from '../../utils/DateUtils';
import DOMUtils from '../../utils/DOMUtils';
import Event from '../../facades/Event';
import App from '../../facades/App';
import React from 'react';

class ConversationViewer extends React.Component {
    #messageCardRefIndex = Object.create(null);
    #attachmentLightBoxRef = React.createRef();
    #conversationViewerRef = React.createRef();
    #scrollDownButtonRef = React.createRef();
    #messageEditorRef = React.createRef();
    #messageListRef = React.createRef();
    #dropZoneRef = React.createRef();
    #messageTypingSemaphore = true;
    #messageMarkIndex = new Set();
    #intersectionObserver = null;
    #messagePageLoading = false;
    #dragEventsCounter = 0;

    #getSortedMessageList(){
        return Array.from(this.state.messageList.values()).sort((a, b) => {
            return a.getCreatedAt().getTime() - b.getCreatedAt().getTime();
        });
    }

    #renderMessageLoader(){
        const { t } = this.props;
        return this.state.loading === true ? (
            <div className={styles.loaderWrapper + ' text-primary'}>
                <div className={styles.loader + ' loader-img'} />
                <p className={styles.label}>{t('conversationViewer.loading')}</p>
            </div>
        ) : null;
    }

    #renderMessageList(){
        let messageList = this.#getSortedMessageList(), renderedMessageList = [], previousPassedDate = null, { t } = this.props;
        if ( messageList.length === 0 && this.state.loading !== true ){
            renderedMessageList.push(<li key={'0'} className={styles.emptyMessage}>{t('conversationViewer.noMessage')}</li>);
        }else{
            messageList.forEach((message) => {
                const currentPassedDate = DateUtils.getPassedDate(message.getCreatedAt());
                this.#messageCardRefIndex[message.getID()] = React.createRef();
                if ( currentPassedDate !== previousPassedDate ){
                    renderedMessageList.push(
                        <li key={currentPassedDate} className={styles.dateSeparator}>
                            <span className={'bg-secondary text-white'}>{currentPassedDate}</span>
                        </li>
                    );
                    previousPassedDate = currentPassedDate;
                }
                renderedMessageList.push(
                    <li key={message.getID()} data-in-viewport={false} data-message-id={message.getID()}>
                        <MessageCard onMessageAction={this._handleMessageAction} onAttachmentClick={this._handleAttachmentClick} message={message} ref={this.#messageCardRefIndex[message.getID()]} />
                    </li>
                );
            });
        }
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
               window.setTimeout(() => this.#scrollListToBottom(), 250);
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

    #gotoLoadedMessage(message){
        const element = this.#messageListRef.current.querySelector('li[data-message-id="' + message.getID() + '"]');
        if ( element !== null ){
            window.setTimeout(() => element.setAttribute('data-highlighted', 'false'), 1000);
            element.setAttribute('data-highlighted', 'true');
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    #loadConversationPageByMessage(message){
        const messageService = new MessageService(this.state.conversation);
        if ( this.state.conversation instanceof Conversation ){
            this.state.messageList.set(message.getID(), message);
            Promise.all([
                messageService.getMessages(24, null, message.getID()),
                messageService.getMessages(25, message.getID())
            ]).then((messageLists) => {
                messageLists.forEach((messageList) => {
                    messageList.forEach((message) => this.state.messageList.set(message.getID(), message));
                });
            });
            this.setState((prev) => ({ ...prev, loading: false }));
            this.#triggerMessageListUpdate();
            this.#messagePageLoading = false;
            this.#gotoLoadedMessage(message);
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
        if ( message.getConversation().getID() === this.props.conversation?.getID() ){
            const isMine = message.getUser().getID() === App.getAuthenticatedUser().getID();
            this.state.messageList.set(message.getID(), message);
            this.#triggerMessageListUpdate();
            if ( isMine ){
                this.#scrollListToBottom();
            }
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

    _handleMessageSend(text, type, messageAttachmentList, message){
        if ( typeof this.props.onMessageSend === 'function' ){
            this.props.onMessageSend(text, type, messageAttachmentList, this.state.conversation, message);
        }
    }

    _handleIntersectionChange(entries){
        entries.forEach((entry) => {
            const inViewport = entry.isIntersecting ? 'true' : 'false';
            entry.target.closest('li[data-in-viewport]').setAttribute('data-in-viewport', inViewport);
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

    _handleDropZoneDragEnter(event){
        event.preventDefault();
        this.#dragEventsCounter = this.#dragEventsCounter < 0 ? 1 : ( this.#dragEventsCounter + 1 );
        this.#dropZoneRef.current.setAttribute('data-active', 'true');
    }

    _handleDropZoneDragLeave(event){
        event.preventDefault();
        this.#dragEventsCounter--;
        if ( this.#dragEventsCounter <= 0 ){
            this.#dropZoneRef.current.setAttribute('data-active', 'false');
        }
    }

    _handleDropZoneDrop(event){
        event.preventDefault();
        this.#dragEventsCounter = 0;
        this.#dropZoneRef.current.setAttribute('data-active', 'false');
        this.#messageEditorRef.current.addAttachments(event.dataTransfer.files);
    }

    _handleAttachmentClick(attachmentID, downloadedAttachmentList){
        this.#attachmentLightBoxRef.current.setDownloadedAttachmentList(downloadedAttachmentList).show(attachmentID);
    }

    constructor(props){
        super(props);

        this.state = { conversation: ( this.props.conversation ?? null ), userTypingMessage: null, messageList: new Map(), loading: true };
        this._handleIntersectionChange = this._handleIntersectionChange.bind(this);
        this._handleConversationAction = this._handleConversationAction.bind(this);
        this._handleConversationClose = this._handleConversationClose.bind(this);
        this._handleDropZoneDragEnter = this._handleDropZoneDragEnter.bind(this);
        this._handleDropZoneDragLeave = this._handleDropZoneDragLeave.bind(this);
        this._handleAttachmentClick = this._handleAttachmentClick.bind(this);
        this._handleDropZoneDrop = this._handleDropZoneDrop.bind(this);
        this._handleMessageAction = this._handleMessageAction.bind(this);
        this._handleMessageTyping = this._handleMessageTyping.bind(this);
        this._handleMessageSend = this._handleMessageSend.bind(this);
        this._handleScroll = this._handleScroll.bind(this);
    }

    componentDidMount(){
        Event.getBroker().on('messageAdded', (message) => this.#addMessage(message));
        Event.getBroker().on('conversationHeadReady', (conversationID) => {
            if ( this.state.conversation?.getID() === conversationID ){
                this.#loadConversationMessages();
            }
        });
        Event.getBroker().on('localDataCleared', () => {
            this.setState((prev) => ({ ...prev, loading: true }), () => {
                this.#messageMarkIndex.clear();
                this.state.messageList.clear();
            });
        });
        Event.getBroker().on('messageDelete', (messageID) => {
            this.state.messageList.delete(messageID);
            this.forceUpdate();
        });
        this.#messageListRef.current.onscroll = this._handleScroll;
        this.#loadConversationMessages();
    }

    gotoMessage(message){
        this.#loadConversationPageByMessage(message);
        return this;
    }

    render(){
        const { t } = this.props;
        return (
            <section className={styles.conversationViewer} ref={this.#conversationViewerRef} onDragEnter={this._handleDropZoneDragEnter} onDragOver={this._handleDropZoneDragEnter} onDragLeave={this._handleDropZoneDragLeave} onDrop={this._handleDropZoneDrop}>
                <div>
                    <ConversationViewerHeader conversation={this.state.conversation} user={this.state.user} onConversationClose={this._handleConversationClose} onConversationAction={this._handleConversationAction} />
                </div>
                <div className={styles.content} ref={this.#messageListRef}>
                    {this.#renderMessageLoader()}
                    {this.#renderMessageList()}
                    <div className={styles.scrollDownButton + ' text-primary'} onClick={() => this.#scrollListToBottom()} ref={this.#scrollDownButtonRef}>
                        <FontAwesomeIcon icon='fa-solid fa-chevron-circle-down' />
                    </div>
                </div>
                <div className={styles.messageEditorWrapper}>
                    <MessageEditor ref={this.#messageEditorRef} onMessageSend={this._handleMessageSend} onTyping={this._handleMessageTyping} />
                </div>
                <div className={styles.dropZone + ' bg-primary'} ref={this.#dropZoneRef} data-active={'false'}>
                    <div className={styles.dropZoneContent}>
                        <FontAwesomeIcon icon='fa-solid fa-paperclip' />
                        <p>{t('conversationViewer.dropZoneLabel')}</p>
                    </div>
                </div>
                <AttachmentLightBox ref={this.#attachmentLightBoxRef} />
            </section>
        );
    }
}

export default withTranslation(null, { withRef: true })(ConversationViewer);
