'use strict';

import IllegalArgumentException from '../../exceptions/IllegalArgumentException';
import styles from './ErrorViewer.scss';
import React from 'react';

class ErrorViewer extends React.Component {
    #renderErrorMessage(){
        return this.state.errorMessage === null ? null : (
            <p className={styles.errorMessage + ' text-danger'}>{this.state.errorMessage}</p>
        );
    }

    constructor(props){
        super(props);

        this.state = { errorMessage: null };
    }

    setErrorMessage(errorMessage){
        if ( errorMessage !== null && typeof errorMessage !== 'string' ){
            throw new IllegalArgumentException('Invalid error message.');
        }
        this.setState((prev) => ({ ...prev, errorMessage: errorMessage }));
        return this;
    }

    getErrorMessage(){
        return this.state.errorMessage;
    }

    render(){
        return <div className={styles.errorViewer}>{this.#renderErrorMessage()}</div>;
    }
}

export default ErrorViewer;
