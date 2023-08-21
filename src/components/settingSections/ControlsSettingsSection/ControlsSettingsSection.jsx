'use strict';

import LocalDataService from '../../../services/LocalDataService';
import UserService from '../../../services/UserService';
import MessageBox from '../../../facades/MessageBox';
import styles from './ControlsSettingsSection.scss';
import { withTranslation } from 'react-i18next';
import React from 'react';

class ControlsSettingsSection extends React.Component {
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

    _handleClearLocalData(){
        this.#clearLocalData();
    }

    _handleLogOut(){
        this.#logOut();
    }

    constructor(props){
        super(props);

        this._handleClearLocalData = this._handleClearLocalData.bind(this);
        this._handleLogOut = this._handleLogOut.bind(this);
    }

    render(){
        const { t } = this.props;
        return (
            <div className={styles.section}>
                <div className={styles.content}>
                    <p className={styles.sectionTitle + ' text-primary'}>{t('controlsSettingsSection.title')}</p>
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
