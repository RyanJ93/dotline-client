'use strict';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './MessageEditor.scss';
import React from 'react';

class MessageEditor extends React.Component {
    #inputRef = React.createRef();

    #renderEditMessageReview(){
        return this.state.message === null ? null : (
            <div className={styles.editMessageReview}>
                <div className={styles.iconWrapper}>
                    <FontAwesomeIcon icon="fa-solid fa-pen" />
                </div>
                <div className={styles.originalMessageWrapper}>
                    <p>Edit message</p>
                    <p className={styles.originalMessage}>{this.state.message.getContent()}</p>
                </div>
                <div className={styles.controlsWrapper} onClick={this._handleEditMessageDiscardClick}>
                    <FontAwesomeIcon icon="fa-solid fa-xmark" />
                </div>
            </div>
        );
    }

    _handleEditMessageDiscardClick(){
        this.setMessage(null);
    }

    _handleSendButtonClick(){
        this.sendMessage();
    }

    _handleKeyPress(event){
        if ( typeof this.props.onTyping === 'function' ){
            this.props.onTyping();
        }
        if ( event.key === 'Enter' && event.shiftKey === false ){
            this.sendMessage();
        }
    }

    constructor(props){
        super(props);

        this._handleEditMessageDiscardClick = this._handleEditMessageDiscardClick.bind(this);
        this._handleSendButtonClick = this._handleSendButtonClick.bind(this);
        this._handleKeyPress = this._handleKeyPress.bind(this);
        this.state = { message: null };
    }

    setMessage(message){
        this.clear().setState((prev) => ({ ...prev, message: message }));
        if ( message !== null ){
            this.#inputRef.current.value = message.getContent();
            this.#inputRef.current.focus();
        }
        return this;
    }

    getMessage(){
        return this.state.message;
    }

    isMessageEmpty(){
        return this.#inputRef.current.value === '';
    }

    sendMessage(){
        if ( !this.isMessageEmpty() && typeof this.props.onMessageSend === 'function' ){
            this.props.onMessageSend(this.#inputRef.current.value, this.state.message);
            this.setMessage(null).clear();
        }
        return this;
    }

    clear(){
        this.#inputRef.current.value = '';
        return this;
    }

    render(){
        return (
            <div className={styles.messageEditor}>
                {this.#renderEditMessageReview()}
                <div className={styles.messageEditorWrapper}>
                    <div className={styles.inputWrapper}>
                        <input placeholder={'Write a message...'} className={styles.input} type={'text'} onKeyUp={this._handleKeyPress} ref={this.#inputRef} />
                    </div>
                    <div className={styles.controlsWrapper}>
                        <FontAwesomeIcon icon="fa-solid fa-paper-plane" onClick={this._handleSendButtonClick} />
                    </div>
                </div>
            </div>
        );
    }
}

export default MessageEditor;
