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
                <li className={'border-secondary'} key={id} data-conversation-id={id} onClick={this._handleConversationSelect} data-selected={isSelected}>
                    <div className={styles.conversationCardContainer + ' bg-secondary text-primary'}>
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

    constructor(props){
        super(props);

        this.state = { conversationList: new Map(), selectedConversationID: null };
        this._handleConversationSelect = this._handleConversationSelect.bind(this);
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

    setSelectedConversationID(selectedConversationID, message = null){
        this.setState((prev) => ({ ...prev, selectedConversationID: selectedConversationID }), () => {
           if ( typeof this.props.onConversationSelect === 'function' ){
               this.props.onConversationSelect(selectedConversationID, message);
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
