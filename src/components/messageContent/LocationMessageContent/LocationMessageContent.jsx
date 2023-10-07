'use strict';

import MessageLocation from '../../../DTOs/MessageLocation';
import styles from './LocationMessageContent.scss';
import { withTranslation } from 'react-i18next';
import MessageContent from '../MessageContent';
import Maps from '../../../facades/Maps';
import React from 'react';

class LocationMessageContent extends MessageContent {
    #mapContainerRef = React.createRef();

    _handleRetryClick(){
        this.setState((prev) => ({ ...prev, mapStatus: null }), () => {
            return this.fetchAttachments();
        });
    }

    constructor(props){
        super(props);

        this._handleRetryClick = this._handleRetryClick.bind(this);
        this.state = { mapStatus: null };
    }

    async fetchAttachments(){
        if ( this.state.mapStatus === null ){
            try{
                this.setState((prev) => ({ ...prev, mapStatus: 'loading' }));
                this.#mapContainerRef.current.innerHTML = '';
                const messageLocation = MessageLocation.makeFromSerializedLocation(this.props.message.getContent());
                const coords = [messageLocation.getLatitude(), messageLocation.getLongitude()];
                Maps.generate(this.#mapContainerRef.current, coords, 15, true);
                this.setState((prev) => ({ ...prev, mapStatus: 'loaded' }));
            }catch(ex){
                this.setState((prev) => ({ ...prev, mapStatus: 'error' }));
                console.error(ex);
            }
        }
    }

    render(){
        const { t } = this.props;
        return (
            <div className={styles.locationMessageContent}>
                <div className={styles.contentWrapper} data-show={this.state.mapStatus === 'loading'}>
                    <div className={styles.mapLoader}>
                        <div className={styles.loaderImg + ' loader-img'} />
                        <p className={styles.label}>{t('locationMessageContent.loaderLabel')}</p>
                    </div>
                </div>
                <div className={styles.contentWrapper} data-show={this.state.mapStatus === 'error'}>
                    <div className={styles.errorMessage}>
                        <p className={styles.label + ' text-danger'}>{t('locationMessageContent.errorLabel')}</p>
                        <button className={'button-min danger'} onClick={this._handleRetryClick}>{t('locationMessageContent.retryButtonLabel')}</button>
                    </div>
                </div>
                <div className={styles.contentWrapper} data-show={this.state.mapStatus === 'loaded'}>
                    <div className={styles.mapContainer} ref={this.#mapContainerRef} />
                </div>
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(LocationMessageContent);
