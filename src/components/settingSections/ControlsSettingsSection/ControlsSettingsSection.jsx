'use strict';

import LocalDataService from '../../../services/LocalDataService';
import UserService from '../../../services/UserService';
import MessageBox from '../../../facades/MessageBox';
import styles from './ControlsSettingsSection.scss';
import React from 'react';

class ControlsSettingsSection extends React.Component {
    async #clearLocalData(){
        const text = 'Do you really want to re-import all your local data?';
        const title = 'Action confirmation';
        const isConfirmed = await MessageBox.confirm(text, title);
        if ( isConfirmed ){
            await new LocalDataService().refreshLocalData(true);
        }
    }

    async #logOut(){
        const text = 'Do you really want to log out?';
        const title = 'Action confirmation';
        const isConfirmed = await MessageBox.confirm(text, title);
        if ( isConfirmed ){
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
        return (
            <div className={styles.section}>
                <div className={styles.content}>
                    <p className={styles.sectionTitle}>Operations</p>
                    <div className={styles.operation}>
                        <button onClick={this._handleClearLocalData}>Clear local data</button>
                    </div>
                    <div className={styles.operation}>
                        <button className={'danger'} onClick={this._handleLogOut}>Log out</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default ControlsSettingsSection;
