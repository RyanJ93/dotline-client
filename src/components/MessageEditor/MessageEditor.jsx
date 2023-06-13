'use strict';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AttachmentList from '../AttachmentList/AttachmentList';
import MessageLocation from '../../DTOs/MessageLocation';
import MessageType from '../../enum/MessageType';
import GeoUtils from '../../utils/GeoUtils';
import styles from './MessageEditor.scss';
import React from 'react';

class MessageEditor extends React.Component {
    #attachmentListRef = React.createRef();
    #inputFileRef = React.createRef();
    #inputRef = React.createRef();

    #renderAttachmentMenu(){
        return (
            <div className={styles.attachmentMenuWrapper} data-active={this.state.attachmentMenuActive}>
                <div className={styles.attachmentMenuOverlay} onClick={this._handleAttachmentMenuOverlayClick} />
                <ul className={styles.attachmentMenu}>
                    <li data-attachment-type={'image'} onClick={this._handleAttachmentMenuEntryClick}>
                        <FontAwesomeIcon icon='fa-solid fa-image' /> Image
                    </li>
                    <li data-attachment-type={'video'} onClick={this._handleAttachmentMenuEntryClick}>
                        <FontAwesomeIcon icon='fa-solid fa-video' /> Video
                    </li>
                    <li data-attachment-type={'audio'} onClick={this._handleAttachmentMenuEntryClick}>
                        <FontAwesomeIcon icon='fa-solid fa-headphones' /> Audio
                    </li>
                    <li data-attachment-type={'file'} onClick={this._handleAttachmentMenuEntryClick}>
                        <FontAwesomeIcon icon='fa-solid fa-file' /> File
                    </li>
                    <li data-attachment-type={'location'} onClick={this._handleAttachmentMenuEntryClick}>
                        <FontAwesomeIcon icon='fa-solid fa-location-dot' /> Location
                    </li>
                </ul>
            </div>
        );
    }

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

    async #sendLocation(){
        const position = await GeoUtils.getCurrentPosition();
        const messageLocation = MessageLocation.makeFromGeolocationPosition(position);
        const content = messageLocation.toSerializedLocation();

        this.props.onMessageSend(content, MessageType.LOCATION, [], null);

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

    _handleAttachmentAddButtonClick(){
        this.setState((prev) => ({ ...prev, attachmentMenuActive: true }));
    }

    _handleAttachmentMenuOverlayClick(){
        this.setState((prev) => ({ ...prev, attachmentMenuActive: false }));
    }

    _handleInputFileChange(event){
        this.#attachmentListRef.current.addAttachments(event.target.files);
    }

    _handleAttachmentMenuEntryClick(event){
        this.setState((prev) => ({ ...prev, attachmentMenuActive: false }));
        switch ( event.target.closest('li').getAttribute('data-attachment-type') ){
            case 'image': {
                this.#inputFileRef.current.accept = 'image/*';
                this.#inputFileRef.current.click();
            }break;
            case 'video': {
                this.#inputFileRef.current.accept = 'video/*';
                this.#inputFileRef.current.click();
            }break;
            case 'audio': {
                this.#inputFileRef.current.accept = 'audio/*';
                this.#inputFileRef.current.click();
            }break;
            case 'file': {
                this.#inputFileRef.current.accept = '';
                this.#inputFileRef.current.click();
            }break;
            case 'location': {
                this.#sendLocation();
            }
        }
    }

    constructor(props){
        super(props);

        this._handleAttachmentMenuOverlayClick = this._handleAttachmentMenuOverlayClick.bind(this);
        this._handleAttachmentMenuEntryClick = this._handleAttachmentMenuEntryClick.bind(this);
        this._handleAttachmentAddButtonClick = this._handleAttachmentAddButtonClick.bind(this);
        this._handleEditMessageDiscardClick = this._handleEditMessageDiscardClick.bind(this);
        this._handleSendButtonClick = this._handleSendButtonClick.bind(this);
        this._handleInputFileChange = this._handleInputFileChange.bind(this);
        this._handleKeyPress = this._handleKeyPress.bind(this);
        this.state = { message: null, attachmentMenuActive: false };
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
        const hasAttachments = this.#attachmentListRef.current.hasAttachments();
        return !hasAttachments && this.#inputRef.current.value.trim() === '';
    }

    sendMessage(){
        if ( !this.isMessageEmpty() && typeof this.props.onMessageSend === 'function' ){
            const attachmentList = this.#attachmentListRef.current.getAttachmentList();
            const content = this.#inputRef.current.value.trim();
            this.props.onMessageSend(content, MessageType.TEXT, attachmentList, this.state.message);
            this.setMessage(null).clear();
        }
        return this;
    }

    clear(){
        this.#attachmentListRef.current.clear();
        this.#inputRef.current.value = '';
        return this;
    }

    addAttachments(fileList){
        this.#attachmentListRef.current.addAttachments(fileList);
        return this;
    }

    render(){
        return (
            <div className={styles.messageEditor}>
                {this.#renderEditMessageReview()}
                <AttachmentList ref={this.#attachmentListRef} />
                <div className={styles.messageEditorWrapper}>
                    <div className={styles.controlsWrapper}>
                        <FontAwesomeIcon icon='fa-solid fa-paperclip' onClick={this._handleAttachmentAddButtonClick} />
                    </div>
                    <div className={styles.inputWrapper}>
                        <input placeholder={'Write a message...'} className={styles.input} type={'text'} onKeyUp={this._handleKeyPress} ref={this.#inputRef} />
                        <input ref={this.#inputFileRef} type={'file'} multiple={true} className={styles.inputFile} onChange={this._handleInputFileChange} />
                    </div>
                    <div className={styles.controlsWrapper}>
                        <FontAwesomeIcon icon='fa-solid fa-paper-plane' onClick={this._handleSendButtonClick} />
                    </div>
                </div>
                {this.#renderAttachmentMenu()}
            </div>
        );
    }
}

export default MessageEditor;
