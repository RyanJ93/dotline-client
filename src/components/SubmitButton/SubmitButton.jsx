'use strict';

import styles from './SubmitButton.scss';
import React from 'react';

class SubmitButton extends React.Component {
    constructor(props){
        super(props);

        this.state = { status: 'ready', disabled: false, value: ( this.props.value ?? '' ) };
    }

    setStatus(status){
        this.setState((prev) => ({ ...prev, status: status }));
        return this;
    }

    getStatus(){
        return this.state.status;
    }

    setDisabled(disabled){
        this.setState((prev) => ({ ...prev, disabled: ( disabled === true ) }));
        return this;
    }

    getDisabled(){
        return this.state.disabled;
    }

    setValue(value){
        this.setState((prev) => ({ ...prev, value: value }));
        return this;
    }

    getValue(){
        return this.state.value;
    }

    render(){
        return (
            <div data-status={this.state.status} className={styles.submitButton}>
                <div className={styles.loader} />
                <input disabled={this.state.disabled} value={this.state.value} type={'submit'} />
            </div>
        );
    }
}

export default SubmitButton;
