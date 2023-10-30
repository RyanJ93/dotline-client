'use strict';

import StringUtils from '../../../utils/StringUtils';
import styles from './TextMessageContent.scss';
import MessageContent from '../MessageContent';
import React from 'react';

class TextMessageContent extends MessageContent {
    #renderMessageText(){
        return <span className={styles.text}>{this.props.URLTokenizationResult.tokenList.map((component, index) => {
            const { type, content } = component;
            if ( type === 'text' ){
                return <span key={index}>{content}</span>;
            }
            return <a className={'link-secondary'} target={'_blank'} key={index} href={content} rel={'noreferrer'}>{content}</a>;
        })}</span>;
    }

    render(){
        if ( StringUtils.isSingleEmoji(this.props.message.getContent()) ){
            return <span className={styles.emoji}>{this.props.message.getContent()}</span>;
        }
        return this.#renderMessageText();
    }
}

export default TextMessageContent;
