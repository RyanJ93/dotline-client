'use strict';

import LocationMessageContent from '../LocationMessageContent/LocationMessageContent';
import StickerMessageContent from '../StickerMessageContent/StickerMessageContent';
import TextMessageContent from '../TextMessageContent/TextMessageContent';
import MessageType from '../../enum/MessageType';
import styles from './MessageContent.scss';
import React from 'react';

class MessageContent extends React.Component {
    #renderMessageContent(){
        switch ( this.props.message?.getType() ){
            case MessageType.LOCATION: {
                return <LocationMessageContent message={this.props.message} />;
            }
            case MessageType.STICKER: {
                return <StickerMessageContent message={this.props.message} />;
            }
            case MessageType.TEXT: {
                return <TextMessageContent message={this.props.message} />;
            }
            default: {
                return <span className={styles.unsupportedType}>Unsupported message type</span>
            }
        }
    }

    render(){
        return <React.Fragment>{this.#renderMessageContent()}</React.Fragment>;
    }
}

export default MessageContent;
