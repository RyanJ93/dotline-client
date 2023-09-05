'use strict';

import IllegalArgumentException from '../../exceptions/IllegalArgumentException';
import UserRecoveryParams from '../../DTOs/UserRecoveryParams';
import styles from './UserRecoveryParamsViewer.scss';
import { withTranslation } from 'react-i18next';
import Event from '../../facades/Event';
import React from 'react';

class UserRecoveryParamsViewer extends React.Component {
    #closeButtonRef = React.createRef();
    #textareaRef = React.createRef();

    _handleDownloadRecoveryKey(){
        const content = this.#textareaRef.current.value, element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', 'Recovery key.txt');
        this.#closeButtonRef.current.disabled = false;
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    _handleCopyRecoveryKey(){
        const content = this.#textareaRef.current.value;
        this.#closeButtonRef.current.disabled = false;
        navigator.clipboard.writeText(content);
        this.#textareaRef.current.select();
    }

    _handleTextAreaClick(){
        this.#textareaRef.current.select();
    }

    _handleCloseClick(){
        this.setState((prev) => ({ ...prev, userRecoveryParams: null }));
    }

    constructor(props){
        super(props);

        this._handleDownloadRecoveryKey = this._handleDownloadRecoveryKey.bind(this);
        this._handleCopyRecoveryKey = this._handleCopyRecoveryKey.bind(this);
        this._handleTextAreaClick = this._handleTextAreaClick.bind(this);
        this._handleCloseClick = this._handleCloseClick.bind(this);
        this.state = { userRecoveryParams: null };
    }

    componentDidMount(){
        Event.getBroker().on('recoveryKeyRegenerated', (userRecoveryParams) => {
            this.setUserRecoveryParams(userRecoveryParams);
        });
    }

    setUserRecoveryParams(userRecoveryParams){
        if ( !( userRecoveryParams instanceof UserRecoveryParams ) ){
            throw new IllegalArgumentException('Invalid user recovery parameters.');
        }
        this.setState((prev) => ({ ...prev, userRecoveryParams: userRecoveryParams }));
        this.#closeButtonRef.current.disabled = true;
        return this;
    }

    getUserRecoveryParams(){
        return this.state.userRecoveryParams;
    }

    render(){
        const exportedRecoveryKey = this.state.userRecoveryParams?.getRecoveryKey() ?? '';
        const { t } = this.props;
        return (
            <div className={styles.userRecoveryParamsViewer} data-active={exportedRecoveryKey !== ''}>
                <div className={styles.overlay} />
                <div className={styles.dialog + ' bg-primary text-primary'}>
                    <p className={styles.title}>{t('userRecoveryParamsViewer.title')}</p>
                    <p>{t('userRecoveryParamsViewer.subtitle')}</p>
                    <textarea ref={this.#textareaRef} onClick={this._handleTextAreaClick} className={styles.recoveryKey} readOnly={true} onChange={() => {}} value={exportedRecoveryKey}></textarea>
                    <p className={styles.warning + ' text-danger'}>{t('userRecoveryParamsViewer.warning')}</p>
                    <div className={styles.controls}>
                        <div className={styles.storingControls}>
                            <button onClick={this._handleCopyRecoveryKey} title={t('userRecoveryParamsViewer.copyLabel')}>{t('userRecoveryParamsViewer.copyLabel')}</button>
                            <button onClick={this._handleDownloadRecoveryKey} title={t('userRecoveryParamsViewer.downloadLabel')}>{t('userRecoveryParamsViewer.downloadLabel')}</button>
                        </div>
                        <div className={styles.closingControls}>
                            <button className={'bg-success text-white'} ref={this.#closeButtonRef} onClick={this._handleCloseClick} title={t('userRecoveryParamsViewer.closeLabel')}>{t('userRecoveryParamsViewer.closeLabel')}</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(UserRecoveryParamsViewer);
