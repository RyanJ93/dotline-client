'use strict';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DateUtils from '../../utils/DateUtils';
import styles from './UserSessionViewer.scss';
import App from '../../facades/App';
import React from 'react';

class UserSessionViewer extends React.Component {
    #renderDetailsBox(){
        let map = null;
        if ( this.props.userSession.getLocation() !== null ){
            map = <iframe className={styles.map} src={this.props.userSession.getLocation().getComputedOSMIframeURL()}></iframe>;
        }
        return (
            <div className={styles.detailsBox} data-active={this.state.detailsBoxActive} onClick={this._handleDetailsBoxOpen}>
                <p className={styles.title}>Details</p>
                <div className={styles.table}>
                    <div className={styles.row}>
                        <p>Browser name:</p>
                        <p className={styles.value}>{this.props.userSession.getBrowserName() ?? '-'}</p>
                    </div>
                    <div className={styles.row}>
                        <p>OS name:</p>
                        <p className={styles.value}>{this.props.userSession.getOSName() ?? '-'}</p>
                    </div>
                    <div className={styles.row}>
                        <p>Location:</p>
                        <p className={styles.value}>{this.props.userSession.getLocation()?.getText() ?? '-'}</p>
                    </div>
                    <div className={styles.row}>
                        <p>IP Address:</p>
                        <p className={styles.value}>{this.props.userSession.getIP()}</p>
                    </div>
                    <div className={styles.row}>
                        <p>First access:</p>
                        <p className={styles.value}>{DateUtils.getLocalizedDateTime(this.props.userSession.getFirstAccess(), false)}</p>
                    </div>
                    <div className={styles.row}>
                        <p>Last access:</p>
                        <p className={styles.value}>{DateUtils.getLocalizedDateTime(this.props.userSession.getLastAccess(), false)}</p>
                    </div>
                </div>
                {map}
                <div className={styles.closeLinkWrapper}>
                    <a onClick={this._handleDetailsBoxClose}>Close</a>
                </div>
            </div>
        );
    }

    #renderControls(){
        const isCurrentSession = this.props.userSession.getAccessToken() === App.getAccessToken();
        return isCurrentSession ? null : (
            <div className={styles.controls}>
                <div className={styles.deleteButton} onClick={this._handleDelete}>
                    <FontAwesomeIcon icon='fa-solid fa-trash' />
                </div>
            </div>
        );
    }

    _handleDetailsBoxClose(){
        this.setState((prev) => ({ ...prev, detailsBoxActive: false }));
    }

    _handleDetailsBoxOpen(){
        if ( this.state.detailsBoxActive !== true ){
            this.setState((prev) => ({ ...prev, detailsBoxActive: true }));
        }
    }

    _handleDelete(event){
        const accessToken = event.target.closest('div[data-access-token]').getAttribute('data-access-token');
        if ( typeof this.props.onDelete === 'function' ){
            this.props.onDelete(accessToken);
        }
    }

    constructor(props){
        super(props);

        this._handleDetailsBoxClose = this._handleDetailsBoxClose.bind(this);
        this._handleDetailsBoxOpen = this._handleDetailsBoxOpen.bind(this);
        this._handleDelete = this._handleDelete.bind(this);
        this.state = { detailsBoxActive: false };
    }

    render(){
        let location = null;
        if ( this.props.userSession.getLocation() !== null ){
            location = <p className={styles.location}>{this.props.userSession.getLocation().getText()}</p>;
        }
        return (
            <div className={styles.userSessionViewer} data-access-token={this.props.userSession.getAccessToken()}>
                <div className={styles.main}>
                    <div className={styles.review}>
                        <p className={styles.deviceName}>{this.props.userSession.getBrowserName()}</p>
                        {location}
                    </div>
                    {this.#renderControls()}
                </div>
                {this.#renderDetailsBox()}
            </div>
        );
    }
}

export default UserSessionViewer;
