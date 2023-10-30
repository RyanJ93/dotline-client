'use strict';

import LinkService from '../../services/LinkService';
import { withTranslation } from 'react-i18next';
import styles from './LinkPreview.scss';
import React from 'react';

class LinkPreview extends React.Component {
    #isPreviewAvailable(){
        const { status, OGProperties } = this.state;
        return status === 'fetched' && OGProperties !== null && OGProperties.getTitle() !== null && OGProperties.getTitle() !== '';
    }

    #renderLinkPreview(){
        if ( this.#isPreviewAvailable() ){
            const description = this.state.OGProperties.getDescription();
            const image = this.state.OGProperties.getImage();
            const title = this.state.OGProperties.getTitle();
            return (
                <a className={styles.link} href={this.state.url} target={'_blank'} rel={'noreferrer'}>
                    <p className={styles.title + ' text-primary'}>{title}</p>
                    { description !== null && description !== '' && <p className={styles.description + ' text-primary'}>{description}</p> }
                    { image !== null && image !== '' && <img className={styles.image} src={image} alt={title} /> }
                </a>
            );
        }
    }

    #renderErrorMessage(){
        const { t } = this.props;
        return (
            <div className={styles.errorMessage}>
                <p className={styles.errorLabel + ' text-danger'}>{t('linkPreview.errorLabel')}</p>
                <button className={'button-min danger'} onClick={this._handleRetryClick}>{t('linkPreview.errorButtonLabel')}</button>
            </div>
        );
    }

    async #fetchLinkOGProperties(){
        try{
            const OGProperties = await new LinkService().fetchLinkOGProperties(this.state.url);
            this.setState((prev) => ({ ...prev, OGProperties: OGProperties, status: 'fetched' }));
        }catch(ex){
            this.setState((prev) => ({ ...prev, OGProperties: null, status: 'error' }));
            console.error(ex);
        }
    }

    _handleRetryClick(){
        this.#fetchLinkOGProperties().catch((ex) => console.error(ex));
    }

    constructor(props){
        super(props);

        this.state = { url: this.props.url, OGProperties: null, status: 'loading' };
        this._handleRetryClick = this._handleRetryClick.bind(this);
    }

    componentDidMount(){
        this.#fetchLinkOGProperties().catch((ex) => console.error(ex));
    }

    render(){
        const display = this.state.status !== 'fetched' || this.#isPreviewAvailable(), { t } = this.props;
        return (
            <div className={styles.linkPreview + ' bg-secondary'} data-display={display}>
                { this.state.status === 'loading' && <p className={styles.loadingLabel}>{t('linkPreview.loadingLabel')}</p> }
                { this.state.status === 'fetched' && this.#renderLinkPreview() }
                { this.state.status === 'error' && this.#renderErrorMessage() }
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(LinkPreview);
