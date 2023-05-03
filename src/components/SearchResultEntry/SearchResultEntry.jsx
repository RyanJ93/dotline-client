'use strict';

import UserSearchResultEntry from '../UserSearchResultEntry/UserSearchResultEntry';
import SearchResultEntryType from '../../enum/SearchResultEntryType';
import React from 'react';

class SearchResultEntry extends React.Component {
    #resultType;

    #renderSearchResultEntry(){
        switch ( this.#resultType ){
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
        return <div>{this.#renderSearchResultEntry()}</div>;
    }
}

export default SearchResultEntry;
