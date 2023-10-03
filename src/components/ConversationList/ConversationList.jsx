'use strict';

import ConversationCard from '../ConversationCard/ConversationCard';
import styles from './ConversationList.scss';
import Event from '../../facades/Event';
import React from 'react';

class ConversationList extends React.Component {
    #conversationListRef = React.createRef();

    #renderConversationList(){
        const renderedConversationList = [];
        for ( const [ id, conversation ] of this.state.conversationList ){
            const isSelected = this.state.selectedConversationID === id;
            renderedConversationList.push(
                <li className={'border-secondary'} key={id} data-conversation-id={id} onClick={this._handleConversationSelect} data-selected={isSelected}>
                    <div className={styles.conversationCardContainer + ' bg-secondary text-primary'}>
                        <ConversationCard conversation={conversation} onLastMessageChange={this._handleLastMessageChange} />
                    </div>
                </li>
            );
        }
        return <ul ref={this.#conversationListRef}>{renderedConversationList}</ul>;
    }

    #recomputeListOrdering(){
        const elementList = this.#conversationListRef.current.querySelectorAll('li[data-conversation-id]');
        const entryList = Array.from(elementList).map((element) => {
            const timestamp = parseInt(element.getAttribute('data-lm-timestamp'));
            const conversationID = element.getAttribute('data-conversation-id');
            return [conversationID, timestamp];
        });
        entryList.sort((a, b) => isNaN(a[1]) ? -1 : ( a[1] > b[1] ? -1 : ( a[1] === b[1] ? 0 : 1 ) ));
        entryList.forEach((entry, index) => {
            const element = this.#conversationListRef.current.querySelector('li[data-conversation-id="' + entry[0] + '"]');
            element.style.order = index;
        });
    }

    _handleLastMessageChange(message){
        const selector = 'li[data-conversation-id="' + message.getConversation().getID() + '"]';
        const conversationElement = this.#conversationListRef.current.querySelector(selector);
        conversationElement.setAttribute('data-lm-timestamp', +message.getCreatedAt());
        this.#recomputeListOrdering();
    }

    _handleConversationSelect(event){
        const conversationID = event.target.closest('li').getAttribute('data-conversation-id');
        this.setState((prev) => ({ ...prev, selectedConversationID: conversationID }), () => {
            if ( typeof this.props.onConversationSelect === 'function' ){
                this.props.onConversationSelect(conversationID, null);
            }
        });
    }

    constructor(props){
        super(props);

        this.state = { conversationList: new Map(), selectedConversationID: null };
        this._handleConversationSelect = this._handleConversationSelect.bind(this);
        this._handleLastMessageChange = this._handleLastMessageChange.bind(this);
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

    setSelectedConversationID(selectedConversationID){
        this.setState((prev) => ({ ...prev, selectedConversationID: selectedConversationID }));
        return this;
    }

    getSelectedConversationID(){
        return this.state.selectedConversationID;
    }

    render(){
        return <div className={styles.conversationList}>{this.#renderConversationList()}</div>;
    }
}

export default ConversationList;
