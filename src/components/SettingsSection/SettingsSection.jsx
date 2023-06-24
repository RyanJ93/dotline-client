'use strict';

import PasswordChangeSettingsSection from '../settingSections/PasswordChangeSettingsSection/PasswordChangeSettingsSection';
import BasicInfoSettingsSection from '../settingSections/BasicInfoSettingsSection/BasicInfoSettingsSection';
import ControlsSettingsSection from '../settingSections/ControlsSettingsSection/ControlsSettingsSection';
import UserSettingsSection from '../settingSections/UserSettingsSection/UserSettingsSection';
import styles from './SettingsSection.scss';
import Event from '../../facades/Event';
import React from 'react';

class SettingsSection extends React.Component {
    _handleUserAuthenticated(user){
        this.setState((prev) => ({ ...prev, user: user }));
    }

    constructor(props){
        super(props);

        this._handleUserAuthenticated = this._handleUserAuthenticated.bind(this);
        this.state = { user: null };
    }

    componentDidMount(){
        Event.getBroker().on('userAuthenticated', this._handleUserAuthenticated);
    }

    render(){
        return (
            <div className={styles.settingsSection}>
                <div className={styles.section}>
                    <BasicInfoSettingsSection />
                </div>
                <div className={styles.section}>
                    <PasswordChangeSettingsSection />
                </div>
                <div className={styles.section}>
                    <UserSettingsSection />
                </div>
                <div className={styles.section}>
                    <ControlsSettingsSection />
                </div>
            </div>
        );
    }
}

export default SettingsSection;
