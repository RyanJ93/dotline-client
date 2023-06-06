'use strict';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from '../TextField/TextField.scss';
import React from 'react';

class TextField extends React.Component {
    #inputRef = React.createRef();

    #renderErrorMessage(){
        let renderedErrorMessage = null;
        if ( typeof this.state.errorMessage === 'string' && this.state.errorMessage !== '' ){
            renderedErrorMessage = <p className={styles.errorMessage}>{this.state.errorMessage}</p>;
        }
        return renderedErrorMessage;
    }

    #renderClearButton(){
        if ( this.props.withClearButton === true ){
            return (
                <div className={styles.clearButton}>
                    <FontAwesomeIcon icon='fa-solid fa-xmark' onClick={this._handleClear} />
                </div>
            );
        }
    }

    #checkInputContent(){
        const focus = this.#inputRef.current.value === '' ? 'false' : 'true';
        this.#inputRef.current.parentNode.setAttribute('data-focus', focus);
    }

    _handleFocus(event){
        event.target.parentNode.setAttribute('data-focus', 'true');
    }

    _handleClear(){
        this.clear();
        if ( typeof this.props.onClear === 'function' ){
            this.props.onClear();
        }
    }

    _handleBlur(){
        this.#checkInputContent();
    }

    _handleChange(event){
        this.#checkInputContent();
        if ( typeof this.props.onChange === 'function' ){
            this.props.onChange(event);
        }
    }

    _handleInput(){
        this.#checkInputContent();
    }

    constructor(props){
        super(props);

        this.state = { errorMessage: null, disabled: false };
        this._handleChange = this._handleChange.bind(this);
        this._handleInput = this._handleInput.bind(this);
        this._handleFocus = this._handleFocus.bind(this);
        this._handleClear = this._handleClear.bind(this);
        this._handleBlur = this._handleBlur.bind(this);
    }

    setErrorMessage(errorMessage){
        this.setState((prev) => { return { ...prev, errorMessage: errorMessage } });
        return this;
    }

    getErrorMessage(){
        return this.state.errorMessage;
    }

    setDisabled(disabled){
        this.setState((prev) => ({ ...prev, disabled: ( disabled === true ) }));
        return this;
    }

    getDisabled(){
        return this.state.disabled;
    }

    setValue(value){
        this.#inputRef.current.value = value;
        this.#checkInputContent();
        return this;
    }

    getValue(){
        return this.#inputRef.current.value;
    }

    clear(){
        this.#inputRef.current.value = '';
        this.#checkInputContent();
        return this;
    }

    render(){
        return (
            <div className={styles.field} data-disabled={this.state.disabled}>
                <div className={styles.fieldWrapper}>
                    <label className={styles.label} form={this.props.id}>{this.props.label}</label>
                    <input className={styles.input} type={this.props.type} id={this.props.id} name={this.props.name} onFocus={this._handleFocus} onBlur={this._handleBlur} onInput={this._handleInput} onChange={this._handleChange} ref={this.#inputRef} disabled={this.state.disabled} />
                    {this.#renderClearButton()}
                </div>
                {this.#renderErrorMessage()}
            </div>
        );
    }
}

export default TextField;
