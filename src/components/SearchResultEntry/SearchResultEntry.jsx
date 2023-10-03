'use strict';

import MessageSearchResultEntry from '../MessageSearchResultEntry/MessageSearchResultEntry';
import UserSearchResultEntry from '../UserSearchResultEntry/UserSearchResultEntry';
import SearchResultEntryType from '../../enum/SearchResultEntryType';
import styles from './SearchResultEntry.scss';
import React from 'react';

class SearchResultEntry extends React.Component {
    #renderSearchResultEntry(){
        switch ( this.props.searchResultEntry.getResultType() ){
            case SearchResultEntryType.MESSAGE: {
                return <MessageSearchResultEntry message={this.props.searchResultEntry.getEntity()} />;
            }
            case SearchResultEntryType.USER: {
                return <UserSearchResultEntry user={this.props.searchResultEntry.getEntity()} />;
            }
        }
    }

    render(){
        return <div className={styles.searchResultEntry}>{this.#renderSearchResultEntry()}</div>;
    }
}

export default SearchResultEntry;
