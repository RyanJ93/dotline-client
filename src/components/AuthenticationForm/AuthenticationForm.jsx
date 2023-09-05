'use strict';

import StringUtils from '../../utils/StringUtils';
import styles from './AuthenticationForm.scss';
import i18n from 'i18next';
import React from 'react';

class AuthenticationForm extends React.Component {
    _usernameRef = React.createRef();
    _passwordRef = React.createRef();

    _isUsernameValid(){
        this._usernameRef.current.setErrorMessage(null);
        if ( this._usernameRef.current.getValue() === '' ){
            this._usernameRef.current.setErrorMessage(i18n.t('authenticationForm.error.invalidUsername'));
            return false;
        }
        if ( !StringUtils.isValidUsername(this._usernameRef.current.getValue()) ){
            this._usernameRef.current.setErrorMessage(i18n.t('authenticationForm.error.invalidUsernameFormat'));
            return false;
        }
        return true;
    }

    _isPasswordValid(){
        this._passwordRef.current.setErrorMessage(null);
        if ( this._passwordRef.current.getValue() === '' ){
            this._passwordRef.current.setErrorMessage(i18n.t('authenticationForm.error.invalidPassword'));
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
            renderedGenericErrorMessages = <p className={styles.errorMessage + ' text-danger'}>{errorMessageText}</p>;
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
        this.setState((prev) => ({ ...prev, genericErrorMessageList: [] }));
        this._usernameRef.current.setErrorMessage(null);
        this._passwordRef.current.setErrorMessage(null);
        return this;
    }

    displayErrorMessages(errorMessageBag){
        const errorMessages = errorMessageBag.getAll(), genericErrorMessageList = [];
        this.resetErrorMessages();
        for ( const fieldName in errorMessages ){
            const errorMessage = errorMessages[fieldName].join(', ');
            if ( fieldName === 'username' ){
                this._usernameRef.current.setErrorMessage(errorMessage);
            }else if ( fieldName === 'password' ){
                this._passwordRef.current.setErrorMessage(errorMessage);
            }else{
                genericErrorMessageList.push(errorMessage);
            }
        }
        this.setState((prev) => ({ ...prev, genericErrorMessageList: genericErrorMessageList }));
        return this;
    }

    displayErrorMessageText(errorMessageText){
        this.resetErrorMessages();
        this.setState((prev) => ({ ...prev, genericErrorMessageList: [errorMessageText] }));
        return this;
    }

    async submit(event){
        const isValid = await this._isValid();
        if ( isValid && typeof this.props.onSubmit === 'function' ){
            this.props.onSubmit({
                password: this._passwordRef.current.getValue(),
                username: this._usernameRef.current.getValue()
            }, event);
        }
    }
}

export default AuthenticationForm;
