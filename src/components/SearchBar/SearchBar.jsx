'use strict';

import TextField from '../TextField/TextField';
import styles from './SearchBar.scss';
import React from 'react';

class SearchBar extends React.Component {
    #textFieldRef = React.createRef();

    _handleChange(){

    }

    constructor(props){
        super(props);

        this._handleChange = this._handleChange.bind(this);
    }

    render(){
        return (
            <div>
                <TextField type={'text'} name={'search'} label={'Search for users, messages...'} ref={this.#textFieldRef} onChange={this._handleChange} />
            </div>
        );
    }
}

export default SearchBar;
