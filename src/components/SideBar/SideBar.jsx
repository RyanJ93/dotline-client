'use strict';

import UserSessionsSection from '../UserSessionsSection/UserSessionsSection';
import ConversationList from '../ConversationList/ConversationList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SettingsSection from '../SettingsSection/SettingsSection';
import SearchEngine from '../SearchEngine/SearchEngine';
import SearchBar from '../SearchBar/SearchBar';
import Event from '../../facades/Event';
import styles from './SideBar.scss';
import React from 'react';

class SideBar extends React.Component {
    #conversationListRef = React.createRef();
    #searchEngineRef = React.createRef();
    #searchBarRef = React.createRef();

    _handleConversationSelect(selectedConversationID, message){
        if ( typeof this.props.onConversationSelect === 'function' ){
            this.props.onConversationSelect(selectedConversationID, message);
        }
    }

    _handleSearchResultPick(searchResultEntry){
        if ( typeof this.props.onSearchResultPick === 'function' ){
            this.props.onSearchResultPick(searchResultEntry);
        }
        this.resetView();
    }

    _handleTabControlClick(event){
        const activeTab = event.target.closest('li[data-target]').getAttribute('data-target');
        this.setState((prev) => ({ ...prev, activeTab: activeTab }));
    }

    _handleSearchBarSearch(query){
        this.#searchEngineRef.current.search(query);
    }

    _handleSearchBarClear(){
        this.#searchEngineRef.current.clear();
    }

    _handleSearch(){
        this.setState((prev) => ({ ...prev, activeTab: 'search-results' }));
    }

    _handleMessageSyncStart(){
        this.#searchEngineRef.current.setDisabled(true);
        this.#searchBarRef.current.setDisabled(true);
    }

    _handleMessageSyncEnd(){
        this.#searchEngineRef.current.setDisabled(false);
        this.#searchBarRef.current.setDisabled(false);
    }

    constructor(props){
        super(props);

        this._handleConversationSelect = this._handleConversationSelect.bind(this);
        this._handleMessageSyncStart = this._handleMessageSyncStart.bind(this);
        this._handleSearchResultPick = this._handleSearchResultPick.bind(this);
        this._handleTabControlClick = this._handleTabControlClick.bind(this);
        this._handleSearchBarSearch = this._handleSearchBarSearch.bind(this);
        this._handleSearchBarClear = this._handleSearchBarClear.bind(this);
        this._handleMessageSyncEnd = this._handleMessageSyncEnd.bind(this);
        this._handleSearch = this._handleSearch.bind(this);
        this.state = { activeTab: 'conversation-list' };
    }

    componentDidMount(){
        Event.getBroker().on('messageSyncStart', this._handleMessageSyncStart);
        Event.getBroker().on('messageSyncEnd', this._handleMessageSyncEnd);
    }

    setSelectedConversationID(conversationID, message = null){
        this.#conversationListRef.current.setSelectedConversationID(conversationID, message);
        return this;
    }

    getSelectedConversationID(){
        return this.#conversationListRef.current.getSelectedConversationID();
    }

    clearSearchResults(){
        this.#searchEngineRef.current.clear();
        this.#searchBarRef.current.clear();
        return this;
    }

    resetView(){
        this.setState((prev) => ({ ...prev, activeTab: 'conversation-list' }));
        this.setSelectedConversationID(null);
        this.clearSearchResults();
        return this;
    }

    render(){
        return (
            <aside className={styles.sideBar}>
                <div className={styles.searchBarWrapper}>
                    <SearchBar ref={this.#searchBarRef} onSearch={this._handleSearchBarSearch} onClear={this._handleSearchBarClear} />
                </div>
                <div className={styles.tabsWrapper}>
                    <div className={styles.tab} data-active={this.state.activeTab === 'conversation-list'}>
                        <ConversationList ref={this.#conversationListRef} onConversationSelect={this._handleConversationSelect} />
                    </div>
                    <div className={styles.tab} data-active={this.state.activeTab === 'search-results'}>
                        <SearchEngine ref={this.#searchEngineRef} onSearchResultPick={this._handleSearchResultPick} onSearch={this._handleSearch} />
                    </div>
                    <div className={styles.tab} data-active={this.state.activeTab === 'settings'}>
                        <SettingsSection />
                    </div>
                    <div className={styles.tab} data-active={this.state.activeTab === 'active-sessions'}>
                        <UserSessionsSection />
                    </div>
                </div>
                <ul className={styles.tabsControllerWrapper}>
                    <li onClick={this._handleTabControlClick} data-target={'conversation-list'} data-active={this.state.activeTab === 'conversation-list'}>
                        <FontAwesomeIcon icon='fa-solid fa-comments' />
                        <p>Chats</p>
                    </li>
                    <li onClick={this._handleTabControlClick} data-target={'search-results'} data-active={this.state.activeTab === 'search-results'}>
                        <FontAwesomeIcon icon='fa-solid fa-magnifying-glass' />
                        <p>Search</p>
                    </li>
                    <li onClick={this._handleTabControlClick} data-target={'settings'} data-active={this.state.activeTab === 'settings'}>
                        <FontAwesomeIcon icon='fa-solid fa-gear' />
                        <p>Settings</p>
                    </li>
                    <li onClick={this._handleTabControlClick} data-target={'active-sessions'} data-active={this.state.activeTab === 'active-sessions'}>
                        <FontAwesomeIcon icon='fa-solid fa-lock' />
                        <p>Accesses</p>
                    </li>
                </ul>
            </aside>
        );
    }
}

export default SideBar;
