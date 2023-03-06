'use strict';

import styles from './App.scss';
import React from 'react';
import AuthView from '../AuthView/AuthView';

class App extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            view: 'auth'
        };
    }

    render(){
        return (
            <main>
                <AuthView style={{ display: ( this.state.view === 'auth' ) }} />
            </main>
        );
    }
}

export default App;
