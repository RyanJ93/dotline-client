'use strict';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './RequirementsErrorView.scss';
import Footer from '../Footer/Footer';
import React from 'react';

class RequirementsErrorView extends React.Component {
    #renderServerVersionMessage(){
        return (
            <div>
                <FontAwesomeIcon icon='fa-solid fa-triangle-exclamation' />
                <p className={styles.title}>Outdated client</p>
                <p className={styles.text}>You are using a client that is not updated and then cannot connect to the server which is running a most recent version of the software.</p>
                <p className={styles.text}>Please reload the page or wait for a new client version to be released.</p>
                <button className={styles.button} onClick={this._handlePageReloadButtonClick}>Reload the page</button>
            </div>
        );
    }

    #renderNetworkMessage(){
        return (
            <div>
                <FontAwesomeIcon icon='fa-solid fa-triangle-exclamation' />
                <p className={styles.title}>Server unreachable</p>
                <p className={styles.text}>Cannot connect to the server, check your internet connection and try again.</p>
                <p className={styles.text}>If the issue persists try again later.</p>
                <button className={styles.button} onClick={this._handlePageReloadButtonClick}>Reload the page</button>
            </div>
        );
    }

    #renderBrowserMessage(){
        return (
            <div>
                <FontAwesomeIcon icon='fa-solid fa-triangle-exclamation' />
                <p className={styles.title}>Unsupported browser</p>
                <p className={styles.text}>Your browser does not support all the required technologies. Please switch to a modern and up-to-date browser such as Google Chrome, Firefox or Safari.</p>
            </div>
        );
    }

    #renderRequirementsMessage(){
        let requirementsMessage = null;
        switch ( this.props.unmetRequirements ){
            case 'server-version': {
                requirementsMessage = this.#renderServerVersionMessage();
            }break;
            case 'network': {
                requirementsMessage = this.#renderNetworkMessage();
            }break;
            case 'browser': {
                requirementsMessage = this.#renderBrowserMessage();
            }break;
        }
        return requirementsMessage;
    }

    _handlePageReloadButtonClick(){
        window.location.reload(true);
    }

    constructor(props){
        super(props);

        this._handlePageReloadButtonClick = this._handlePageReloadButtonClick.bind(this);
    }

    render(){
        return (
            <div className={styles.requirementsErrorView}>
                <div className={styles.container}>
                    {this.#renderRequirementsMessage()}
                </div>
                <Footer />
            </div>
        );
    }
}

export default RequirementsErrorView;
