'use strict';

import ErrorMessageRender from '../../../support/ErrorMessageRender';
import UserService from '../../../services/UserService';
import ErrorViewer from '../../ErrorViewer/ErrorViewer';
import StringUtils from '../../../utils/StringUtils';
import styles from './AccountRecoveryInitStep.scss';
import TextField from '../../TextField/TextField';
import FileUtils from '../../../utils/FileUtils';
import { withTranslation } from 'react-i18next';
import React from 'react';

class AccountRecoveryInitStep extends React.Component {
    #errorMessageRender = new ErrorMessageRender();
    #errorViewerRef = React.createRef();
    #recoveryKeyRef = React.createRef();
    #fileInputRef = React.createRef();
    #usernameRef = React.createRef();
    #dropZoneRef = React.createRef();

    #isUsernameValid(){
        this.#usernameRef.current.setErrorMessage(null);
        const { t } = this.props;
        if ( this.#usernameRef.current.getValue() === '' ){
            this.#usernameRef.current.setErrorMessage(t('accountRecoveryInitStep.error.invalidUsername'));
            return false;
        }
        if ( !StringUtils.isValidUsername(this.#usernameRef.current.getValue()) ){
            this.#usernameRef.current.setErrorMessage(t('accountRecoveryInitStep.error.invalidUsernameFormat'));
            return false;
        }
        return true;
    }

    #isRecoveryKeyValid(){
        const { t } = this.props;
        if ( this.#recoveryKeyRef.current.getValue() === '' ){
            this.#recoveryKeyRef.current.setErrorMessage(t('accountRecoveryInitStep.error.invalidRecoveryKey'));
            return false;
        }
        return true;
    }

    async #processRecoveryKeyFile(file){
        if ( file.type !== 'text/plain' || file.size <= 0 ){
            const { t } = this.props, errorMessage = t('accountRecoveryInitStep.error.invalidRecoveryKeyFile');
            this.#errorMessageRender.displayErrorMessage(errorMessage);
        }else{
            const fileContents = await FileUtils.readUploadedFile(file);
            const recoveryKey = new TextDecoder().decode(fileContents);
            this.#recoveryKeyRef.current.setValue(recoveryKey);
        }
    }

    async #initAccountRecovery(){
        this.#errorMessageRender.resetErrorMessages();
        if ( this.#isUsernameValid() && this.#isRecoveryKeyValid() ){
            try{
                this.setState((prev) => ({ ...prev, loading: true }));
                const recoveryKey = this.#recoveryKeyRef.current.getValue(), username = this.#usernameRef.current.getValue();
                const userRecoverySession = await new UserService().initAccountRecovery(username, recoveryKey);
                if ( typeof this.props.onUserRecoverySessionInitialized === 'function' ){
                    this.props.onUserRecoverySessionInitialized(userRecoverySession);
                }
            }catch(ex){
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
                <p className={styles.label}>{t('accountRecoveryInitStep.loader.label')}</p>
            </div>
        );
    }

    #renderForm(){
        const { t } = this.props;
        return (
            <form onSubmit={this._handleSubmit} autoComplete={'off'}>
                <div className={styles.fieldSet}>
                    <div className={styles.field}>
                        <TextField type={'text'} name={'username'} label={t('accountRecoveryInitStep.label.username')} ref={this.#usernameRef} />
                    </div>
                    <div className={styles.field}>
                        <div className={styles.recoveryKeyInput}>
                            <div className={styles.dropZone} ref={this.#dropZoneRef} onDrop={this._handleDropZoneDrop} onDragOver={(event) => event.preventDefault()}>
                                <div className={styles.inputWrapper}>
                                    <TextField name={'recovery_key'} useTextarea={true} label={t('accountRecoveryInitStep.label.recoveryKey')} ref={this.#recoveryKeyRef} />
                                    <input type={'file'} ref={this.#fileInputRef} onChange={this._handleFileSelected} />
                                </div>
                                <div className={styles.target + ' border-primary'}>
                                    <p className={'text-primary'}>{t('accountRecoveryInitStep.dropFile')}</p>
                                </div>
                            </div>
                            <p className={styles.instructions} onClick={this._handleFilePickerOpen}>{t('accountRecoveryInitStep.instructions')}</p>
                        </div>
                    </div>
                    <ErrorViewer ref={this.#errorViewerRef} />
                    <div className={styles.submit}>
                        <input type={'submit'} value={t('accountRecoveryInitStep.label.submit')} />
                    </div>
                </div>
            </form>
        );
    }

    _handleDropZoneDragEnter(event){
        event.preventDefault();
        this.#dropZoneRef.current.setAttribute('data-active', 'true');
    }

    _handleDropZoneDragLeave(event){
        event.preventDefault();
        this.#dropZoneRef.current.setAttribute('data-active', 'false');
    }

    _handleDropZoneDrop(event){
        event.preventDefault();
        this.#dropZoneRef.current.setAttribute('data-active', 'false');
        if ( event.dataTransfer.files.length > 0 ){
            this.#processRecoveryKeyFile(event.dataTransfer.files[0]);
        }
    }

    _handleFileSelected(event){
        if ( event.target.files.length > 0 ){
            this.#processRecoveryKeyFile(event.target.files[0]);
        }
    }

    _handleFilePickerOpen(){
        this.#fileInputRef.current.click();
    }

    _handleSubmit(event){
        event.preventDefault();
        event.stopPropagation();
        this.#initAccountRecovery();
    }

    constructor(props){
        super(props);

        this._handleDropZoneDragEnter = this._handleDropZoneDragEnter.bind(this);
        this._handleDropZoneDragLeave = this._handleDropZoneDragLeave.bind(this);
        this._handleFilePickerOpen = this._handleFilePickerOpen.bind(this);
        this._handleDropZoneDrop = this._handleDropZoneDrop.bind(this);
        this._handleFileSelected = this._handleFileSelected.bind(this);
        this._handleSubmit = this._handleSubmit.bind(this);
        this.state = { loading: false };
    }

    componentDidMount(){
        this.#errorMessageRender.setDefaultErrorMessage(this.props.t('accountRecoverForm.error.generic'));
        window.addEventListener('dragenter', this._handleDropZoneDragEnter.bind(this));
        window.addEventListener('dragleave', this._handleDropZoneDragLeave.bind(this));
        window.addEventListener('dragover', this._handleDropZoneDragEnter.bind(this));
        this.#errorMessageRender.setDefaultErrorViewerRef(this.#errorViewerRef);
        this.#errorMessageRender.setExceptionMapping({
            NotFoundException: this.props.t('accountRecoveryInitStep.error.userNotFound'),
            UnauthorizedException: this.props.t('accountRecoveryInitStep.error.unauthorized')
        }).setFieldMapping({
            recovery_key: this.#recoveryKeyRef,
            username: this.#usernameRef
        });
    }

    render(){
        return (
            <div className={styles.accountRecoveryInitStep}>
                <div className={styles.container} data-active={this.state.loading}>{this.#renderLoadingView()}</div>
                <div className={styles.container} data-active={!this.state.loading}>{this.#renderForm()}</div>
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(AccountRecoveryInitStep);
