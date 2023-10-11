'use strict';

import MessageImportStatsViewer from '../MessageImportStatsViewer/MessageImportStatsViewer';
import ConversationViewerList from '../ConversationViewerList/ConversationViewerList';
import UserOnlineStatusService from '../../services/UserOnlineStatusService';
import ConversationService from '../../services/ConversationService';
import SearchResultEntryType from '../../enum/SearchResultEntryType';
import ConversationDraft from '../../DTOs/ConversationDraft';
import MessageService from '../../services/MessageService';
import MessageBox from '../../facades/MessageBox';
import { withTranslation } from 'react-i18next';
import SideBar from '../SideBar/SideBar';
import styles from './MainView.scss';
import App from '../../facades/App';
import React from 'react';

class MainView extends React.Component {
    #conversationViewerListRef = React.createRef();
    #sideBarRef = React.createRef();

    async #createNewConversation(conversationDraft){
        const conversation = await new ConversationService().createConversation(conversationDraft.getMembers());
        this.#conversationViewerListRef.current.setSelectedConversationID(conversation.getID());
        return conversation;
    }

    async #sendMessage(messageText, messageType, messageAttachmentList, conversation, message){
        if ( conversation instanceof ConversationDraft ){
            conversation = await this.#createNewConversation(conversation);
        }
        const messageService = new MessageService(conversation);
        if ( message !== null ){
            return await messageService.setMessage(message).edit(messageText);
        }
        await messageService.send(messageText, messageType, messageAttachmentList);
        this.#selectConversation(conversation.getID());
    }

    async #deleteMessage(message, deleteForEveryone){
        const title = this.props.t('message.delete.confirmation.title');
        const text = this.props.t('message.delete.confirmation.text');
        const isConfirmed = await MessageBox.confirm(text, title);
        if ( isConfirmed === true ){
            await new MessageService(message.getConversation(), message).delete(deleteForEveryone);
        }
    }

    async #deleteConversation(conversation, deleteForEveryone){
        const title = this.props.t('conversation.delete.confirmation.title');
        const text = this.props.t('conversation.delete.confirmation.text');
        const isConfirmed = await MessageBox.confirm(text, title);
        if ( isConfirmed === true ){
            await new ConversationService(conversation).delete(deleteForEveryone);
            this.#selectConversation(null);
        }
    }

    async #startConversation(searchResultEntry){
        const sender = App.getAuthenticatedUser(), recipient = searchResultEntry.getEntity();
        const conversation = await new ConversationService().getDMConversationByMembers(sender.getID(), recipient.getID());
        if ( conversation === null ){
            new UserOnlineStatusService().subscribeToUserOnlineStatusChange(recipient.getID());
            const conversationDraft = new ConversationDraft({ members: [sender, recipient] });
            return this.#conversationViewerListRef.current.setConversationDraft(conversationDraft);
        }
        this.#selectConversation(conversation.getID());
    }

    _handleConversationClose(){
        this.#selectConversation(null);
    }

    _handleSearchResultPick(searchResultEntry){
        this.#sideBarRef.current.clearSearchResults();
        switch ( searchResultEntry.getResultType() ){
            case SearchResultEntryType.MESSAGE: {
                const message = searchResultEntry.getEntity();
                this.#selectConversation(message.getConversation().getID(), message);
            }break;
            case SearchResultEntryType.USER: {
                this.#startConversation(searchResultEntry);
            }break;
        }
    }

    _handleMessageDelete(message, deleteForEveryone){
        this.#deleteMessage(message, deleteForEveryone);
    }

    _handleConversationDelete(conversation, deleteForEveryone){
        this.#deleteConversation(conversation, deleteForEveryone);
    }

    _handleMessageSend(messageText, messageType, messageAttachmentList, conversation, message){
        this.#sendMessage(messageText, messageType, messageAttachmentList, conversation, message);
    }

    #selectConversation(conversationID, message = null){
        this.#conversationViewerListRef.current.setSelectedConversationID(conversationID, message);
        this.#sideBarRef.current.setSelectedConversationID(conversationID);
        this.setState((prev) => ({ ...prev, conversationSelected: ( conversationID !== null ) }));
    }

    _handleConversationSelect(selectedConversationID, message){
        this.#selectConversation(selectedConversationID, message);
    }

    constructor(props){
        super(props);

        this._handleConversationDelete = this._handleConversationDelete.bind(this);
        this._handleConversationSelect = this._handleConversationSelect.bind(this);
        this._handleConversationClose = this._handleConversationClose.bind(this);
        this._handleSearchResultPick = this._handleSearchResultPick.bind(this);
        this._handleMessageDelete = this._handleMessageDelete.bind(this);
        this._handleMessageSend = this._handleMessageSend.bind(this);
        this.state = { conversationSelected: false };
    }

    resetView(){
        this.setState((prev) => ({ ...prev, conversationSelected: false }));
        this.#sideBarRef.current.resetView();
        return this;
    }

    render(){
        return (
            <div className={styles.view + ' bg-primary full-viewport'} data-conversation-selected={this.state.conversationSelected}>
                <div className={'full-viewport-container'}>
                    <div className={styles.container}>
                        <div className={styles.sideBar + ' border-secondary bg-primary'}>
                            <div className={styles.conversationList + ' bg-primary'}>
                                <SideBar ref={this.#sideBarRef} onSearchResultPick={this._handleSearchResultPick} onConversationSelect={this._handleConversationSelect} />
                            </div>
                            <div className={styles.messageImportStatsViewer}>
                                <MessageImportStatsViewer />
                            </div>
                        </div>
                        <div className={styles.conversationViewerList}>
                            <ConversationViewerList ref={this.#conversationViewerListRef} onMessageSend={this._handleMessageSend} onMessageDelete={this._handleMessageDelete} onConversationClose={this._handleConversationClose} onConversationDelete={this._handleConversationDelete} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(MainView);
