'use strict';

import ServiceNotAvailableException from '../../exceptions/ServiceNotAvailableException';
import RequirementsErrorView from '../RequirementsErrorView/RequirementsErrorView';
import UnauthorizedException from '../../exceptions/UnauthorizedException';
import MessageBoxManager from '../MessageBoxManager/MessageBoxManager';
import RequirementsChecker from '../../support/RequirementsChecker';
import StickerPackService from '../../services/StickerPackService';
import NotFoundException from '../../exceptions/NotFoundException';
import ServerInfoService from '../../services/ServerInfoService';
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
    #requirementsErrorViewRef = React.createRef();
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

    async #checkRequirements(){
        let unmetRequirements = null;
        try{
            const serverInfoService = new ServerInfoService();
            await serverInfoService.fetchServerInfo();
            if ( !RequirementsChecker.isServerSupported(serverInfoService.getServerVersion()) ){
                unmetRequirements = 'server-version';
            }
            if ( !RequirementsChecker.isBrowserSupported() ){
                unmetRequirements = 'browser';
            }
        }catch(ex){
            if ( ex instanceof ServiceNotAvailableException ){
                unmetRequirements = 'network';
            }else{
                throw ex;
            }
        }finally{
            if ( unmetRequirements !== null ){
                this.setState((prev) => {
                    return { ...prev, view: 'requirements-error', unmetRequirements: unmetRequirements };
                });
            }
        }
        return unmetRequirements === null;
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

    async #initialize(){
        const areRequirementsMet = await this.#checkRequirements();
        if ( areRequirementsMet ){
            await Promise.all([
                new StickerPackService().fetchStickerPacks(),
                this.#fetchUserInfo()
            ]);
        }
    }

    async _handleAuthenticationSuccessful(){
        await new LocalDataService().ensureLocalData();
        this.#mainViewRef.current.resetView();
        this.setView('main');
    }

    async _handleError(event){
        const error = event.error ?? event.reason;
        if ( typeof error !== 'undefined' ){
            if ( error instanceof UnauthorizedException ){
                await new LocalDataService().dropLocalData();
                return this.setView('auth');
            }
            MessageBox.reportError(error);
            console.error(error);
        }
    }

    constructor(props){
        super(props);

        this._handleAuthenticationSuccessful = this._handleAuthenticationSuccessful.bind(this);
        this._handleError = this._handleError.bind(this);

        this.state = { view: 'loading', unmetRequirements: null };
    }

    componentDidMount(){
        if ( this.#initialized === false ){
            Event.getBroker().on('localDataImported', () => {
                this.#mainViewRef.current.resetView();
                this.setView('main');
            });
            Event.getBroker().on('localDataCleared', () => {
                if ( this.#currentView !== 'auth' ){
                    this.setView('loading');
                }
            });
            Event.getBroker().on('logout', () => {
                this.#authViewRef.current.resetView();
                this.setView('auth');
            });
            window.onunhandledrejection = this._handleError;
            window.onerror = this._handleError;
            this.#initialized = true;
            this.#initialize();
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
                <div className={styles.headerSpacer + ' bg-blue'} />
                <div className={styles.view} data-active={this.state.view === 'requirements-error'}>
                    <RequirementsErrorView ref={this.#requirementsErrorViewRef} unmetRequirements={this.state.unmetRequirements} />
                </div>
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
