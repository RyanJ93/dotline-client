'use strict';

import styles from './TextMessageContent.scss';
import React from 'react';

class TextMessageContent extends React.Component {
    render(){
        return <span>{this.props.message.getContent()}</span>;
    }
}

export default TextMessageContent;
