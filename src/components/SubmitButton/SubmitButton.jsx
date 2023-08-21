'use strict';

import { withTranslation } from 'react-i18next';
import styles from './SubmitButton.scss';
import React from 'react';

class SubmitButton extends React.Component {
    #statusResetTimeoutID = null;

    #getStatusClass(){
        switch ( this.state.status ){
            case 'completed': {
                return styles.submitButton + ' bg-success text-primary';
            }
            case 'error': {
                return styles.submitButton + ' bg-danger text-primary';
            }
        }
        return styles.submitButton + ' bg-secondary text-primary';
    }

    constructor(props){
        super(props);

        this.state = { status: 'ready', disabled: false, value: ( this.props.value ?? '' ) };
    }

    setTemporaryStatus(status, currentValue, finalValue, timeout = 1000){
        this.setState((prev) => ({ ...prev, status: status, value: currentValue, disabled: true }));
        window.clearTimeout(this.#statusResetTimeoutID);
        this.#statusResetTimeoutID = window.setTimeout(() => {
            this.setState((prev) => ({ ...prev, value: finalValue, status: 'ready', disabled: false }));
        }, timeout);
        return this;
    }

    setStatus(status){
        this.setState((prev) => ({ ...prev, status: status }));
        window.clearTimeout(this.#statusResetTimeoutID);
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
            <div data-status={this.state.status} className={this.#getStatusClass()}>
                <div className={styles.loader + ' loader-img-white'} />
                <input disabled={this.state.disabled} value={this.state.value} type={'submit'} />
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(SubmitButton);
