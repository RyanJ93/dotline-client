'use strict';

import AuthenticationForm from '../AuthenticationForm/AuthenticationForm';
import UserService from '../../services/UserService';
import TextField from '../TextField/TextField';
import styles from './SignupForm.scss';
import Form from '../Form/Form';
import React from 'react';

class SignupForm extends AuthenticationForm {
    #passwordConfirmation = React.createRef();

    #isPasswordConfirmValid(){
        this.#passwordConfirmation.current.setErrorMessage(null);
        if ( this.#passwordConfirmation.current.getValue() !== this._password.current.getValue() ){
            this.#passwordConfirmation.current.setErrorMessage('Passwords don\'t match!');
            return false;
        }
        return true;
    }

    async _isValid(){
        if ( this._isUsernameValid() ){
            let isValid = ( await super._isValid() ), username = this._username.current.getValue();
            isValid = ( await this.#verifyUsername(username) ) && isValid;
            return this.#isPasswordConfirmValid() && isValid;
        }
        const isValid = await super._isValid();
        return this.#isPasswordConfirmValid() && isValid;
    }

    async #verifyUsername(username){
        const userService = new UserService();
        const isUsernameAvailable = await userService.isUsernameAvailable(username);
        this._username.current.setErrorMessage(null);
        if ( !isUsernameAvailable ){
            const message = 'This username has been taken already.';
            this._username.current.setErrorMessage(message);
        }
        return isUsernameAvailable;
    }

    _handlePasswordConfirmationChange(){
        this.#isPasswordConfirmValid();
    }

    _handleUsernameChange(){
        if ( this._isUsernameValid() ){
            this.#verifyUsername(this._username.current.getValue());
        }
    }

    constructor(props){
        super(props);

        this._handlePasswordConfirmationChange = this._handlePasswordConfirmationChange.bind(this);
    }

    async submit(event){
        const isValid = await this._isValid();
        if ( isValid ){
            const isUsernameAvailable = await this.#verifyUsername(this._username.current.getValue());
            if ( isUsernameAvailable ){
                this.props.onSubmit({
                    password: this._password.current.getValue(),
                    username: this._username.current.getValue()
                }, event);
            }
        }
    }

    render(){
        return (
            <Form onSubmit={this._handleSubmit}>
                <div className={styles.formContainer}>
                    <div className={styles.field}>
                        <TextField type={'text'} name={'username'} label={'Username'} ref={this._username} onChange={this._handleUsernameChange} />
                    </div>
                    <div className={styles.field}>
                        <TextField type={'password'} name={'password'} label={'Password'} ref={this._password} onChange={this._handlePasswordChange} />
                    </div>
                    <div className={styles.field}>
                        <TextField type={'password'} name={'password-confirmation'} label={'Password confirmation'} ref={this.#passwordConfirmation} onChange={this._handlePasswordConfirmationChange} />
                    </div>
                    <div className={styles.field}>
                        <p className={styles.question}>Where do I have to input my phone number or e-mail?</p>
                        <p className={styles.answer}>We don't need any of your personal information, enjoy a service focused on privacy at all.</p>
                    </div>
                    {this._renderGenericErrorMessages()}
                    <div className={styles.submit}>
                        <input className={styles.button} type={'submit'} value={'Create my account'} />
                    </div>
                </div>
            </Form>
        );
    }
}

export default SignupForm;
