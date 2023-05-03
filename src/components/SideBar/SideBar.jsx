'use strict';

import ConversationList from '../ConversationList/ConversationList';
import SearchEngine from '../SearchEngine/SearchEngine';
import styles from './SideBar.scss';
import React from 'react';

class SideBar extends React.Component {
    #conversationListRef = React.createRef();
    #searchEngineRef = React.createRef();

    _handleConversationSelect(selectedConversationID){
        if ( typeof this.props.onConversationSelect === 'function' ){
            this.props.onConversationSelect(selectedConversationID);
        }
    }

    _handleSearchResultPick(searchResultEntry){
        if ( typeof this.props.onSearchResultPick === 'function' ){
            this.props.onSearchResultPick(searchResultEntry);
        }
    }

    _handleSearch(searchResultEntryList){
        if ( typeof this.props.onSearch === 'function' ){
            this.props.onSearch(searchResultEntryList);
        }
    }

    constructor(props){
        super(props);

        this._handleConversationSelect = this._handleConversationSelect.bind(this);
        this._handleSearchResultPick = this._handleSearchResultPick.bind(this);
        this._handleSearch = this._handleSearch.bind(this);
    }

    setSelectedConversationID(conversationID){
        this.#conversationListRef.current.setSelectedConversationID(conversationID);
        return this;
    }

    getSelectedConversationID(){
        return this.#conversationListRef.current.getSelectedConversationID();
    }

    clearSearchResults(){
        this.#searchEngineRef.current.clear();
        return this;
    }

    render(){
        return (
            <aside className={styles.sideBar}>
                <SearchEngine ref={this.#searchEngineRef} onSearch={this._handleSearch} onSearchResultPick={this._handleSearchResultPick} />
                <ConversationList ref={this.#conversationListRef} onConversationSelect={this._handleConversationSelect} />
            </aside>
        );
    }
}

export default SideBar;
