'use strict';

import SubmitButton from '../../SubmitButton/SubmitButton';
import UserService from '../../../services/UserService';
import styles from './BasicInfoSettingsSection.scss';
import TextField from '../../TextField/TextField';
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
            this.#usernameInputRef.current.setErrorMessage('You must provide a valid username!');
            return false;
        }
        return true;
    }

    async #submit(){
        try{
            const username = this.#usernameInputRef.current.getValue();
            const surname = this.#surnameInputRef.current.getValue();
            const name = this.#nameInputRef.current.getValue();
            this.#submitButtonRef.current.setStatus('loading');
            await new UserService().edit(username, name, surname);
            this.#submitButtonRef.current.setTemporaryStatus('completed', 'Successfully saved', 'Save');
        }catch(ex){
            this.#submitButtonRef.current.setTemporaryStatus('error', 'Save', 'Save');
            throw ex;
        }
    }

    _handleUserAuthenticated(user){
        this.#usernameInputRef.current.setValue(user.getUsername());
        this.#surnameInputRef.current.setValue(user.getSurname());
        this.#nameInputRef.current.setValue(user.getName());
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

        this._handleUserAuthenticated = this._handleUserAuthenticated.bind(this);
        this._handleSubmit = this._handleSubmit.bind(this);
    }

    componentDidMount(){
        Event.getBroker().on('userAuthenticated', this._handleUserAuthenticated);
    }

    render(){
        return (
            <div className={styles.section}>
                <form className={styles.content} onSubmit={this._handleSubmit}>
                    <p className={styles.sectionTitle}>Basic information</p>
                    <div className={styles.field}>
                        <TextField label={'Name'} ref={this.#nameInputRef} />
                    </div>
                    <div className={styles.field}>
                        <TextField label={'Surname'} ref={this.#surnameInputRef} />
                    </div>
                    <div className={styles.field}>
                        <TextField label={'Username'} ref={this.#usernameInputRef} />
                    </div>
                    <div className={styles.submit}>
                        <SubmitButton value={'Save'} ref={this.#submitButtonRef} />
                    </div>
                </form>
            </div>
        );
    }
}

export default BasicInfoSettingsSection;
