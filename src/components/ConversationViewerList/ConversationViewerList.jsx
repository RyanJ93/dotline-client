'use strict';

import ConversationViewer from '../ConversationViewer/ConversationViewer';
import styles from './ConversationViewerList.scss';
import { withTranslation } from 'react-i18next';
import Event from '../../facades/Event';
import React from 'react';

class ConversationViewerList extends React.Component {
    #conversationViewerRefIndex = Object.create(null);

    #initConversationViewerRefIndex(){
        for ( const [id, conversation] of this.state.conversationList ){
            this.#conversationViewerRefIndex[id] = React.createRef();
        }
    }

    #renderConversationViewerList(){
        const renderedConversationViewerList = [];
        this.#initConversationViewerRefIndex();
        for ( const [id, conversation] of this.state.conversationList ){
            const goto = this.state.goto?.conversationID === id ? this.state.goto.message : null;
            const bind = (node) => { this.#conversationViewerRefIndex[id].current = node };
            const isSelected = id === this.state.selectedConversationID;
            renderedConversationViewerList.push(
                <div className={styles.conversationViewer + ' bg-primary'} key={id} data-selected={isSelected}>
                    <ConversationViewer ref={bind} goto={goto} selected={isSelected} conversation={conversation} onMessageSend={this._handleMessageSend} onMessageDelete={this._handleMessageDelete} onConversationClose={this._handleConversationClose} onConversationDelete={this._handleConversationDeleteAction} />
                </div>
            );
        }
        if ( this.state.conversationDraft !== null ){
            renderedConversationViewerList.push(
                <div className={styles.conversationViewer + ' bg-primary'} key={'draft'} data-selected={true}>
                    <ConversationViewer conversation={this.state.conversationDraft} onMessageSend={this._handleMessageSend} onMessageDelete={this._handleMessageDelete} onConversationClose={this._handleConversationClose} onConversationDelete={this._handleConversationDeleteAction} />
                </div>
            );
        }
        return <React.Fragment>{renderedConversationViewerList}</React.Fragment>;
    }

    _handleConversationClose(){
        if ( typeof this.props.onConversationClose === 'function' ){
            this.props.onConversationClose();
        }
    }

    _handleConversationDeleteAction(conversation, deleteForEveryone){
        if ( typeof this.props.onConversationDelete === 'function' ){
            this.props.onConversationDelete(conversation, deleteForEveryone);
        }
    }

    _handleMessageDelete(message, deleteForEveryone){
        if ( typeof this.props.onMessageDelete === 'function' ){
            this.props.onMessageDelete(message, deleteForEveryone);
        }
    }

    _handleMessageSend(text, type, messageAttachmentList, conversation, message){
        if ( typeof this.props.onMessageSend === 'function' ){
            this.props.onMessageSend(text, type, messageAttachmentList, conversation, message);
        }
    }

    constructor(props){
        super(props);

        this.state = { conversationList: new Map(), selectedConversationID: null, conversationDraft: null, goto: null };
        this._handleConversationDeleteAction = this._handleConversationDeleteAction.bind(this);
        this._handleConversationClose = this._handleConversationClose.bind(this);
        this._handleMessageDelete = this._handleMessageDelete.bind(this);
        this._handleMessageSend = this._handleMessageSend.bind(this);
    }

    componentDidMount(){
        Event.getBroker().on('conversationDelete', (conversationID) => {
            this.state.conversationList.delete(conversationID);
            this.forceUpdate();
        });
        Event.getBroker().on('conversationAdded', (conversation) => {
            this.state.conversationList.set(conversation.getID(), conversation);
            this.forceUpdate();
        });
    }

    componentDidUpdate(){
        if ( this.state.goto !== null ){
            const ref = this.#conversationViewerRefIndex[this.state.goto.conversationID];
            ref.current.gotoMessage(this.state.goto.message);
        }
    }

    setConversationDraft(conversationDraft){
        this.setState((prev) => ({
            ...prev,
            conversationDraft : conversationDraft,
            selectedConversationID: null,
            goto: null
        }));
        return this;
    }

    getConversationDraft(){
        return this.state.conversationDraft;
    }

    setSelectedConversationID(selectedConversationID, message = null){
        this.setState((prev) => ({
            ...prev,
            goto: ( message === null ? null : { conversationID: message.getConversation().getID(), message: message } ),
            selectedConversationID: selectedConversationID,
            conversationDraft : null
        }));
        return this;
    }

    getSelectedConversationID(){
        return this.state.selectedConversationID;
    }

    render(){
        const { t } = this.props;
        return (
            <div className={styles.conversationViewerList}>
                <p className={styles.startingMessage + ' text-primary'}>{t('conversationViewerList.startingLabel')}</p>
                {this.#renderConversationViewerList()}
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(ConversationViewerList);
