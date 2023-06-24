'use strict';

import SubmitButton from '../../SubmitButton/SubmitButton';
import styles from './PasswordChangeSettingsSection.scss';
import UserService from '../../../services/UserService';
import TextField from '../../TextField/TextField';
import React from 'react';

class PasswordChangeSettingsSection extends React.Component {
    #currentPasswordInputRef = React.createRef();
    #confirmPasswordInputRef = React.createRef();
    #newPasswordInputRef = React.createRef();
    #submitButtonRef = React.createRef();

    #isFormValid(){
        this.#currentPasswordInputRef.current.setErrorMessage(null);
        this.#confirmPasswordInputRef.current.setErrorMessage(null);
        this.#newPasswordInputRef.current.setErrorMessage(null);
        if ( this.#currentPasswordInputRef.current.getValue() === '' ){
            this.#currentPasswordInputRef.current.setErrorMessage('You must provide your current password!');
            return false;
        }
        const confirmPassword = this.#confirmPasswordInputRef.current.getValue();
        const newPassword = this.#newPasswordInputRef.current.getValue();
        if ( newPassword === '' ){
            this.#newPasswordInputRef.current.setErrorMessage('You must provide a new password!');
            return false;
        }
        if ( confirmPassword !== newPassword ){
            this.#confirmPasswordInputRef.current.setErrorMessage('Passwords must match!');
            return false;
        }
        return true;
    }

    async #submit(){
        try{
            const currentPassword = this.#currentPasswordInputRef.current.getValue();
            const newPassword = this.#newPasswordInputRef.current.getValue();
            this.#submitButtonRef.current.setStatus('loading');
            await new UserService().changePassword(currentPassword, newPassword);
            this.#submitButtonRef.current.setTemporaryStatus('completed', 'Password changed', 'Save');
        }catch(ex){
            this.#submitButtonRef.current.setTemporaryStatus('error', 'Save', 'Save');
            throw ex;
        }
    }

    _handleSubmit(event){
        event.preventDefault();
        event.stopPropagation();
        if ( this.#isFormValid() ){
            this.#submit();
        }
    }

    constructor(props){
        super(props);

        this._handleSubmit = this._handleSubmit.bind(this);
    }

    render(){
        return (
            <div className={styles.section} onSubmit={this._handleSubmit}>
                <form className={styles.content} >
                    <p className={styles.sectionTitle}>Change password</p>
                    <div className={styles.field}>
                        <TextField label={'Current password'} type={'password'} ref={this.#currentPasswordInputRef} />
                    </div>
                    <div className={styles.field}>
                        <TextField label={'New password'} type={'password'} ref={this.#newPasswordInputRef} />
                    </div>
                    <div className={styles.field}>
                        <TextField label={'Confirm password'} type={'password'} ref={this.#confirmPasswordInputRef} />
                        <p className={styles.note}>Note that when password is changes all other open sessions will be closed.</p>
                    </div>
                    <div className={styles.submit}>
                        <SubmitButton value={'Change password'} ref={this.#submitButtonRef} />
                    </div>
                </form>
            </div>
        );
    }
}

export default PasswordChangeSettingsSection;
