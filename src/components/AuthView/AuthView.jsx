'use strict';

import DuplicatedUsernameException from '../../exceptions/DuplicatedUsernameException';
import IllustratedProgressBar from '../IllustratedProgressBar/IllustratedProgressBar';
import UnauthorizedException from '../../exceptions/UnauthorizedException';
import InvalidInputException from '../../exceptions/InvalidInputException';
import NotFoundException from '../../exceptions/NotFoundException';
import UserService from '../../services/UserService';
import CommonUtils from '../../utils/CommonUtils';
import SignupForm from '../SignupForm/SignupForm';
import LoginForm from '../LoginForm/LoginForm';
import HTMLLogo from '../HTMLLogo/HTMLLogo';
import Footer from '../Footer/Footer';
import styles from './AuthView.scss';
import React from 'react';

class AuthView extends React.Component {
    #illustratedProgressBar = React.createRef();
    #signupForm = React.createRef();
    #loginForm = React.createRef();

    _handleSignupClick(){
        this.setState(() => { return { action: 'signup' } });
    }

    _handleLoginClick(){
        this.setState(() => { return { action: 'login' } });
    }

    _handleLoginSubmit(fields){
        const { username, password } = fields;
        this.#login(username, password);
    }

    _handleSignupSubmit(fields){
        const { username, password } = fields;
        this.#signup(username, password);
    }

    #handleFormException(exception, formRef){
        this.setState((prev) => { return { ...prev, container: 'form' } });
        if ( exception instanceof InvalidInputException ){
            formRef.current.displayErrorMessages(exception.getErrorMessageBag());
        }else if ( exception instanceof DuplicatedUsernameException ){
            formRef.current.displayErrorMessageText('This username has been taken already.');
        }else if ( exception instanceof UnauthorizedException ){
            formRef.current.displayErrorMessageText('Provided credentials are not valid.');
        }else if ( exception instanceof NotFoundException ){
            formRef.current.displayErrorMessageText('No user matching the given username found.');
        }else{
            const errorMessageText = 'An error occurred during the process, please retry later.';
            formRef.current.displayErrorMessageText(errorMessageText);
            console.error(exception);
        }
    }

    async #signup(username, password){
        try{
            const userService = new UserService();
            this.#setProgressBarStatus(40, 'Generating secure crypto keys...', 'key');
            const authenticatedUserExportedRSAKeys = await userService.generateUserKeys(password);
            await CommonUtils.delay(1000);
            this.#setProgressBarStatus(80, 'Creating your brand new account...', 'users');
            await userService.signup(username, password, authenticatedUserExportedRSAKeys);
            this.#setProgressBarStatus(100, 'All set! You will be redirected to your account shortly...', 'check');
        }catch(ex){
            this.#handleFormException(ex, this.#signupForm);
        }
    }

    async #login(username, password){
        try{
            const userService = new UserService();
            this.#setProgressBarStatus(30, 'Authenticating the user...', 'key');
            await userService.login(username, password);
            this.#setProgressBarStatus(60, 'Fetching crypto keys and settings up end-to-end encryption...', 'lock');
            await CommonUtils.delay(1000);
            this.#setProgressBarStatus(75, 'Loading conversations...', 'comments');
            // TODO: Fetch conversations and messages.
        }catch(ex){
            this.#handleFormException(ex, this.#loginForm);
        }
    }

    #setProgressBarStatus(value, message = null, icon = null){
        this.setState((prev) => { return { ...prev, container: 'progress-bar' } });
        this.#illustratedProgressBar.current.setMessage(message);
        this.#illustratedProgressBar.current.setValue(value);
        this.#illustratedProgressBar.current.setIcon(icon);
    }

    #renderFormContainer(){
        return (
            <div className={styles.container} data-active={this.state.container === 'form'}>
                <HTMLLogo />
                <p className={styles.catchPhrase}>Start privately chatting with your contacts, now</p>
                <div className={styles.formWrapper} data-active={this.state.action === 'login'}>
                    <LoginForm onSubmit={this._handleLoginSubmit} ref={this.#loginForm} />
                    <p>Don't you have an account yet? <a href={'#'} onClick={this._handleSignupClick}>Jump in!</a></p>
                </div>
                <div className={styles.formWrapper} data-active={this.state.action === 'signup'}>
                    <SignupForm onSubmit={this._handleSignupSubmit} ref={this.#signupForm} />
                    <p>do you already have an account? <a href={'#'} onClick={this._handleLoginClick}>Log in!</a></p>
                </div>
            </div>
        );
    }

    #renderLoginProgressBar(){
        return (
            <div className={styles.container} data-active={this.state.container === 'progress-bar'}>
                <IllustratedProgressBar ref={this.#illustratedProgressBar} />
            </div>
        );
    }

    constructor(props){
        super(props);

        this._handleSignupSubmit = this._handleSignupSubmit.bind(this);
        this._handleLoginSubmit = this._handleLoginSubmit.bind(this);
        this._handleSignupClick = this._handleSignupClick.bind(this);
        this._handleLoginClick = this._handleLoginClick.bind(this);
        this.state = { action: 'login', container: 'form' };
    }

    resetView(){
        this.setState((prev) => { return { ...prev, container: 'form' } });
        this.#illustratedProgressBar.current.setMessage(null);
        this.#illustratedProgressBar.current.setIcon(null);
        this.#illustratedProgressBar.current.setValue(0);
        return this;
    }

    render(){
        return (
            <div className={styles.view}>
                { this.#renderLoginProgressBar() }
                { this.#renderFormContainer() }
                <Footer />
            </div>
        );
    }
}

export default AuthView;
