'use strict';

import TextField from '../TextField/TextField';
import styles from './SearchBar.scss';
import React from 'react';

class SearchBar extends React.Component {
    #textFieldRef = React.createRef();

    _handleChange(){
        const value = this.#textFieldRef.current.getValue().trim();
        if ( typeof this.props.onSearch === 'function' && value !== '' ){
            this.props.onSearch(value);
        }
        if ( typeof this.props.onClear === 'function' && value === '' ){
            this.props.onClear();
        }
    }

    _handleClear(){
        if ( typeof this.props.onClear === 'function' ){
            this.props.onClear();
        }
    }

    constructor(props){
        super(props);

        this._handleChange = this._handleChange.bind(this);
        this._handleClear = this._handleClear.bind(this);
    }

    setDisabled(disabled){
        this.#textFieldRef.current.setDisabled(disabled);
        return this;
    }

    getDisabled(){
        return this.#textFieldRef.current.getDisabled();
    }

    clear(){
        this.#textFieldRef.current.clear();
        return this;
    }

    render(){
        return (
            <div className={styles.searchbar}>
                <TextField type={'text'} name={'search'} label={'Search for users, messages...'} ref={this.#textFieldRef} onChange={this._handleChange} onClear={this._handleClear} withClearButton={true} />
            </div>
        );
    }
}

export default SearchBar;
