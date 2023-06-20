'use strict';

import StickerPlaceholder from '../../DTOs/StickerPlaceholder';
import StickerService from '../../services/StickerService';
import styles from './StickerMessageContent.scss';
import Sticker from '../../DTOs/Sticker';
import React from 'react';

class StickerMessageContent extends React.Component {
    #renderSticker(){
        let renderedSticker;
        if ( this.state.sticker instanceof Sticker ){
            const contentURL = this.state.sticker.getContentURL();
            if ( this.state.sticker.getAnimated() ){
                renderedSticker = <video className={styles.stickerContent} src={contentURL} autoPlay={true} controls={false} loop={true} />
            }else{
                renderedSticker = <div className={styles.stickerContent} style={{ backgroundImage: 'url(' + contentURL + ')' }} />
            }
        }else{
            const label = this.state.loading ? 'Loading sticker..' : 'Fallback emoji';
            renderedSticker = (
                <React.Fragment>
                    <p className={styles.emoji}>{this.state.stickerPlaceholder.getEmoji()}</p>
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

    componentDidMount(){
        new StickerService().assertStickerFromPlaceholder(this.state.stickerPlaceholder).then((sticker) => {
            this.setState((prev) => ({ ...prev, sticker: sticker, loading: false }));
        });
    }

    render(){
        return (
            <div className={styles.stickerMessageContent}>{this.#renderSticker()}</div>
        );
    }
}

export default StickerMessageContent;