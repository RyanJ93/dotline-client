'use strict';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './RequirementsErrorView.scss';
import { withTranslation } from 'react-i18next';
import Footer from '../Footer/Footer';
import React from 'react';

class RequirementsErrorView extends React.Component {
    #renderServerVersionMessage(){
        const { t } = this.props;
        return (
            <div>
                <FontAwesomeIcon icon='fa-solid fa-triangle-exclamation' />
                <p className={styles.title}>{t('requirementsErrorView.serverError.title')}</p>
                <p className={styles.text}>{t('requirementsErrorView.serverError.text1')}</p>
                <p className={styles.text}>{t('requirementsErrorView.serverError.text2')}</p>
                <button className={styles.button} onClick={this._handlePageReloadButtonClick}>{t('requirementsErrorView.serverError.reloadButton')}</button>
            </div>
        );
    }

    #renderNetworkMessage(){
        const { t } = this.props;
        return (
            <div>
                <FontAwesomeIcon icon='fa-solid fa-triangle-exclamation' />
                <p className={styles.title}>{t('requirementsErrorView.networkError.title')}</p>
                <p className={styles.text}>{t('requirementsErrorView.networkError.text1')}</p>
                <p className={styles.text}>{t('requirementsErrorView.networkError.text2')}</p>
                <button className={styles.button} onClick={this._handlePageReloadButtonClick}>{t('requirementsErrorView.networkError.reloadButton')}</button>
            </div>
        );
    }

    #renderBrowserMessage(){
        const { t } = this.props;
        return (
            <div>
                <FontAwesomeIcon icon='fa-solid fa-triangle-exclamation' />
                <p className={styles.title}>{t('requirementsErrorView.clientError.title')}</p>
                <p className={styles.text}>{t('requirementsErrorView.clientError.text')}</p>
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
            <div className={styles.requirementsErrorView + ' bg-primary'}>
                <div className={styles.container}>
                    {this.#renderRequirementsMessage()}
                </div>
                <Footer />
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(RequirementsErrorView);
