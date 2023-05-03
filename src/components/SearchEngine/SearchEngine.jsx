'use strict';

import SearchResultEntry from '../SearchResultEntry/SearchResultEntry';
import SearchService from '../../services/SearchService';
import TextField from '../TextField/TextField';
import styles from './SearchEngine.scss';
import React from 'react';

class SearchEngine extends React.Component {
    #searchInputRef = React.createRef();

    #renderResults(){
        const renderedResults = this.state.searchResultEntryList.map((searchResultEntry, index) => {
            return (
                <li key={index} onClick={this._handleSearchResultPick} data-index={index}>
                    <SearchResultEntry searchResultEntry={searchResultEntry} />
                </li>
            );
        });
        return <ul className={styles.searchResults}>{renderedResults}</ul>;
    }

    _handleSearchResultPick(event){
        const index = parseInt(event.target.closest('li').getAttribute('data-index'));
        const searchResultEntry = this.state.searchResultEntryList[index] ?? null;
        if ( searchResultEntry !== null && typeof this.props.onSearchResultPick === 'function' ){
            this.props.onSearchResultPick(searchResultEntry);
        }
    }

    _handleChange(){
        this.search();
    }

    constructor(props){
        super(props);

        this._handleSearchResultPick = this._handleSearchResultPick.bind(this);
        this._handleChange = this._handleChange.bind(this);
        this.state = { searchResultEntryList: [] };
    }

    async search(){
        const query = this.#searchInputRef.current.getValue(), searchService = new SearchService();
        const searchResultEntryList = await searchService.search(query);
        this.setState((prev) => ({ ...prev, searchResultEntryList: searchResultEntryList }));
        if ( typeof this.props.onSearch === 'function' ){
            this.props.onSearch(searchResultEntryList);
        }
    }

    clear(){
        this.setState((prev) => ({ ...prev, searchResultEntryList: [] }));
        this.#searchInputRef.current.clear();
        return this;
    }

    render(){
        return (
            <div className={styles.searchEngine}>
                <TextField type={'text'} name={'search'} label={'Search for users, messages...'} ref={this.#searchInputRef} onChange={this._handleChange} />
                {this.#renderResults()}
            </div>
        );
    }
}

export default SearchEngine;
