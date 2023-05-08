'use strict';

import ConversationList from '../ConversationList/ConversationList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SettingsSection from '../SettingsSection/SettingsSection';
import SearchEngine from '../SearchEngine/SearchEngine';
import SearchBar from '../SearchBar/SearchBar';
import styles from './SideBar.scss';
import React from 'react';
import UserSessionsSection from '../UserSessionsSection/UserSessionsSection';

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

    _handleTabControlClick(event){
        const activeTab = event.target.closest('li[data-target]').getAttribute('data-target');
        this.setState((prev) => ({ ...prev, activeTab: activeTab }));
    }

    constructor(props){
        super(props);

        this._handleConversationSelect = this._handleConversationSelect.bind(this);
        this._handleSearchResultPick = this._handleSearchResultPick.bind(this);
        this._handleTabControlClick = this._handleTabControlClick.bind(this);
        this.state = { activeTab: 'conversation-list' };
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
                    <SearchBar />
                </div>
                <div className={styles.tabsWrapper}>
                    <div className={styles.tab} data-active={this.state.activeTab === 'conversation-list'}>
                        <ConversationList ref={this.#conversationListRef} onConversationSelect={this._handleConversationSelect} />
                    </div>
                    <div className={styles.tab} data-active={this.state.activeTab === 'search-results'}>
                        <SearchEngine ref={this.#searchEngineRef} onSearchResultPick={this._handleSearchResultPick} />
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
