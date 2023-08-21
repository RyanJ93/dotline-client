'use strict';

import SubmitButton from '../../SubmitButton/SubmitButton';
import styles from './PasswordChangeSettingsSection.scss';
import UserService from '../../../services/UserService';
import TextField from '../../TextField/TextField';
import { withTranslation } from 'react-i18next';
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
        const { t } = this.props;
        if ( this.#currentPasswordInputRef.current.getValue() === '' ){
            this.#currentPasswordInputRef.current.setErrorMessage(t('passwordChangeSettingsSection.invalidCurrentPassword'));
            return false;
        }
        const confirmPassword = this.#confirmPasswordInputRef.current.getValue();
        const newPassword = this.#newPasswordInputRef.current.getValue();
        if ( newPassword === '' ){
            this.#newPasswordInputRef.current.setErrorMessage(t('passwordChangeSettingsSection.invalidNewPassword'));
            return false;
        }
        if ( confirmPassword !== newPassword ){
            this.#confirmPasswordInputRef.current.setErrorMessage(t('passwordChangeSettingsSection.passwordMismatch'));
            return false;
        }
        return true;
    }

    async #submit(){
        const currentPassword = this.#currentPasswordInputRef.current.getValue(), { t } = this.props;
        const message = t('passwordChangeSettingsSection.passwordChanged');
        const newPassword = this.#newPasswordInputRef.current.getValue();
        const label = t('passwordChangeSettingsSection.label.save');
        this.#submitButtonRef.current.setStatus('loading');
        try{
            await new UserService().changePassword(currentPassword, newPassword);
            this.#submitButtonRef.current.setTemporaryStatus('completed', message, label);
        }catch(ex){
            this.#submitButtonRef.current.setTemporaryStatus('error', label, label);
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
        const { t } = this.props;
        return (
            <div className={styles.section} onSubmit={this._handleSubmit}>
                <form className={styles.content} >
                    <p className={styles.sectionTitle + ' text-primary'}>{t('passwordChangeSettingsSection.title')}</p>
                    <div className={styles.field}>
                        <TextField label={t('passwordChangeSettingsSection.label.currentPassword')} type={'password'} ref={this.#currentPasswordInputRef} />
                    </div>
                    <div className={styles.field}>
                        <TextField label={t('passwordChangeSettingsSection.label.newPassword')} type={'password'} ref={this.#newPasswordInputRef} />
                    </div>
                    <div className={styles.field}>
                        <TextField label={t('passwordChangeSettingsSection.label.confirmPassword')} type={'password'} ref={this.#confirmPasswordInputRef} />
                        <p className={styles.note + ' text-primary'}>{t('passwordChangeSettingsSection.label.passwordNote')}</p>
                    </div>
                    <div className={styles.submit}>
                        <SubmitButton value={t('passwordChangeSettingsSection.label.changePassword')} ref={this.#submitButtonRef} />
                    </div>
                </form>
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(PasswordChangeSettingsSection);
