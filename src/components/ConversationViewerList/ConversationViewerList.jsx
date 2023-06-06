'use strict';

import ConversationViewer from '../ConversationViewer/ConversationViewer';
import styles from './ConversationViewerList.scss';
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
                <div className={styles.conversationViewer} key={id} data-selected={isSelected}>
                    <ConversationViewer ref={bind} goto={goto} selected={isSelected} conversation={conversation} onMessageSend={this._handleMessageSend} onMessageDelete={this._handleMessageDelete} onConversationClose={this._handleConversationClose} onConversationDelete={this._handleConversationDeleteAction} />
                </div>
            );
        }
        if ( this.state.conversationDraft !== null ){
            renderedConversationViewerList.push(
                <div className={styles.conversationViewer} key={'draft'} data-selected={true}>
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

    _handleConversationDelete(conversationID){
        this.state.conversationList.delete(conversationID);
        this.forceUpdate();
    }

    _handleConversationAdded(conversation){
        this.state.conversationList.set(conversation.getID(), conversation);
        this.forceUpdate();
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

    _handleMessageSend(text, attachmentList, conversation, message){
        if ( typeof this.props.onMessageSend === 'function' ){
            this.props.onMessageSend(text, attachmentList, conversation, message);
        }
    }

    constructor(props){
        super(props);

        this.state = { conversationList: new Map(), selectedConversationID: null, conversationDraft: null, goto: null };
        this._handleConversationDeleteAction = this._handleConversationDeleteAction.bind(this);
        this._handleConversationDelete = this._handleConversationDelete.bind(this);
        this._handleConversationAdded = this._handleConversationAdded.bind(this);
        this._handleConversationClose = this._handleConversationClose.bind(this);
        this._handleMessageDelete = this._handleMessageDelete.bind(this);
        this._handleMessageSend = this._handleMessageSend.bind(this);
    }

    componentDidMount(){
        Event.getBroker().on('conversationDelete', this._handleConversationDelete);
        Event.getBroker().on('conversationAdded', this._handleConversationAdded);
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
        return (
            <div className={styles.conversationViewerList}>
                <p className={styles.startingMessage}>{'Select a conversation to start'}</p>
                {this.#renderConversationViewerList()}
            </div>
        );
    }
}

export default ConversationViewerList;
