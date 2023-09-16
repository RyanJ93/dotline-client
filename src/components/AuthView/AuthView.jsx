'use strict';

import DuplicatedUsernameException from '../../exceptions/DuplicatedUsernameException';
import IllustratedProgressBar from '../IllustratedProgressBar/IllustratedProgressBar';
import UnauthorizedException from '../../exceptions/UnauthorizedException';
import InvalidInputException from '../../exceptions/InvalidInputException';
import ConversationService from '../../services/ConversationService';
import NotFoundException from '../../exceptions/NotFoundException';
import UserService from '../../services/UserService';
import CommonUtils from '../../utils/CommonUtils';
import SignupForm from '../SignupForm/SignupForm';
import { withTranslation } from 'react-i18next';
import LoginForm from '../LoginForm/LoginForm';
import Footer from '../Footer/Footer';
import styles from './AuthView.scss';
import React from 'react';
import AccountRecoverForm from '../AccountRecoverForm/AccountRecoverForm';

class AuthView extends React.Component {
    #illustratedProgressBar = React.createRef();
    #signupForm = React.createRef();
    #loginForm = React.createRef();

    _handleRecoverClick(){
        this.setState(() => { return { action: 'recover' } });
    }

    _handleSignupClick(){
        this.setState(() => { return { action: 'signup' } });
    }

    _handleLoginClick(){
        this.setState(() => { return { action: 'login' } });
    }

    _handleLoginSubmit(fields){
        const { username, password, isSession } = fields;
        this.#login(username, password, isSession);
    }

    _handleSignupSubmit(fields){
        const { username, password } = fields;
        this.#signup(username, password);
    }

    _handleAccountRecovered(){
        this.#finalizeAuthentication('account-recovery');
    }

    #handleFormException(exception, formRef){
        this.setState((prev) => { return { ...prev, container: 'form' } });
        const { t } = this.props;
        if ( exception instanceof InvalidInputException ){
            formRef.current.displayErrorMessages(exception.getErrorMessageBag());
        }else if ( exception instanceof DuplicatedUsernameException ){
            formRef.current.displayErrorMessageText(t('authView.error.duplicatedUsername'));
        }else if ( exception instanceof UnauthorizedException ){
            formRef.current.displayErrorMessageText(t('authView.error.unauthorized'));
        }else if ( exception instanceof NotFoundException ){
            formRef.current.displayErrorMessageText(t('authView.error.notFound'));
        }else{
            formRef.current.displayErrorMessageText(t('authView.error.generic'));
            console.error(exception);
        }
    }

    async #signup(username, password){
        try{
            const userService = new UserService(), { t } = this.props;
            this.#setProgressBarStatus(40, t('authView.signup.generatingKeys'), 'key');
            const authenticatedUserExportedRSAKeys = await userService.generateUserKeys(password);
            const userRecoveryParams = await userService.generateRecoveryKey(authenticatedUserExportedRSAKeys);
            await CommonUtils.delay(1000);
            this.#setProgressBarStatus(80, t('authView.signup.creatingAccount'), 'users');
            await userService.signup(username, password, authenticatedUserExportedRSAKeys, userRecoveryParams);
            await new ConversationService().fetchConversations();
            this.#setProgressBarStatus(100, t('authView.signup.completed'), 'check');
            if ( typeof this.props.onAuthenticationSuccessful === 'function' ){
                this.props.onAuthenticationSuccessful('signup', {
                    userRecoveryParams: userRecoveryParams
                });
            }
        }catch(ex){
            this.#handleFormException(ex, this.#signupForm);
        }
    }

    async #finalizeAuthentication(mechanism){
        this.#setProgressBarStatus(60, this.props.t('authView.login.fetchingKeys'), 'lock');
        await CommonUtils.delay(1000);
        this.#setProgressBarStatus(75, this.props.t('authView.login.loadingConversations'), 'comments');
        await new ConversationService().fetchConversations();
        this.#setProgressBarStatus(100, this.props.t('authView.login.completed'), 'check');
        if ( typeof this.props.onAuthenticationSuccessful === 'function' ){
            this.props.onAuthenticationSuccessful(mechanism);
        }
    }

    async #login(username, password, isSession = false){
        try{
            this.#setProgressBarStatus(30, this.props.t('authView.login.authenticating'), 'key');
            await new UserService().login(username, password, isSession);
            await this.#finalizeAuthentication('login');
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
        const { t } = this.props;
        return (
            <div className={styles.container + ' text-primary'} data-active={this.state.container === 'form'}>
                <div className={styles.logo + ' logo-img'} />
                <p className={styles.catchPhrase}>{t('authView.catchPhrase')}</p>
                <div className={styles.formWrapper} data-active={this.state.action === 'login'}>
                    <LoginForm onSubmit={this._handleLoginSubmit} ref={this.#loginForm} />
                    <div className={styles.bottomText}>
                        <p>{t('authView.noAccountQuestion')} <a className={'link-primary'} href={'#'} onClick={this._handleSignupClick}>{t('authView.noAccountAnswer')}</a></p>
                        <p>{t('authView.accountRecoverQuestion')} <a className={'link-primary'} href={'#'} onClick={this._handleRecoverClick}>{t('authView.accountRecoverAnswer')}</a></p>
                    </div>
                </div>
                <div className={styles.formWrapper} data-active={this.state.action === 'recover'}>
                    <AccountRecoverForm onAccountRecovered={this._handleAccountRecovered} />
                </div>
                <div className={styles.formWrapper} data-active={this.state.action === 'signup'}>
                    <SignupForm onSubmit={this._handleSignupSubmit} ref={this.#signupForm} />
                    <div className={styles.bottomText}>
                        <p className={styles.question}>{t('authView.accountQuestion')} <a className={'link-primary'} href={'#'} onClick={this._handleLoginClick}>{t('authView.accountAnswer')}</a></p>
                    </div>
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

        this._handleAccountRecovered = this._handleAccountRecovered.bind(this);
        this._handleRecoverClick = this._handleRecoverClick.bind(this);
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
            <div className={styles.view + ' bg-primary text-primary full-viewport'}>
                <div className={'full-viewport-container'}>
                    <div className={styles.contentWrapper}>
                        { this.#renderLoginProgressBar() }
                        { this.#renderFormContainer() }
                    </div>
                    <Footer />
                </div>
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(AuthView);
