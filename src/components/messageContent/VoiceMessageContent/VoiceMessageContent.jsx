'use strict';

import VoiceMessagePlayer from '../../VoiceMessagePlayer/VoiceMessagePlayer';
import AttachmentService from '../../../services/AttachmentService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withTranslation } from 'react-i18next';
import styles from './VoiceMessageContent.scss';
import MessageContent from '../MessageContent';
import React from 'react';

class VoiceMessageContent extends MessageContent {
    #voiceMessagePlayerRef = React.createRef();
    #voiceMessageFetched = false;

    #renderLoadingView(){
        const attachment = this.props.message.getAttachments()[0], { t } = this.props;
        return (
            <div className={styles.loadingView}>
                <div className={styles.icon + ' bg-accent'}>
                    <FontAwesomeIcon icon='fa-solid fa-download' onClick={this._handleVoiceMessageDownload} />
                </div>
                <div className={styles.info}>
                    { this.state.loadingError === true && <p className={styles.errorLabel + ' text-danger'}>{t('voiceMessageContent.errorLabel')}</p> }
                    { this.state.loadingError === false && <p className={styles.loadingLabel}>{t('voiceMessageContent.downloadingLabel')}</p> }
                    <p className={styles.size}>{attachment.getHumanReadableSize()}</p>
                </div>
            </div>
        )
    }

    _handleVoiceMessageDownload(){
        this.fetchAttachments();
    }

    constructor(props){
        super(props);

        this._handleVoiceMessageDownload = this._handleVoiceMessageDownload.bind(this);
        this.state = { downloadedVoiceMessage: null, loadingError: false };
    }

    async fetchAttachments(){
        if ( this.props.message.getAttachments().length > 0 && !this.#voiceMessageFetched ){
            try{
                this.setState((prev) => ({ ...prev, loadingError: false }));
                const voiceMessage = this.props.message.getAttachments()[0];
                this.#voiceMessageFetched = true;
                const downloadedVoiceMessage = await new AttachmentService(this.props.message).fetchAttachment(voiceMessage);
                this.setState((prev) => ({ ...prev, downloadedVoiceMessage: downloadedVoiceMessage, loadingError: false }));
            }catch(ex){
                this.setState((prev) => ({ ...prev, downloadedVoiceMessage: null, loadingError: true }));
                this.#voiceMessageFetched = false;
                console.error(ex);
            }
        }
    }

    render(){
        const { downloadedVoiceMessage } = this.state;
        return (
            <div className={styles.voiceMessageContent}>
                { downloadedVoiceMessage !== null && <VoiceMessagePlayer ref={this.#voiceMessagePlayerRef} downloadedVoiceMessage={downloadedVoiceMessage} /> }
                { downloadedVoiceMessage === null && this.#renderLoadingView() }
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(VoiceMessageContent);
