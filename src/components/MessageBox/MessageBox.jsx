'use strict';

import { withTranslation } from 'react-i18next';
import styles from './MessageBox.scss';
import React from 'react';

class MessageBox extends React.Component {
    #renderControls(){
        const { t } = this.props;
        if ( this.props.type === 'confirm' ){
            return (
                <div className={styles.controls}>
                    <button onClick={this._handleClose}>{t('messageBox.cancelButton')}</button>
                    <button onClick={this._handleConfirm}>{t('messageBox.confirmButton')}</button>
                </div>
            );
        }
        return (
            <div className={styles.controls}>
                <button onClick={this._handleClose}>{t('messageBox.okButton')}</button>
            </div>
        );
    }

    _handleConfirm(){
        this.hide(true);
    }

    _handleClose(){
        this.hide(this.props.type === 'confirm' ? false : null);
    }

    constructor(props){
        super(props);

        this._handleConfirm = this._handleConfirm.bind(this);
        this._handleClose = this._handleClose.bind(this);
        this.state = { active: true };
    }

    hide(result){
        this.setState((prev) => ({ ...prev, active: false }));
        if ( typeof this.props.onClose === 'function' ){
            this.props.onClose(result);
        }
        window.setTimeout(() => {
            if ( typeof this.props.onCanBeDisposed === 'function' ){
                this.props.onCanBeDisposed(this.props.id);
            }
        }, 300);
        return this;
    }

    render(){
        return (
            <div className={styles.messageBox} data-message-box-type={this.props.type} data-active={this.state.active}>
                <div className={styles.overlay} onClick={this._handleClose} />
                <div className={styles.dialog}>
                    <p className={styles.title}>{this.props.title}</p>
                    <p className={styles.text}>{this.props.text}</p>
                    {this.#renderControls()}
                </div>
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(MessageBox);