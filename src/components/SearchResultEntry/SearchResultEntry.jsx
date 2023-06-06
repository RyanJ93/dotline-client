'use strict';

import MessageSearchResultEntry from '../MessageSearchResultEntry/MessageSearchResultEntry';
import UserSearchResultEntry from '../UserSearchResultEntry/UserSearchResultEntry';
import SearchResultEntryType from '../../enum/SearchResultEntryType';
import styles from './SearchResultEntry.scss';
import React from 'react';

class SearchResultEntry extends React.Component {
    #resultType;

    #renderSearchResultEntry(){
        switch ( this.#resultType ){
            case SearchResultEntryType.MESSAGE: {
                return <MessageSearchResultEntry message={this.props.searchResultEntry.getEntity()} />
            }
            case SearchResultEntryType.USER: {
                return <UserSearchResultEntry user={this.props.searchResultEntry.getEntity()} />
            }
        }
    }

    constructor(props){
        super(props);

        this.#resultType = props.searchResultEntry.getResultType();
    }

    getResultType(){
        return this.#resultType;
    }

    render(){
        return (
            <div className={styles.searchResultEntry}>
                {this.#renderSearchResultEntry()}
            </div>
        );
    }
}

export default SearchResultEntry;
