'use strict';

import styles from './AuthenticationForm.scss';
import React from 'react';

class AuthenticationForm extends React.Component {
    _username = React.createRef();
    _password = React.createRef();

    _isUsernameValid(){
        this._username.current.setErrorMessage(null);
        if ( this._username.current.getValue() === '' ){
            this._username.current.setErrorMessage('You must provide a valid username!');
            return false;
        }
        if ( !( /[a-zA-Z0-9.-_]{4,16}/.test(this._username.current.getValue()) ) ){
            // TODO: set a better message
            this._username.current.setErrorMessage('You must provide a valid username!');
            return false;
        }
        return true;
    }

    _isPasswordValid(){
        this._password.current.setErrorMessage(null);
        if ( this._password.current.getValue() === '' ){
            this._password.current.setErrorMessage('You must provide a valid password!');
            return false;
        }
        return true;
    }

    async _isValid(){
        const isValid = this._isUsernameValid();
        return isValid && this._isPasswordValid();
    }

    _renderGenericErrorMessages(){
        let renderedGenericErrorMessages = null;
        if ( this.state.genericErrorMessageList.length > 0 ){
            const errorMessageText = this.state.genericErrorMessageList.join(', ');
            renderedGenericErrorMessages = <p className={styles.errorMessage}>{errorMessageText}</p>;
        }
        return renderedGenericErrorMessages;
    }

    _handleSubmit(event){
        if ( typeof this.props.onSubmit === 'function' ){
            event.preventDefault();
            event.stopPropagation();
            this.submit(event);
        }
    }

    _handleUsernameChange(){
        this._isUsernameValid();
    }

    _handlePasswordChange(){
        this._isPasswordValid();
    }

    constructor(props){
        super(props);

        this._handleUsernameChange = this._handleUsernameChange.bind(this);
        this._handlePasswordChange = this._handlePasswordChange.bind(this);
        this._handleSubmit = this._handleSubmit.bind(this);
        this.state = { genericErrorMessageList: [] };
    }

    resetErrorMessages(){
        this.setState((prev) => { return { ...prev, genericErrorMessageList: [] } });
        this._username.current.setErrorMessage(null);
        this._password.current.setErrorMessage(null);
        return this;
    }

    displayErrorMessages(errorMessageBag){
        const errorMessages = errorMessageBag.getAll(), genericErrorMessageList = [];
        this.resetErrorMessages();
        for ( const fieldName in errorMessages ){
            const errorMessage = errorMessages[fieldName].join(', ');
            if ( fieldName === 'username' ){
                this._username.current.setErrorMessage(errorMessage);
            }else if ( fieldName === 'password' ){
                this._password.current.setErrorMessage(errorMessage);
            }else{
                genericErrorMessageList.push(errorMessage);
            }
        }
        this.setState((prev) => {
            return { ...prev, genericErrorMessageList: genericErrorMessageList };
        });
        return this;
    }

    displayErrorMessageText(errorMessageText){
        this.resetErrorMessages();
        this.setState((prev) => {
            return { ...prev, genericErrorMessageList: [errorMessageText] };
        });
        return this;
    }

    async submit(event){
        const isValid = await this._isValid();
        if ( isValid ){
            this.props.onSubmit({
                password: this._password.current.getValue(),
                username: this._username.current.getValue()
            }, event);
        }
    }
}

export default AuthenticationForm;
