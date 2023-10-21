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

    #getClassesByType(){
        switch ( this.props.type ){
            case 'success': {
                return 'border-success text-success';
            }
            case 'error': {
                return 'border-danger text-danger';
            }
            case 'warn': {
                return 'border-warn text-warn';
            }
        }
        return 'text-primary';
    }

    _handleConfirm(){
        this.hide(true);
    }

    _handleClose(){
        this.hide(this.props.type === 'confirm' ? false : null);
    }

    _handleKeydown(event){
        if ( event.key === 'Escape' ){
            this.hide(this.props.type === 'confirm' ? false : null);
        }
    }

    constructor(props){
        super(props);

        this._handleKeydown = this._handleKeydown.bind(this);
        this._handleConfirm = this._handleConfirm.bind(this);
        this._handleClose = this._handleClose.bind(this);
        this.state = { active: true };
    }

    componentDidMount(){
        window.addEventListener('keydown', this._handleKeydown);
    }

    hide(result){
        window.removeEventListener('keydown', this._handleKeydown);
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
        const classes = this.#getClassesByType(), withBorder = classes.indexOf('border') >= 0;
        const noTitle = this.props.title === '' || typeof this.props.title !== 'string';
        return (
            <div className={styles.messageBox + ' ' + classes} data-message-box-type={this.props.type} data-active={this.state.active}>
                <div className={styles.dialog + ' bg-primary'} data-with-border={withBorder}>
                    <p className={styles.title}>{this.props.title}</p>
                    <p className={styles.text} data-no-title={noTitle}>{this.props.text}</p>
                    {this.#renderControls()}
                </div>
                <div className={styles.overlay} onClick={this._handleClose} />
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(MessageBox);
