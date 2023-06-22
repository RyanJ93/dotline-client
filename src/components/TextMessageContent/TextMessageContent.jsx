'use strict';

import StringUtils from '../../utils/StringUtils';
import styles from './TextMessageContent.scss';
import React from 'react';

class TextMessageContent extends React.Component {
    render(){
        if ( StringUtils.isSingleEmoji(this.props.message.getContent()) ){
            return <span className={styles.emoji}>{this.props.message.getContent()}</span>;
        }
        return <span>{this.props.message.getContent()}</span>;
    }
}

export default TextMessageContent;
