'use strict';

import StickerPlaceholder from '../../../DTOs/StickerPlaceholder';
import StickerService from '../../../services/StickerService';
import styles from './StickerMessageContent.scss';
import { withTranslation } from 'react-i18next';
import MessageContent from '../MessageContent';
import Sticker from '../../../DTOs/Sticker';
import React from 'react';

class StickerMessageContent extends MessageContent {
    #renderSticker(){
        let renderedSticker, emoji = this.state.stickerPlaceholder.getEmoji(), { t } = this.props;
        if ( this.state.sticker instanceof Sticker ){
            const contentURL = this.state.sticker.getContentURL();
            if ( this.state.sticker.getAnimated() ){
                renderedSticker = <video className={styles.stickerContent} src={contentURL} autoPlay={true} controls={false} loop={true} title={emoji} />
            }else{
                renderedSticker = <div className={styles.stickerContent} style={{ backgroundImage: 'url(' + contentURL + ')' }} title={emoji} />
            }
        }else{
            const label = this.state.loading ? t('stickerMessageContent.loading') : t('stickerMessageContent.fallback');
            renderedSticker = (
                <React.Fragment>
                    <p className={styles.emoji}>{emoji}</p>
                    <p className={styles.serviceLabel}>{label}</p>
                </React.Fragment>
            );
        }
        return renderedSticker;
    }

    constructor(props){
        super(props);

        const stickerPlaceholder = StickerPlaceholder.makeFromSerializedSticker(props.message.getContent());
        this.state = { sticker: null, stickerPlaceholder: stickerPlaceholder, loading: true };
    }

    async fetchAttachments(){
        const sticker = await new StickerService().assertStickerFromPlaceholder(this.state.stickerPlaceholder);
        this.setState((prev) => ({ ...prev, sticker: sticker, loading: false }));
    }

    render(){
        return (
            <div className={styles.stickerMessageContent}>{this.#renderSticker()}</div>
        );
    }
}

export default withTranslation(null, { withRef: true })(StickerMessageContent);