'use strict';

import ConversationCard from '../ConversationCard/ConversationCard';
import styles from './ConversationList.scss';
import Event from '../../facades/Event';
import React from 'react';

class ConversationList extends React.Component {
    #renderConversationList(){
        const renderedConversationList = [];
        for ( const [ id, conversation ] of this.state.conversationList ){
            const isSelected = this.state.selectedConversationID === id;
            renderedConversationList.push(
                <li key={id} data-conversation-id={id} onClick={this._handleConversationSelect} data-selected={isSelected}>
                    <div className={styles.conversationCardContainer}>
                        <ConversationCard conversation={conversation} />
                    </div>
                </li>
            );
        }
        return <ul>{renderedConversationList}</ul>;
    }

    _handleConversationSelect(event){
        const conversationID = event.target.closest('li').getAttribute('data-conversation-id');
        this.setSelectedConversationID(conversationID);
    }

    _handleConversationDelete(conversationID){
        this.state.conversationList.delete(conversationID);
        this.forceUpdate();
    }

    _handleConversationAdded(conversation){
        this.state.conversationList.set(conversation.getID(), conversation);
        this.forceUpdate();
    }

    constructor(props){
        super(props);

        this.state = { conversationList: new Map(), selectedConversationID: null };
        this._handleConversationSelect = this._handleConversationSelect.bind(this);
        this._handleConversationDelete = this._handleConversationDelete.bind(this);
        this._handleConversationAdded = this._handleConversationAdded.bind(this);
    }

    componentDidMount(){
        Event.getBroker().on('conversationDelete', this._handleConversationDelete);
        Event.getBroker().on('conversationAdded', this._handleConversationAdded);
    }

    setSelectedConversationID(selectedConversationID){
        this.setState((prev) => ({ ...prev, selectedConversationID: selectedConversationID }), () => {
           if ( typeof this.props.onConversationSelect === 'function' ){
               this.props.onConversationSelect(selectedConversationID);
           }
        });
        return this;
    }

    getSelectedConversationID(){
        return this.state.selectedConversationID;
    }

    render(){
        return (
            <div className={styles.conversationList}>
                {this.#renderConversationList()}
            </div>
        );
    }
}

export default ConversationList;
