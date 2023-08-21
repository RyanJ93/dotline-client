'use strict';

import AuthenticationForm from '../AuthenticationForm/AuthenticationForm';
import UserService from '../../services/UserService';
import { withTranslation } from 'react-i18next';
import TextField from '../TextField/TextField';
import styles from './SignupForm.scss';
import Form from '../Form/Form';
import React from 'react';

class SignupForm extends AuthenticationForm {
    #passwordConfirmationRef = React.createRef();

    #isPasswordConfirmValid(){
        this.#passwordConfirmationRef.current.setErrorMessage(null);
        const { t } = this.props;
        if ( this.#passwordConfirmationRef.current.getValue() !== this._passwordRef.current.getValue() ){
            this.#passwordConfirmationRef.current.setErrorMessage(t('signupForm.error.passwordMismatch'));
            return false;
        }
        return true;
    }

    async _isValid(){
        if ( this._isUsernameValid() ){
            let isValid = ( await super._isValid() ), username = this._usernameRef.current.getValue();
            isValid = ( await this.#verifyUsername(username) ) && isValid;
            return this.#isPasswordConfirmValid() && isValid;
        }
        const isValid = await super._isValid();
        return this.#isPasswordConfirmValid() && isValid;
    }

    async #verifyUsername(username){
        const isUsernameAvailable = await new UserService().isUsernameAvailable(username);
        this._usernameRef.current.setErrorMessage(null);
        const { t } = this.props;
        if ( !isUsernameAvailable ){
            this._usernameRef.current.setErrorMessage(t('signupForm.error.usernameTaken'));
        }
        return isUsernameAvailable;
    }

    _handlePasswordConfirmationChange(){
        this.#isPasswordConfirmValid();
    }

    _handleUsernameChange(){
        if ( this._isUsernameValid() ){
            this.#verifyUsername(this._usernameRef.current.getValue());
        }
    }

    constructor(props){
        super(props);

        this._handlePasswordConfirmationChange = this._handlePasswordConfirmationChange.bind(this);
    }

    async submit(event){
        const isValid = await this._isValid();
        if ( isValid ){
            const isUsernameAvailable = await this.#verifyUsername(this._usernameRef.current.getValue());
            if ( isUsernameAvailable ){
                this.props.onSubmit({
                    password: this._passwordRef.current.getValue(),
                    username: this._usernameRef.current.getValue()
                }, event);
            }
        }
    }

    render(){
        const { t } = this.props;
        return (
            <Form onSubmit={this._handleSubmit}>
                <div className={styles.formContainer}>
                    <div className={styles.field}>
                        <TextField type={'text'} name={'username'} label={t('signupForm.label.username')} ref={this._usernameRef} onChange={this._handleUsernameChange} />
                    </div>
                    <div className={styles.field}>
                        <TextField type={'password'} name={'password'} label={t('signupForm.label.password')} ref={this._passwordRef} onChange={this._handlePasswordChange} />
                    </div>
                    <div className={styles.field}>
                        <TextField type={'password'} name={'password-confirmation'} label={t('signupForm.label.passwordConfirmation')} ref={this.#passwordConfirmationRef} onChange={this._handlePasswordConfirmationChange} />
                    </div>
                    <div className={styles.field + ' text-primary'}>
                        <p className={styles.question}>{t('signupForm.question')}</p>
                        <p className={styles.answer}>{t('signupForm.answer')}</p>
                    </div>
                    {this._renderGenericErrorMessages()}
                    <div className={styles.submit}>
                        <input type={'submit'} value={t('signupForm.label.submit')} />
                    </div>
                </div>
            </Form>
        );
    }
}

export default withTranslation(null, { withRef: true })(SignupForm);
