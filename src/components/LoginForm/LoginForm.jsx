'use strict';

import AuthenticationForm from '../AuthenticationForm/AuthenticationForm';
import TextField from '../TextField/TextField';
import styles from './LoginForm.scss';
import React from 'react';

class LoginForm extends AuthenticationForm {
    render(){
        return (
            <form className={styles.form} onSubmit={this._handleSubmit}>
                <div className={styles.fieldSet}>
                    <div className={styles.field}>
                        <TextField type={'text'} name={'username'} label={'Username'} ref={this._username} onChange={this._handleUsernameChange} />
                    </div>
                    <div className={styles.field}>
                        <TextField type={'password'} name={'password'} label={'Password'} ref={this._password} onChange={this._handlePasswordChange} />
                    </div>
                    {this._renderGenericErrorMessages()}
                    <div className={styles.submit}>
                        <input className={styles.button} type={'submit'} value={'Login'} />
                    </div>
                </div>
            </form>
        );
    }
}

export default LoginForm;
