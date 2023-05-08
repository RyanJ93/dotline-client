'use strict';

import UserSessionViewer from '../UserSessionViewer/UserSessionViewer';
import AccessTokenService from '../../services/AccessTokenService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './UserSessionsSection.scss';
import Event from '../../facades/Event';
import App from '../../facades/App';
import React from 'react';

class UserSessionsSection extends React.Component {
    #getCurrentUserSession(){
        let currentAccessToken = App.getAccessToken(), i = 0, currentUserSession = null;
        while ( currentUserSession === null && i < this.state.userSessionList.length ){
            if ( this.state.userSessionList[i].getAccessToken() === currentAccessToken ){
                currentUserSession = this.state.userSessionList[i];
            }
            i++;
        }
        return currentUserSession;
    }

    #renderCurrentSessionDetails(currentUserSession){
        return currentUserSession === null ? null : (
            <div className={styles.currentSession}>
                <div className={styles.header}>
                    <div className={styles.currentSessionTitleWrapper}>
                        <p className={styles.currentSessionTitle}>Current session</p>
                    </div>
                    <div className={styles.currentSessionControlsWrapper} onClick={this._handleUserSessionsRefresh}>
                        <FontAwesomeIcon icon='fa-solid fa-rotate-right' />
                    </div>
                </div>
                <UserSessionViewer userSession={currentUserSession} />
                <div className={styles.closeAllWrapper}>
                    <button onClick={this._handleDeleteAll} className={'danger'}>Close all other sessions</button>
                </div>
            </div>
        );
    }

    #renderUserSessionList(){
        const currentAccessToken = App.getAccessToken(), renderedUserSessionList = [];
        this.state.userSessionList.forEach((userSession, index) => {
            if ( userSession.getAccessToken() !== currentAccessToken ){
                renderedUserSessionList.push(
                    <li key={index}>
                        <UserSessionViewer userSession={userSession} onDelete={this._handleDelete} />
                    </li>
                );
            }
        });
        return <ul className={styles.list}>{renderedUserSessionList}</ul>;
    }

    async #deleteAccessToken(accessToken){
        const userSessionList = this.state.userSessionList.filter((userSession) => {
            return userSession.getAccessToken() !== accessToken;
        });
        this.setState((prev) => ({ ...prev, userSessionList: userSessionList }));
        await new AccessTokenService().deleteAccessToken(accessToken);
    }

    async #deleteAllAccessTokens(){
        const userSessionList = this.state.userSessionList.filter((userSession) => {
            return userSession.getAccessToken() === App.getAccessToken();
        });
        this.setState((prev) => ({ ...prev, userSessionList: userSessionList }));
        await new AccessTokenService().deleteAllAccessTokens();
    }

    _handleUserSessionsRefresh(){
        this.loadUserSessions();
    }

    _handleUserAuthenticated(){
        this.loadUserSessions();
    }

    _handleDelete(accessToken){
        this.#deleteAccessToken(accessToken);
    }

    _handleDeleteAll(){
        this.#deleteAllAccessTokens();
    }

    constructor(props){
        super(props);

        this._handleUserSessionsRefresh = this._handleUserSessionsRefresh.bind(this);
        this._handleUserAuthenticated = this._handleUserAuthenticated.bind(this);
        this._handleDeleteAll = this._handleDeleteAll.bind(this);
        this._handleDelete = this._handleDelete.bind(this);
        this.state = { userSessionList: [] };
    }

    componentDidMount(){
        Event.getBroker().on('userAuthenticated', this._handleUserAuthenticated);
    }

    async loadUserSessions(){
        const userSessionList = await new AccessTokenService().fetchUserSessions();
        userSessionList.sort((a, b) => b.getLastAccess() - a.getLastAccess());
        this.setState((prev) => ({ ...prev, userSessionList: userSessionList }));
    }

    render(){
        return (
            <div className={styles.userSessionsSection}>
                {this.#renderCurrentSessionDetails(this.#getCurrentUserSession())}
                {this.#renderUserSessionList()}
            </div>
        );
    }
}

export default UserSessionsSection;
