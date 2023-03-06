'use strict';

import styles from './Form.scss';
import React from 'react';
class Form extends React.Component {
    _handleSubmit(event){
        if ( typeof this.props.onSubmit === 'function' ){
            event.preventDefault();
            event.stopPropagation();
            this.props.onSubmit(event);
        }
    }

    constructor(props){
        super(props);

        this._handleSubmit = this._handleSubmit.bind(this);
    }

    render(){
        return (
            <form className={styles.form} onSubmit={this._handleSubmit}>
                <div className={styles.fieldSet}>
                    {this.props.children}
                </div>
            </form>
        );
    }
}

export default Form;
