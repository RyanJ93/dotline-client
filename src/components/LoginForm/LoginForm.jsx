'use strict';

import AuthenticationForm from '../AuthenticationForm/AuthenticationForm';
import TextField from '../TextField/TextField';
import styles from './LoginForm.scss';
import React from 'react';

class LoginForm extends AuthenticationForm {
    #rememberMeRef = React.createRef();

    async submit(event){
        this.props.onSubmit({
            isSession: !this.#rememberMeRef.current.checked,
            password: this._password.current.getValue(),
            username: this._username.current.getValue(),
        }, event);
    }

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
                    <div className={styles.field}>
                        <input type={'checkbox'} name={'remember_me'} ref={this.#rememberMeRef} />
                        <label form={'remember_me'}>Remember me</label>
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
