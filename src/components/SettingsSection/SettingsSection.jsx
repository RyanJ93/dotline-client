'use strict';

import SubmitButton from '../SubmitButton/SubmitButton';
import UserService from '../../services/UserService';
import TextField from '../TextField/TextField';
import styles from './SettingsSection.scss';
import Event from '../../facades/Event';
import React from 'react';
import UserSettingsService from '../../services/UserSettingsService';
import LocalDataService from '../../services/LocalDataService';

class SettingsSection extends React.Component {
    #basicInfoSubmitButtonRef = React.createRef();
    #settingsSubmitButtonRef = React.createRef();
    #usernameInputRef = React.createRef();
    #surnameInputRef = React.createRef();
    #localeSelectRef = React.createRef();
    #themeSelectRef = React.createRef();
    #nameInputRef = React.createRef();

    #areBasicInfoValid(){
        this.#usernameInputRef.current.setErrorMessage(null);
        if ( this.#usernameInputRef.current.getValue() === '' ){
            this.#usernameInputRef.current.setErrorMessage('You must provide a valid username!');
            return false;
        }
        return true;
    }

    async #submitBasicInfo(){
        this.#basicInfoSubmitButtonRef.current.setStatus('loading');
        const username = this.#usernameInputRef.current.getValue();
        const surname = this.#surnameInputRef.current.getValue();
        const name = this.#nameInputRef.current.getValue();
        await new UserService().edit(username, name, surname);
        this.#basicInfoSubmitButtonRef.current.setStatus('ready');
    }

    async #submitSettings(){
        this.#settingsSubmitButtonRef.current.setStatus('loading');
        const locale = this.#localeSelectRef.current.value;
        const theme = this.#themeSelectRef.current.value;
        await new UserSettingsService().update(locale, theme);
        this.#settingsSubmitButtonRef.current.setStatus('ready');
    }

    _handleBasicInfoSubmit(event){
        event.preventDefault();
        event.stopPropagation();
        if ( this.#areBasicInfoValid() ){
            this.#submitBasicInfo();
        }
    }

    _handleSettingsSubmit(event){
        event.preventDefault();
        event.stopPropagation();
        this.#submitSettings();
    }

    #renderBasicInfoSection(){
        return (
            <div className={styles.section}>
                <form className={styles.content} onSubmit={this._handleBasicInfoSubmit}>
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
                        <SubmitButton value={'Save'} ref={this.#basicInfoSubmitButtonRef} />
                    </div>
                </form>
            </div>
        );
    }

    #renderSettingsSection(){
        return (
            <div className={styles.section}>
                <form className={styles.content} onSubmit={this._handleSettingsSubmit}>
                    <p className={styles.sectionTitle}>User settings</p>
                    <div className={styles.field}>
                        <select ref={this.#localeSelectRef}>
                            <option value={'en'}>English</option>
                            <option value={'it'}>Italiano</option>
                        </select>
                    </div>
                    <div className={styles.field}>
                        <select ref={this.#themeSelectRef}>
                            <option value={'auto'}>Theme: auto</option>
                            <option value={'dark'}>Theme: dark</option>
                            <option value={'light'}>Theme: light</option>
                        </select>
                    </div>
                    <div className={styles.submit}>
                        <SubmitButton value={'Save'} ref={this.#settingsSubmitButtonRef} />
                    </div>
                </form>
            </div>
        );
    }

    _handleClearLocalData(){
        new LocalDataService().refreshLocalData(true);
    }

    _handleLogOut(){
        new UserService().logout();
    }

    #renderControlsSection(){
        return (
            <div className={styles.section}>
                <div className={styles.content}>
                    <p className={styles.sectionTitle}>Operations</p>
                    <div className={styles.operation}>
                        <button onClick={this._handleClearLocalData}>Clear local data</button>
                    </div>
                    <div className={styles.operation}>
                        <button className={'danger'} onClick={this._handleLogOut}>Log out</button>
                    </div>
                </div>
            </div>
        );
    }

    _handleUserAuthenticated(user){
        this.setState((prev) => ({ ...prev, user: user }));
        this.#usernameInputRef.current.setValue(user.getUsername());
        this.#surnameInputRef.current.setValue(user.getSurname());
        this.#nameInputRef.current.setValue(user.getName());
    }

    constructor(props){
        super(props);

        this._handleUserAuthenticated = this._handleUserAuthenticated.bind(this);
        this._handleBasicInfoSubmit = this._handleBasicInfoSubmit.bind(this);
        this._handleSettingsSubmit = this._handleSettingsSubmit.bind(this);
        this._handleClearLocalData = this._handleClearLocalData.bind(this);
        this._handleLogOut = this._handleLogOut.bind(this);
        this.state = { user: null };
    }

    componentDidMount(){
        Event.getBroker().on('userAuthenticated', this._handleUserAuthenticated);
    }

    render(){
        return (
            <div className={styles.settingsSection}>
                {this.#renderBasicInfoSection()}
                {this.#renderSettingsSection()}
                {this.#renderControlsSection()}
            </div>
        );
    }
}

export default SettingsSection;
