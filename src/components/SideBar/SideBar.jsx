'use strict';

import UserSessionsSection from '../UserSessionsSection/UserSessionsSection';
import ConversationList from '../ConversationList/ConversationList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SettingsSection from '../SettingsSection/SettingsSection';
import SearchEngine from '../SearchEngine/SearchEngine';
import { withTranslation } from 'react-i18next';
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
        this.setState((prev) => ({ ...prev, activeTab: 'conversation-list' }));
        if ( typeof this.props.onSearchResultPick === 'function' ){
            this.props.onSearchResultPick(searchResultEntry);
        }
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

    constructor(props){
        super(props);

        this._handleConversationSelect = this._handleConversationSelect.bind(this);
        this._handleSearchResultPick = this._handleSearchResultPick.bind(this);
        this._handleTabControlClick = this._handleTabControlClick.bind(this);
        this._handleSearchBarSearch = this._handleSearchBarSearch.bind(this);
        this._handleSearchBarClear = this._handleSearchBarClear.bind(this);
        this._handleSearch = this._handleSearch.bind(this);
        this.state = { activeTab: 'conversation-list' };
    }

    componentDidMount(){
        Event.getBroker().on('messageSyncCheck', () => {
            this.#searchEngineRef.current.setDisabled(true);
            this.#searchBarRef.current.setDisabled(true);
        });
        Event.getBroker().on('messageSyncEnd', () => {
            this.#searchEngineRef.current.setDisabled(false);
            this.#searchBarRef.current.setDisabled(false);
        });
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
        const { t } = this.props, activeTab = this.state.activeTab;
        return (
            <aside className={styles.sideBar}>
                <div className={styles.searchBarWrapper + ' bg-primary'}>
                    <SearchBar ref={this.#searchBarRef} onSearch={this._handleSearchBarSearch} onClear={this._handleSearchBarClear} />
                </div>
                <div className={styles.tabsWrapper}>
                    <div className={styles.tab} data-active={activeTab === 'conversation-list'}>
                        <ConversationList ref={this.#conversationListRef} onConversationSelect={this._handleConversationSelect} />
                    </div>
                    <div className={styles.tab} data-active={activeTab === 'search-results'}>
                        <SearchEngine ref={this.#searchEngineRef} onSearchResultPick={this._handleSearchResultPick} onSearch={this._handleSearch} />
                    </div>
                    <div className={styles.tab} data-active={activeTab === 'settings'}>
                        <SettingsSection />
                    </div>
                    <div className={styles.tab} data-active={activeTab === 'active-sessions'}>
                        <UserSessionsSection />
                    </div>
                </div>
                <ul className={styles.tabsControllerWrapper + ' border-secondary bg-primary'}>
                    <li onClick={this._handleTabControlClick} data-target={'conversation-list'} className={activeTab === 'conversation-list' ? 'text-accent' : 'text-primary'}>
                        <FontAwesomeIcon icon='fa-solid fa-comments' />
                        <p>{t('sideBar.tabs.chats')}</p>
                    </li>
                    <li onClick={this._handleTabControlClick} data-target={'search-results'} className={activeTab === 'search-results' ? 'text-accent' : 'text-primary'}>
                        <FontAwesomeIcon icon='fa-solid fa-magnifying-glass' />
                        <p>{t('sideBar.tabs.search')}</p>
                    </li>
                    <li onClick={this._handleTabControlClick} data-target={'settings'} className={activeTab === 'settings' ? 'text-accent' : 'text-primary'}>
                        <FontAwesomeIcon icon='fa-solid fa-gear' />
                        <p>{t('sideBar.tabs.settings')}</p>
                    </li>
                    <li onClick={this._handleTabControlClick} data-target={'active-sessions'} className={activeTab === 'active-sessions' ? 'text-accent' : 'text-primary'}>
                        <FontAwesomeIcon icon='fa-solid fa-lock' />
                        <p>{t('sideBar.tabs.accesses')}</p>
                    </li>
                </ul>
            </aside>
        );
    }
}

export default withTranslation(null, { withRef: true })(SideBar);
