'use strict';

import AccountRecoveryFinalizationStep from '../accountRecoverySteps/AccountRecoveryFinalizationStep/AccountRecoveryFinalizationStep';
import AccountRecoveryCompleteStep from '../accountRecoverySteps/AccountRecoveryCompleteStep/AccountRecoveryCompleteStep';
import AccountRecoveryInitStep from '../accountRecoverySteps/AccountRecoveryInitStep/AccountRecoveryInitStep';
import { withTranslation } from 'react-i18next';
import styles from './AccountRecoverForm.scss';
import React from 'react';

class AccountRecoverForm extends React.Component {
    #accountRecoveryFinalizationStepRef = React.createRef();
    #accountRecoveryCompleteStepRef = React.createRef();
    #accountRecoveryInitStepRef = React.createRef();

    _handleUserRecoverySessionInitialized(userRecoverySession){
        this.#accountRecoveryFinalizationStepRef.current.setUserRecoverySession(userRecoverySession);
        this.setState((prev) => ({ ...prev, userRecoverySession: userRecoverySession, recoveryStep: 'finalize' }));
    }

    _handleAccountRecoveryCompleted(){
        this.setState((prev) => ({ ...prev, userRecoverySession: null, recoveryStep: 'complete' }));
        this.#accountRecoveryFinalizationStepRef.current.setUserRecoverySession(null);
        if ( typeof this.props.onAccountRecovered === 'function' ){
            window.setTimeout(() => this.props.onAccountRecovered(), 2000);
        }
    }

    _handleUnauthorized(){
        this.setState((prev) => ({ ...prev, userRecoverySession: null, recoveryStep: 'init' }));
        this.#accountRecoveryFinalizationStepRef.current.setUserRecoverySession(null);
    }

    constructor(props){
        super(props);

        this.state = { userRecoverySession: null, recoveryStep: 'init', genericErrorMessageList: [] };
        this._handleUserRecoverySessionInitialized = this._handleUserRecoverySessionInitialized.bind(this);
        this._handleAccountRecoveryCompleted = this._handleAccountRecoveryCompleted.bind(this);
        this._handleUnauthorized = this._handleUnauthorized.bind(this);
    }

    render(){
        return (
            <div className={styles.accountRecoverForm}>
                <div className={styles.recoveryStep} data-active={this.state.recoveryStep === 'init'}>
                    <AccountRecoveryInitStep ref={this.#accountRecoveryInitStepRef} onUserRecoverySessionInitialized={this._handleUserRecoverySessionInitialized} />
                </div>
                <div className={styles.recoveryStep} data-active={this.state.recoveryStep === 'finalize'}>
                    <AccountRecoveryFinalizationStep ref={this.#accountRecoveryFinalizationStepRef} onAccountRecoveryCompleted={this._handleAccountRecoveryCompleted} onUnauthorized={this._handleUnauthorized} />
                </div>
                <div className={styles.recoveryStep} data-active={this.state.recoveryStep === 'complete'}>
                    <AccountRecoveryCompleteStep ref={this.#accountRecoveryCompleteStepRef} />
                </div>
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(AccountRecoverForm);
