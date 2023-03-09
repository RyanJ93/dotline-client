'use strict';

import UnauthorizedException from '../../exceptions/UnauthorizedException';
import NotFoundException from '../../exceptions/NotFoundException';
import { default as AppFacade } from '../../facades/App';
import UserService from '../../services/UserService';
import LoadingView from '../LoadingView/LoadingView';
import AuthView from '../AuthView/AuthView';
import MainView from '../MainView/MainView';
import styles from './App.scss';
import React from 'react';

class App extends React.Component {
    async #handleUserInfoException(ex){
        if ( ex instanceof UnauthorizedException || ex instanceof NotFoundException ){
            return this.setView('auth');
        }
        console.error(ex);
        // handle
    }

    async #fetchUserInfo(){
        await AppFacade.loadAuthenticatedUserRSAKeys();
        const userService = new UserService();
        if ( !AppFacade.isUserAuthenticated() ){
            // logout
            return this.setView('auth');
        }
        try{
            await userService.getUserInfo();
            this.setView('main');
        }catch(ex){
            await this.#handleUserInfoException(ex);
        }
    }

    #initialized = false;

    constructor(props){
        super(props);

        this.state = { view: 'loading' };
    }

    componentDidMount(){
        if ( this.#initialized === false ){
            this.#initialized = true;
            this.#fetchUserInfo();
        }
    }

    setView(view){
        this.setState((prev) => { return { ...prev, view: view } });
        return this;
    }

    render(){
        return (
            <main className={styles.app}>
                <div className={styles.view} data-active={this.state.view === 'loading'}>
                    <LoadingView />
                </div>
                <div className={styles.view} data-active={this.state.view === 'auth'}>
                    <AuthView />
                </div>
                <div className={styles.view} data-active={this.state.view === 'main'}>
                    <MainView />
                </div>
            </main>
        );
    }
}

export default App;
