'use strict';

import SubmitButton from '../../SubmitButton/SubmitButton';
import UserService from '../../../services/UserService';
import styles from './BasicInfoSettingsSection.scss';
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
        this.#usernameInputRef.current.setErrorMessage(null);
        if ( this.#usernameInputRef.current.getValue() === '' ){
            this.#usernameInputRef.current.setErrorMessage(this.props.t('basicInfoSettingsSection.invalidUsername'));
            return false;
        }
        return true;
    }

    async #submit(){
        const name = this.#nameInputRef.current.getValue(), { t } = this.props;
        const successMessage = t('basicInfoSettingsSection.successMessage');
        const saveLabel = t('basicInfoSettingsSection.label.save');
        const username = this.#usernameInputRef.current.getValue();
        const surname = this.#surnameInputRef.current.getValue();
        this.#submitButtonRef.current.setStatus('loading');
        try{
            await new UserService().edit(username, name, surname);
            this.#submitButtonRef.current.setTemporaryStatus('completed', successMessage, saveLabel);
        }catch(ex){
            this.#submitButtonRef.current.setTemporaryStatus('error', saveLabel, saveLabel);
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
