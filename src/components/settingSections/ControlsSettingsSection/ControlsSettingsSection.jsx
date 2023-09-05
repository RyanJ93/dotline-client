'use strict';

import LocalDataService from '../../../services/LocalDataService';
import UserService from '../../../services/UserService';
import MessageBox from '../../../facades/MessageBox';
import styles from './ControlsSettingsSection.scss';
import { withTranslation } from 'react-i18next';
import React from 'react';

class ControlsSettingsSection extends React.Component {
    async #regenerateRecoveryKey(){
        const { t } = this.props, title = t('controlsSettingsSection.regenerateRecoveryKey.confirmText');
        const text = t('controlsSettingsSection.regenerateRecoveryKey.confirmText');
        if ( ( await MessageBox.confirm(text, title) ) ){
            await new UserService().regenerateRecoveryKey();
        }
    }

    async #clearLocalData(){
        const { t } = this.props, title = t('controlsSettingsSection.clearLocalData.confirmTitle');
        const text = t('controlsSettingsSection.clearLocalData.confirmText');
        if ( ( await MessageBox.confirm(text, title) ) ){
            await new LocalDataService().refreshLocalData(true);
        }
    }

    async #logOut(){
        const { t } = this.props, title = t('controlsSettingsSection.logOut.confirmTitle');
        const text = t('controlsSettingsSection.logOut.confirmText');
        if ( ( await MessageBox.confirm(text, title) ) ){
            await new UserService().logout();
        }
    }

    constructor(props){
        super(props);

        this._handleRecoveryKeyRegeneration = () => this.#regenerateRecoveryKey();
        this._handleClearLocalData = () => this.#clearLocalData();
        this._handleLogOut = () => this.#logOut();
    }

    render(){
        const { t } = this.props;
        return (
            <div className={styles.section}>
                <div className={styles.content}>
                    <p className={styles.sectionTitle + ' text-primary'}>{t('controlsSettingsSection.title')}</p>
                    <div className={styles.operation}>
                        <button onClick={this._handleRecoveryKeyRegeneration}>{t('controlsSettingsSection.regenerateRecoveryKey.label')}</button>
                    </div>
                    <div className={styles.operation}>
                        <button onClick={this._handleClearLocalData}>{t('controlsSettingsSection.clearLocalData.label')}</button>
                    </div>
                    <div className={styles.operation}>
                        <button className={'danger'} onClick={this._handleLogOut}>{t('controlsSettingsSection.logOut.label')}</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(ControlsSettingsSection);
