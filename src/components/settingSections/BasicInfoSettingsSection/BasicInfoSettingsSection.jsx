'use strict';

import ProfilePictureEditor from '../../ProfilePictureEditor/ProfilePictureEditor';
import InputTooLongException from '../../../exceptions/InputTooLongException';
import SubmitButton from '../../SubmitButton/SubmitButton';
import UserService from '../../../services/UserService';
import styles from './BasicInfoSettingsSection.scss';
import StringUtils from '../../../utils/StringUtils';
import TextField from '../../TextField/TextField';
import { withTranslation } from 'react-i18next';
import Event from '../../../facades/Event';
import React from 'react';

class BasicInfoSettingsSection extends React.Component {
    #usernameInputRef = React.createRef();
    #surnameInputRef = React.createRef();
    #submitButtonRef = React.createRef();
    #nameInputRef = React.createRef();

    #isFormValid(){
        const username = this.#usernameInputRef.current.getValue();
        this.#usernameInputRef.current.setErrorMessage(null);
        if ( username === '' || !StringUtils.isValidUsername(username) ){
            this.#usernameInputRef.current.setErrorMessage(this.props.t('basicInfoSettingsSection.invalidUsername'));
            return false;
        }
        return true;
    }

    #handleSubmitError(error){
        const { t } = this.props, saveLabel = t('basicInfoSettingsSection.label.save');
        this.#submitButtonRef.current.setTemporaryStatus('error', saveLabel, saveLabel);
        if ( error instanceof InputTooLongException ){
            if ( error.message.toLowerCase().indexOf('surname') >= 0 ){
                const errorMessage = t('basicInfoSettingsSection.error.surnameTooLong');
                this.#surnameInputRef.current.setErrorMessage(errorMessage);
                return;
            }else if ( error.message.toLowerCase().indexOf('name') >= 0 ){
                const errorMessage = t('basicInfoSettingsSection.error.nameTooLong');
                this.#nameInputRef.current.setErrorMessage(errorMessage);
                return;
            }
        }
        throw error;
    }

    #resetErrorMessages(){
        this.#usernameInputRef.current.setErrorMessage(null);
        this.#surnameInputRef.current.setErrorMessage(null);
        this.#nameInputRef.current.setErrorMessage(null);
    }

    async #submit(){
        const name = this.#nameInputRef.current.getValue(), { t } = this.props;
        const successMessage = t('basicInfoSettingsSection.successMessage');
        const saveLabel = t('basicInfoSettingsSection.label.save');
        const username = this.#usernameInputRef.current.getValue();
        const surname = this.#surnameInputRef.current.getValue();
        this.#submitButtonRef.current.setStatus('loading');
        this.#resetErrorMessages();
        try{
            await new UserService().edit(username, name, surname);
            this.#submitButtonRef.current.setTemporaryStatus('completed', successMessage, saveLabel);
        }catch(ex){
            this.#handleSubmitError(ex);
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

    componentDidMount(){
        Event.getBroker().on('userAuthenticated', (user) => {
            this.#usernameInputRef.current.setValue(user.getUsername());
            this.#surnameInputRef.current.setValue(user.getSurname());
            this.#nameInputRef.current.setValue(user.getName());
        });
    }

    render(){
        const { t } = this.props;
        return (
            <div className={styles.section}>
                <form className={styles.content} onSubmit={this._handleSubmit}>
                    <p className={styles.sectionTitle + ' text-primary'}>{t('basicInfoSettingsSection.title')}</p>
                    <div className={styles.profilePictureEditorWrapper}>
                        <ProfilePictureEditor />
                    </div>
                    <div className={styles.field}>
                        <TextField label={t('basicInfoSettingsSection.label.name')} ref={this.#nameInputRef} />
                    </div>
                    <div className={styles.field}>
                        <TextField label={t('basicInfoSettingsSection.label.surname')} ref={this.#surnameInputRef} />
                    </div>
                    <div className={styles.field}>
                        <TextField label={t('basicInfoSettingsSection.label.username')} ref={this.#usernameInputRef} />
                    </div>
                    <div className={styles.submit}>
                        <SubmitButton value={t('basicInfoSettingsSection.label.save')} ref={this.#submitButtonRef} />
                    </div>
                </form>
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(BasicInfoSettingsSection);
