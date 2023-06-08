'use strict';

import UnauthorizedException from '../../exceptions/UnauthorizedException';
import MessageBoxManager from '../MessageBoxManager/MessageBoxManager';
import NotFoundException from '../../exceptions/NotFoundException';
import LocalDataService from '../../services/LocalDataService';
import { default as AppFacade } from '../../facades/App';
import LoadingView from '../LoadingView/LoadingView';
import UserService from '../../services/UserService';
import MessageBox from '../../facades/MessageBox';
import AuthView from '../AuthView/AuthView';
import MainView from '../MainView/MainView';
import Event from '../../facades/Event';
import styles from './App.scss';
import React from 'react';

class App extends React.Component {
    #messageBoxManagerRef = React.createRef();
    #loadingViewRef = React.createRef();
    #authViewRef = React.createRef();
    #mainViewRef = React.createRef();
    #currentView = 'loading';
    #initialized = false;

    async #handleUserInfoException(ex){
        if ( ex instanceof UnauthorizedException || ex instanceof NotFoundException ){
            await new LocalDataService().dropLocalData();
            return this.setView('auth');
        }
        MessageBox.reportError(ex);
        console.error(ex);
    }

    async #fetchUserInfo(){
        try{
            await AppFacade.loadAuthenticatedUserRSAKeys();
            if ( !AppFacade.isUserAuthenticated() ){
                await new UserService().logout();
                return this.setView('auth');
            }
            await new LocalDataService().ensureLocalData();
        }catch(ex){
            await this.#handleUserInfoException(ex);
        }
    }

    _handleAuthenticationSuccessful(){
        this.#mainViewRef.current.resetView();
        this.setView('main');
    }

    _handleLocalDataImported(){
        this.#mainViewRef.current.resetView();
        this.setView('main');
    }

    _handleLocalDataCleared(){
        if ( this.#currentView !== 'auth' ){
            this.setView('loading');
        }
    }

    _handleLogOut(){
        this.#authViewRef.current.resetView();
        this.setView('auth');
    }

    _handleError(event){
        const error = event.error ?? event.reason;
        MessageBox.reportError(error);
        console.error(error);
    }

    constructor(props){
        super(props);

        this._handleAuthenticationSuccessful = this._handleAuthenticationSuccessful.bind(this);
        this._handleLocalDataImported = this._handleLocalDataImported.bind(this);
        this._handleLocalDataCleared = this._handleLocalDataCleared.bind(this);
        this._handleLogOut = this._handleLogOut.bind(this);
        this._handleError = this._handleError.bind(this);
        this.state = { view: 'loading' };
    }

    componentDidMount(){
        if ( this.#initialized === false ){
            Event.getBroker().on('localDataImported', this._handleLocalDataImported);
            Event.getBroker().on('localDataCleared', this._handleLocalDataCleared);
            Event.getBroker().on('logout', this._handleLogOut);
            window.onunhandledrejection = this._handleError;
            window.onerror = this._handleError;
            this.#initialized = true;
            this.#fetchUserInfo();
        }
    }

    setView(view){
        this.setState((prev) => { return { ...prev, view: view } });
        this.#currentView = view;
        return this;
    }

    render(){
        return (
            <main className={styles.app}>
                <div className={styles.view} data-active={this.state.view === 'loading'}>
                    <LoadingView ref={this.#loadingViewRef} />
                </div>
                <div className={styles.view} data-active={this.state.view === 'auth'}>
                    <AuthView ref={this.#authViewRef} onAuthenticationSuccessful={this._handleAuthenticationSuccessful} />
                </div>
                <div className={styles.view} data-active={this.state.view === 'main'}>
                    <MainView ref={this.#mainViewRef} />
                </div>
                <MessageBoxManager ref={this.#messageBoxManagerRef} />
            </main>
        );
    }
}

export default App;
