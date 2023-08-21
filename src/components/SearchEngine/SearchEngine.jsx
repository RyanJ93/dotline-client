'use strict';

import SearchResultEntry from '../SearchResultEntry/SearchResultEntry';
import SearchService from '../../services/SearchService';
import { withTranslation } from 'react-i18next';
import styles from './SearchEngine.scss';
import React from 'react';

class SearchEngine extends React.Component {
    #renderResults(){
        const renderedResults = [], { t } = this.props;
        if ( this.state.disabled !== true && Array.isArray(this.state.searchResultEntryList) ){
            this.state.searchResultEntryList.forEach((searchResultEntry, index) => {
                if ( searchResultEntry.getEntity() !== null ){
                    renderedResults.push(
                        <li key={index} onClick={this._handleSearchResultPick} data-index={index}>
                            <SearchResultEntry searchResultEntry={searchResultEntry} />
                        </li>
                    );
                }
            });
            if ( renderedResults.length === 0 ){
                renderedResults.push(<li className={styles.emptyElement + ' text-primary'} key={'-'}>{t('searchEngine.noResults')}</li>);
            }
        }
        return <ul className={styles.searchResults}>{renderedResults}</ul>;
    }

    #renderSearchDisabledMessage(){
        if ( this.state.disabled === true ){
            const { t } = this.props;
            return (
                <div className={styles.searchDisabledMessage}>
                    <p className={styles.title}>{t('searchEngine.disabledTitle')}</p>
                    <p className={styles.subtitle}>{t('searchEngine.disabledText')}</p>
                </div>
            );
        }
    }

    _handleSearchResultPick(event){
        const index = parseInt(event.target.closest('li').getAttribute('data-index'));
        const searchResultEntry = this.state.searchResultEntryList[index] ?? null;
        if ( searchResultEntry !== null && typeof this.props.onSearchResultPick === 'function' ){
            this.props.onSearchResultPick(searchResultEntry);
        }
    }

    constructor(props){
        super(props);

        this._handleSearchResultPick = this._handleSearchResultPick.bind(this);
        this.state = { searchResultEntryList: null, disabled: false };
    }

    async search(query){
        const searchResultEntryList = await new SearchService().search(query);
        this.setState((prev) => ({ ...prev, searchResultEntryList: searchResultEntryList }));
        if ( typeof this.props.onSearch === 'function' ){
            this.props.onSearch(searchResultEntryList);
        }
    }

    setDisabled(disabled){
        this.setState((prev) => ({ ...prev, disabled: ( disabled === true ) }));
        return this;
    }

    getDisabled(){
        return this.state.disabled;
    }

    clear(){
        this.setState((prev) => ({ ...prev, searchResultEntryList: null }));
        return this;
    }

    render(){
        return (
            <div className={styles.searchEngine}>
                {this.#renderSearchDisabledMessage()}
                {this.#renderResults()}
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(SearchEngine);
