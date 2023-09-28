'use strict';

import LocationMessageContent from '../messageContent/LocationMessageContent/LocationMessageContent';
import StickerMessageContent from '../messageContent/StickerMessageContent/StickerMessageContent';
import VoiceMessageContent from '../messageContent/VoiceMessageContent/VoiceMessageContent';
import TextMessageContent from '../messageContent/TextMessageContent/TextMessageContent';
import styles from './MessageContentWrapper.scss';
import MessageType from '../../enum/MessageType';
import { withTranslation } from 'react-i18next';
import React from 'react';

class MessageContentWrapper extends React.Component {
    #messageContentRef = React.createRef();

    #renderMessageContent(){
        const { t } = this.props;
        switch ( this.props.message?.getType() ){
            case MessageType.VOICE_MESSAGE: {
                return <VoiceMessageContent message={this.props.message} ref={this.#messageContentRef} />;
            }
            case MessageType.LOCATION: {
                return <LocationMessageContent message={this.props.message} ref={this.#messageContentRef} />;
            }
            case MessageType.STICKER: {
                return <StickerMessageContent message={this.props.message} ref={this.#messageContentRef} />;
            }
            case MessageType.TEXT: {
                return <TextMessageContent message={this.props.message} ref={this.#messageContentRef} />;
            }
            default: {
                return <span className={styles.unsupportedType}>{t('messageContent.unsupportedType')}</span>
            }
        }
    }

    async fetchAttachments(){
        await this.#messageContentRef.current?.fetchAttachments();
    }

    render(){
        return (
            <div className={styles.messageContentWrapper}>
                {this.#renderMessageContent()}
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(MessageContentWrapper);
