'use strict';

import UserSettingsService from '../../../services/UserSettingsService';
import SubmitButton from '../../SubmitButton/SubmitButton';
import styles from './UserSettingsSection.scss';
import React from 'react';

class UserSettingsSection extends React.Component {
    #submitButtonRef = React.createRef();
    #localeSelectRef = React.createRef();
    #themeSelectRef = React.createRef();

    async #submit(){
        try{
            this.#submitButtonRef.current.setStatus('loading');
            const locale = this.#localeSelectRef.current.value;
            const theme = this.#themeSelectRef.current.value;
            await new UserSettingsService().update(locale, theme);
            this.#submitButtonRef.current.setTemporaryStatus('completed', 'Settings saved', 'Save');
        }catch(ex){
            this.#submitButtonRef.current.setTemporaryStatus('error', 'Save', 'Save');
            throw ex;
        }
    }

    _handleSubmit(event){
        event.preventDefault();
        event.stopPropagation();
        this.#submit();
    }

    constructor(props){
        super(props);

        this._handleSubmit = this._handleSubmit.bind(this);
    }

    render(){
        return (
            <div className={styles.section}>
                <form className={styles.content} onSubmit={this._handleSubmit}>
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
                        <SubmitButton value={'Save'} ref={this.#submitButtonRef} />
                    </div>
                </form>
            </div>
        );
    }
}

export default UserSettingsSection;
