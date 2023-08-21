'use strict';

import AuthenticationForm from '../AuthenticationForm/AuthenticationForm';
import { withTranslation } from 'react-i18next';
import TextField from '../TextField/TextField';
import styles from './LoginForm.scss';
import React from 'react';

class LoginForm extends AuthenticationForm {
    #rememberMeRef = React.createRef();

    async submit(event){
        const isValid = await this._isValid();
        if ( isValid ){
            this.props.onSubmit({
                isSession: !this.#rememberMeRef.current.checked,
                password: this._passwordRef.current.getValue(),
                username: this._usernameRef.current.getValue()
            }, event);
        }
    }

    render(){
        const { t } = this.props;
        return (
            <form className={styles.form} onSubmit={this._handleSubmit}>
                <div className={styles.fieldSet}>
                    <div className={styles.field}>
                        <TextField type={'text'} name={'username'} label={t('loginForm.label.username')} ref={this._usernameRef} />
                    </div>
                    <div className={styles.field}>
                        <TextField type={'password'} name={'password'} label={t('loginForm.label.password')} ref={this._passwordRef} />
                    </div>
                    <div className={styles.field}>
                        <input type={'checkbox'} name={'remember_me'} ref={this.#rememberMeRef} />
                        <label form={'remember_me'} className={'text-primary'}>{t('loginForm.label.rememberMe')}</label>
                    </div>
                    {this._renderGenericErrorMessages()}
                    <div className={styles.submit}>
                        <input type={'submit'} value={t('loginForm.label.submit')} />
                    </div>
                </div>
            </form>
        );
    }
}

export default withTranslation(null, { withRef: true })(LoginForm);
