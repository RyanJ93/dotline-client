'use strict';

import ConversationViewerHeader from '../ConversationViewerHeader/ConversationViewerHeader';
import AttachmentLightBox from '../AttachmentLightBox/AttachmentLightBox';
import ConversationService from '../../services/ConversationService';
import MessageSyncManager from '../../support/MessageSyncManager';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import MessageEditor from '../MessageEditor/MessageEditor';
import MessageService from '../../services/MessageService';
import MessageCard from '../MessageCard/MessageCard';
import Conversation from '../../models/Conversation';
import { withTranslation } from 'react-i18next';
import styles from './ConversationViewer.scss';
import DateUtils from '../../utils/DateUtils';
import DropZone from '../DropZone/DropZone';
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
    #infiniteScrollingSemaphore = true;
    #messageTypingSemaphore = true;
    #messageMarkIndex = new Set();
    #intersectionObserver = null;

    #getSortedMessageList(){
        return Array.from(this.state.messageList.values()).sort((a, b) => a.getCreatedAt().getTime() - b.getCreatedAt().getTime());
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
                        <li key={currentPassedDate} className={styles.dateSeparator + ' border-secondary'}>
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

    #scrollListToBottom(useSmoothScrolling = false){
        this.#messageListRef.current.querySelector('li[data-message-id]:last-child')?.scrollIntoView({
            behavior: ( useSmoothScrolling === true ? 'smooth' : 'instant' ),
            inline: 'nearest',
            block: 'end'
        });
        this.#updateScrollDownButtonVisibility();
    }

    #refreshIntersectionObserver(){
        const elementList = this.#messageListRef.current.querySelectorAll('div[data-message-id]');
        if ( this.#intersectionObserver === null ){
            this.#intersectionObserver = new IntersectionObserver(this._handleIntersectionChange, {
                root: this.#messageListRef.current, threshold: 1
            });
        }
        elementList.forEach((element) => this.#intersectionObserver.observe(element));
    }

    #triggerMessageListUpdate(scrollToBottom = false, delayedScrolling = true){
        this.#refreshIntersectionObserver();
        if ( scrollToBottom === true ){
            const timeout = delayedScrolling !== true ? 1 : 1000;
            window.setTimeout(() => this.#scrollListToBottom(), timeout);
        }
    }

    #resetListContent(){
        this.setState((prev) => ({ ...prev, messageDateThreshold: null, messageList: new Map() }));
        this.#messageMarkIndex.clear();
    }

    #updateMessageDateThreshold(messageList){
        let hasMessageDateThresholdBeenUpdated = false;
        if ( messageList.length > 0 ){
            let mostRecentDate = null, { messageDateThreshold } = this.state;
            messageList.forEach((message) => {
                if ( mostRecentDate === null && message.getCreatedAt() > mostRecentDate ){
                    mostRecentDate = message.getCreatedAt();
                }
            });
            if ( messageDateThreshold === null || messageDateThreshold < mostRecentDate ){
                this.setState((prev) => ({ ...prev, messageDateThreshold: mostRecentDate }));
                hasMessageDateThresholdBeenUpdated = true;
            }
        }
        return hasMessageDateThresholdBeenUpdated;
    }

    async #loadConversationMessages(startingID = null, context = null){
        if ( this.state.messagePageLoading === false && this.state.conversation instanceof Conversation ){
            this.setState((prev) => ({ ...prev, loading: true, messagePageLoading: true }));
            const messageList = await new MessageService(this.state.conversation).getMessages(50, null, startingID);
            messageList.forEach((message) => this.state.messageList.set(message.getID(), message));
            const updated = this.#updateMessageDateThreshold(messageList);
            const scrollToBottom = context === 'first-load' || ( context === 'conversation-head-load' && updated );
            this.setState((prev) => ({ ...prev, loading: false, messagePageLoading: false }), () => {
                if ( messageList.length > 0 ){
                    this.#triggerMessageListUpdate(scrollToBottom);
                }
            });
        }
    }

    #gotoLoadedMessage(message){
        const element = this.#messageListRef.current.querySelector('li[data-message-id="' + message.getID() + '"]');
        if ( element !== null ){
            window.setTimeout(() => element.setAttribute('data-highlighted', 'false'), 1000);
            element.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'end' });
            element.setAttribute('data-highlighted', 'true');
        }
    }

    #loadConversationPageByMessage(message){
        if ( this.state.conversation instanceof Conversation ){
            const messageService = new MessageService(this.state.conversation);
            this.state.messageList.set(message.getID(), message);
            Promise.all([
                messageService.getMessages(24, null, message.getID()),
                messageService.getMessages(25, message.getID())
            ]).then((messageLists) => {
                messageLists.forEach((messageList) => {
                    messageList.forEach((message) => this.state.messageList.set(message.getID(), message));
                });
            });
            this.setState((prev) => ({ ...prev, loading: false, messagePageLoading: false }));
            this.#triggerMessageListUpdate();
            this.#gotoLoadedMessage(message);
        }
    }

    async #markMessageAsRead(message){
        const isViewerActive = window.getComputedStyle(this.#conversationViewerRef.current).visibility !== 'hidden';
        if ( isViewerActive && !message.getRead() && !this.#messageMarkIndex.has(message.getID()) ){
            this.#messageMarkIndex.add(message.getID());
            await new MessageService(this.state.conversation, message).markAsRead();
            this.#messageMarkIndex.delete(message.getID());
        }
    }

    #addMessage(message){
        const { conversation, messageDateThreshold } = this.state, messageConversation = message.getConversation();
        const isCurrentConversation = messageConversation.getID() === conversation?.getID();
        if ( isCurrentConversation && message.getCreatedAt() >= messageDateThreshold ){
            const isScrolledToBottom = DOMUtils.isScrolledToBottom(this.#messageListRef.current, 100);
            const isMyMessage = message.getUser().getID() === App.getAuthenticatedUser().getID();
            const isSyncProcessRunning = MessageSyncManager.getInstance().isSyncProcessRunning();
            const updated = this.#updateMessageDateThreshold([message]);
            const scrollToBottom = ( isScrolledToBottom || isMyMessage ) && !isSyncProcessRunning && updated;
            this.state.messageList.set(message.getID(), message);
            this.#triggerMessageListUpdate(scrollToBottom, false);
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
        const isScrolledToBottom = DOMUtils.isScrolledToBottom(this.#messageListRef.current, 100);
        this.#scrollDownButtonRef.current.style.display = isScrolledToBottom ? 'none' : 'block';
    }

    _handleScroll(event){
        if ( this.#infiniteScrollingSemaphore === true && parseInt(event.target.scrollTop) <= 50 ){
            this.#infiniteScrollingSemaphore = false;
            const startingID = this.#getSortedMessageList()[0]?.getID() ?? null;
            this.#loadConversationMessages(startingID).finally(() => {
                if ( this.#infiniteScrollingSemaphore === false ){
                    window.setTimeout(() => this.#infiniteScrollingSemaphore = true, 1000);
                }
            });
        }
        this.#updateScrollDownButtonVisibility();
    }

    _handleFileDrop(files){
        this.#messageEditorRef.current.addAttachments(files);
    }

    _handleAttachmentClick(attachmentID, downloadedAttachmentList){
        this.#attachmentLightBoxRef.current.setDownloadedAttachmentList(downloadedAttachmentList).show(attachmentID);
    }

    constructor(props){
        super(props);

        this._handleIntersectionChange = this._handleIntersectionChange.bind(this);
        this._handleConversationAction = this._handleConversationAction.bind(this);
        this._handleConversationClose = this._handleConversationClose.bind(this);
        this._handleAttachmentClick = this._handleAttachmentClick.bind(this);
        this._handleMessageAction = this._handleMessageAction.bind(this);
        this._handleMessageTyping = this._handleMessageTyping.bind(this);
        this._handleMessageSend = this._handleMessageSend.bind(this);
        this._handleFileDrop = this._handleFileDrop.bind(this);
        this._handleScroll = this._handleScroll.bind(this);
        this.state = {
            loading: ( this.props.initialLoadingStatus !== false ),
            conversation: ( this.props.conversation ?? null ),
            messageDateThreshold: null,
            messagePageLoading: false,
            userTypingMessage: null,
            messageList: new Map()
        };
    }

    componentWillUnmount(){
        this.#intersectionObserver?.disconnect();
        this.#intersectionObserver = null;
    }

    componentDidMount(){
        Event.getBroker().on('localDataCleared', () => {
            this.setState((prev) => ({ ...prev, loading: true }), () => this.#resetListContent());
        });
        Event.getBroker().on('messageDelete', (messageID) => {
            this.state.messageList.delete(messageID);
            this.forceUpdate();
        });
        Event.getBroker().on('messageAdded', (message) => this.#addMessage(message));
        Event.getBroker().on('conversationHeadReady', (conversationID) => {
            if ( this.state.conversation?.getID() === conversationID ){
                this.#loadConversationMessages(null, 'conversation-head-load').catch((ex) => console.error(ex));
            }
        });
        this.#loadConversationMessages(null, 'first-load').catch((ex) => console.error(ex));
        this.#messageListRef.current.onscroll = this._handleScroll;
    }

    gotoMessage(message){
        this.#loadConversationPageByMessage(message);
        return this;
    }

    render(){
        return (
            <DropZone onFileDrop={this._handleFileDrop}>
                <section className={styles.conversationViewer} ref={this.#conversationViewerRef}>
                    <div>
                        <ConversationViewerHeader conversation={this.state.conversation} user={this.state.user} onConversationClose={this._handleConversationClose} onConversationAction={this._handleConversationAction} />
                    </div>
                    <div className={styles.content} ref={this.#messageListRef}>
                        {this.#renderMessageLoader()}
                        {this.#renderMessageList()}
                        <div className={styles.scrollDownButton + ' text-primary'} onClick={() => this.#scrollListToBottom(true)} ref={this.#scrollDownButtonRef}>
                            <FontAwesomeIcon icon='fa-solid fa-chevron-circle-down' />
                        </div>
                    </div>
                    <div className={styles.messageEditorWrapper}>
                        <MessageEditor ref={this.#messageEditorRef} onMessageSend={this._handleMessageSend} onTyping={this._handleMessageTyping} />
                    </div>
                    <AttachmentLightBox ref={this.#attachmentLightBoxRef} />
                </section>
            </DropZone>
        );
    }
}

export default withTranslation(null, { withRef: true })(ConversationViewer);
