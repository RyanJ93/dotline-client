'use strict';

import IllegalArgumentException from '../../../exceptions/IllegalArgumentException';
import UnauthorizedException from '../../../exceptions/UnauthorizedException';
import ErrorMessageRender from '../../../support/ErrorMessageRender';
import UserRecoverySession from '../../../DTOs/UserRecoverySession';
import styles from './AccountRecoveryFinalizationStep.scss';
import UserService from '../../../services/UserService';
import ErrorViewer from '../../ErrorViewer/ErrorViewer';
import TextField from '../../TextField/TextField';
import { withTranslation } from 'react-i18next';
import React from 'react';

class AccountRecoveryFinalizationStep extends React.Component {
    #errorMessageRender = new ErrorMessageRender();
    #passwordConfirmRef = React.createRef();
    #errorViewerRef = React.createRef();
    #rememberMeRef = React.createRef();
    #passwordRef = React.createRef();

    #isPasswordValid(){
        const { t } = this.props;
        if ( this.#passwordRef.current.getValue() === '' ){
            this.#passwordRef.current.setErrorMessage(t('accountRecoveryFinalizationStep.error.invalidPassword'));
            return false;
        }
        if ( this.#passwordConfirmRef.current.getValue() === '' ){
            this.#passwordConfirmRef.current.setErrorMessage(t('accountRecoveryFinalizationStep.error.invalidConfirmPassword'));
            return false;
        }
        if ( this.#passwordConfirmRef.current.getValue() !== this.#passwordRef.current.getValue() ){
            this.#passwordConfirmRef.current.setErrorMessage(t('accountRecoveryFinalizationStep.error.passwordMismatch'));
            return false;
        }
        return true;
    }

    async #recoverAccount(){
        this.#errorMessageRender.resetErrorMessages();
        if ( this.#isPasswordValid() ){
            try{
                this.setState((prev) => ({ ...prev, loading: true }));
                const { userRecoverySession } = this.state, password = this.#passwordRef.current.getValue();
                const isSession = this.#rememberMeRef.current.checked !== true;
                await new UserService().recoverAccount(password, userRecoverySession, isSession);
                if ( typeof this.props.onAccountRecoveryCompleted === 'function' ){
                    this.props.onAccountRecoveryCompleted();
                }
            }catch(ex){
                if ( ex instanceof UnauthorizedException && typeof this.props.onUnauthorized ){
                    return this.props.onUnauthorized();
                }
                this.#errorMessageRender.processException(ex);
                console.error(ex);
            }finally{
                this.setState((prev) => ({ ...prev, loading: false }));
            }
        }
    }

    #renderLoadingView(){
        const { t } = this.props;
        return (
            <div className={styles.loaderWrapper + ' text-primary'}>
                <div className={styles.loader + ' loader-img'} />
                <p className={styles.label}>{t('accountRecoveryFinalizationStep.loader.label')}</p>
            </div>
        );
    }

    #renderForm(){
        const { t } = this.props;
        return (
            <form onSubmit={this._handleSubmit} autoComplete={'off'}>
                <div className={styles.fieldSet}>
                    <div className={styles.field}>
                        <TextField type={'password'} name={'password'} label={t('accountRecoveryFinalizationStep.label.password')} ref={this.#passwordRef} />
                    </div>
                    <div className={styles.field}>
                        <TextField type={'password'} name={'password_confirm'} label={t('accountRecoveryFinalizationStep.label.passwordConfirmation')} ref={this.#passwordConfirmRef} />
                    </div>
                    <div className={styles.field}>
                        <input type={'checkbox'} name={'remember_me'} ref={this.#rememberMeRef} />
                        <label form={'remember_me'} className={'text-primary'}>{t('accountRecoveryFinalizationStep.label.rememberMe')}</label>
                    </div>
                    <ErrorViewer ref={this.#errorViewerRef} />
                    <div className={styles.submit}>
                        <input type={'submit'} value={t('accountRecoveryFinalizationStep.label.submit')} />
                    </div>
                </div>
            </form>
        );
    }

    _handleSubmit(event){
        event.preventDefault();
        event.stopPropagation();
        this.#recoverAccount();
    }

    constructor(props){
        super(props);

        this.state = { userRecoverySession: null, loading: false };
        this._handleSubmit = this._handleSubmit.bind(this);
    }

    componentDidMount(){
        this.#errorMessageRender.setDefaultErrorMessage(this.props.t('accountRecoverForm.error.generic'));
        this.#errorMessageRender.setDefaultErrorViewerRef(this.#errorViewerRef);
        this.#errorMessageRender.setFieldMapping({ password: this.#passwordRef });
    }

    setUserRecoverySession(userRecoverySession){
        if ( userRecoverySession !== null && !( userRecoverySession instanceof UserRecoverySession ) ){
            throw new IllegalArgumentException('Invalid user recovery session.');
        }
        this.setState((prev) => ({ ...prev, userRecoverySession: userRecoverySession }));
        return this;
    }

    getUserRecoverySession(){
        return this.state.userRecoverySession;
    }

    render(){
        return (
            <div className={styles.accountRecoveryFinalizationStep}>
                <div className={styles.container} data-active={this.state.loading}>{this.#renderLoadingView()}</div>
                <div className={styles.container} data-active={!this.state.loading}>{this.#renderForm()}</div>
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(AccountRecoveryFinalizationStep);
