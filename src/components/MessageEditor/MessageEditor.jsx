'use strict';

import VoiceMessageRecorder from '../VoiceMessageRecorder/VoiceMessageRecorder';
import MessageAttachmentList from '../../DTOs/MessageAttachmentList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ServerInfoService from '../../services/ServerInfoService';
import AttachmentList from '../AttachmentList/AttachmentList';
import StickerPicker from '../StickerPicker/StickerPicker';
import MessageLocation from '../../DTOs/MessageLocation';
import MessageType from '../../enum/MessageType';
import { withTranslation } from 'react-i18next';
import GeoUtils from '../../utils/GeoUtils';
import styles from './MessageEditor.scss';
import React from 'react';
import MessageBox from '../../facades/MessageBox';

class MessageEditor extends React.Component {
    #voiceMessageRecorderRef = React.createRef();
    #attachmentListRef = React.createRef();
    #stickerPickerRef = React.createRef();
    #inputFileRef = React.createRef();
    #inputRef = React.createRef();

    #renderAttachmentMenu(){
        const maxFileCount = new ServerInfoService().getServerParams()?.getMaxFileCount() ?? 0;
        const { t } = this.props, allowedAttachments = [];
        if ( maxFileCount > 0 ){
            allowedAttachments.push(
                <li data-attachment-type={'image'} onClick={this._handleAttachmentMenuEntryClick} key={'image'}>
                    <FontAwesomeIcon icon='fa-solid fa-image' />{t('messageEditor.contentType.image')}
                </li>
            );
            allowedAttachments.push(
                <li data-attachment-type={'video'} onClick={this._handleAttachmentMenuEntryClick} key={'video'}>
                    <FontAwesomeIcon icon='fa-solid fa-video' />{t('messageEditor.contentType.video')}
                </li>
            );
            allowedAttachments.push(
                <li data-attachment-type={'audio'} onClick={this._handleAttachmentMenuEntryClick} key={'audio'}>
                    <FontAwesomeIcon icon='fa-solid fa-headphones' />{t('messageEditor.contentType.audio')}
                </li>
            );
            allowedAttachments.push(
                <li data-attachment-type={'file'} onClick={this._handleAttachmentMenuEntryClick} key={'file'}>
                    <FontAwesomeIcon icon='fa-solid fa-file' />{t('messageEditor.contentType.file')}
                </li>
            );
        }
        allowedAttachments.push(
            <li data-attachment-type={'location'} onClick={this._handleAttachmentMenuEntryClick} key={'location'}>
                <FontAwesomeIcon icon='fa-solid fa-location-dot' />{t('messageEditor.contentType.location')}
            </li>
        );
        return (
            <div className={styles.attachmentMenuWrapper} data-active={this.state.attachmentMenuActive}>
                <ul className={styles.attachmentMenu + ' bg-black border-black text-white'}>{allowedAttachments}</ul>
                <div className={styles.attachmentMenuOverlay} onClick={this._handleAttachmentMenuOverlayClick} />
            </div>
        );
    }

    #renderEditMessageReview(){
        const { t } = this.props;
        return this.state.message === null ? null : (
            <div className={styles.editMessageReview}>
                <div className={styles.iconWrapper + ' text-white'}>
                    <FontAwesomeIcon icon="fa-solid fa-pen" />
                </div>
                <div className={styles.originalMessageWrapper + ' border-white'}>
                    <p className={'text-white'}>{t('messageEditor.edit.title')}</p>
                    <p className={styles.originalMessage + ' text-white'}>{this.state.message.getContent()}</p>
                </div>
                <div className={styles.controlsWrapper + ' text-white'} onClick={this._handleEditMessageDiscardClick} title={t('messageEditor.edit.discard')}>
                    <FontAwesomeIcon icon="fa-solid fa-xmark" />
                </div>
            </div>
        );
    }

    async #sendLocation(){
        const { t } = this.props;
        try{
            const position = await GeoUtils.getCurrentPosition();
            const messageLocation = MessageLocation.makeFromGeolocationPosition(position);
            const content = messageLocation.toSerializedLocation();
            if ( typeof this.props.onMessageSend === 'function' ){
                this.props.onMessageSend(content, MessageType.LOCATION, null, null);
            }
        }catch(ex){
            if ( ex instanceof GeolocationPositionError && ex.message.indexOf('denied') > 0 ){
                return await MessageBox.error(t('messageEditor.error.geoPermissionDenied'));
            }
            await MessageBox.reportError(ex);
            console.error(ex);
        }
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
        }else{
            const maxMessageLength = new ServerInfoService().getServerParams()?.getMaxMessageLength() ?? 0;
            const isMessageTooLong = this.#inputRef.current.value.length > maxMessageLength;
            this.setState((prev) => ({ ...prev, isMessageTooLong: isMessageTooLong }));
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

    _handleStickerSelect(sticker){
        this.props.onMessageSend(sticker.toSerializedSticker(), MessageType.STICKER, null, null);
    }

    _handleStickerPickerToggle(){
        const stickerPickerActive = !this.state.stickerPickerActive;
        if ( !stickerPickerActive ){
            this.#stickerPickerRef.current.reset();
        }
        this.setState((prev) => ({ ...prev, stickerPickerActive: stickerPickerActive }));
    }

    _handleVoiceMessageRecorderOpen(){
        this.setState((prev) => ({ ...prev, voiceMessageRecorderActive: true }));
        this.#voiceMessageRecorderRef.current.start();
    }

    _handleVoiceMessageRecorderCancel(){
        this.setState((prev) => ({ ...prev, voiceMessageRecorderActive: false }));
    }

    _handleVoiceMessageRecorderSend(recording){
        this.setState((prev) => ({ ...prev, voiceMessageRecorderActive: false }));
        if ( typeof this.props.onMessageSend === 'function' ){
            this.props.onMessageSend('', MessageType.VOICE_MESSAGE, new MessageAttachmentList({
                attachmentBlobContainerList: [recording]
            }), null);
            this.setMessage(null).clear();
        }
    }

    constructor(props){
        super(props);

        this._handleVoiceMessageRecorderCancel = this._handleVoiceMessageRecorderCancel.bind(this);
        this._handleAttachmentMenuOverlayClick = this._handleAttachmentMenuOverlayClick.bind(this);
        this._handleVoiceMessageRecorderOpen = this._handleVoiceMessageRecorderOpen.bind(this);
        this._handleVoiceMessageRecorderSend = this._handleVoiceMessageRecorderSend.bind(this);
        this._handleAttachmentMenuEntryClick = this._handleAttachmentMenuEntryClick.bind(this);
        this._handleAttachmentAddButtonClick = this._handleAttachmentAddButtonClick.bind(this);
        this._handleEditMessageDiscardClick = this._handleEditMessageDiscardClick.bind(this);
        this._handleStickerPickerToggle = this._handleStickerPickerToggle.bind(this);
        this._handleSendButtonClick = this._handleSendButtonClick.bind(this);
        this._handleInputFileChange = this._handleInputFileChange.bind(this);
        this._handleStickerSelect = this._handleStickerSelect.bind(this);
        this._handleKeyPress = this._handleKeyPress.bind(this);
        this.state = {
            voiceMessageRecorderActive: false,
            attachmentMenuActive: false,
            stickerPickerActive: false,
            isMessageTooLong: false,
            message: null
        };
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
        const maxMessageLength = new ServerInfoService().getServerParams()?.getMaxMessageLength() ?? 0;
        if ( this.#inputRef.current.value.length > maxMessageLength ){
            this.setState((prev) => ({ ...prev, isMessageTooLong: true }));
            return this;
        }
        if ( !this.isMessageEmpty() && typeof this.props.onMessageSend === 'function' ){
            const messageAttachmentList = this.#attachmentListRef.current.getMessageAttachmentList();
            const content = this.#inputRef.current.value.trim();
            this.props.onMessageSend(content, MessageType.TEXT, messageAttachmentList, this.state.message);
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
        const serverParams = new ServerInfoService().getServerParams(), { t } = this.props;
        const messageEditorWrapperActive = !this.state.voiceMessageRecorderActive;
        const maxMessageLength = serverParams?.getMaxMessageLength() ?? 0;
        const maxFileCount = serverParams?.getMaxFileCount() ?? 0;
        const messageTooLongLabel = t('messageEditor.error.messageTooLong').replace('[amount]', maxMessageLength);
        return (
            <div className={styles.messageEditor + ' bg-secondary'}>
                {this.#renderEditMessageReview()}
                <AttachmentList ref={this.#attachmentListRef} />
                <div className={styles.voiceMessageRecorderWrapper} data-active={this.state.voiceMessageRecorderActive}>
                    <VoiceMessageRecorder ref={this.#voiceMessageRecorderRef} onCancel={this._handleVoiceMessageRecorderCancel} onSend={this._handleVoiceMessageRecorderSend} />
                </div>
                <div className={styles.stickerPickerWrapper} data-active={this.state.stickerPickerActive}>
                    <StickerPicker ref={this.#stickerPickerRef} onStickerSelect={this._handleStickerSelect} />
                </div>
                <div className={styles.messageEditorWrapper + ' text-white'} data-active={messageEditorWrapperActive}>
                    <div className={styles.leftControlsWrapper}>
                        <FontAwesomeIcon icon='fa-solid fa-paperclip' onClick={this._handleAttachmentAddButtonClick} />
                    </div>
                    <div className={styles.inputWrapper}>
                        <input placeholder={t('messageEditor.placeholder')} className={styles.input + ' text-white'} type={'text'} onKeyUp={this._handleKeyPress} ref={this.#inputRef} />
                        <input ref={this.#inputFileRef} type={'file'} multiple={true} className={styles.inputFile} onChange={this._handleInputFileChange} />
                        { this.state.isMessageTooLong && <p className={styles.errorMessage + ' text-danger'}>{messageTooLongLabel}</p> }
                    </div>
                    <div className={styles.rightControlsWrapper}>
                        <FontAwesomeIcon icon='fa-solid fa-paper-plane' onClick={this._handleSendButtonClick} title={t('messageEditor.title.send')} />
                        <FontAwesomeIcon icon='fa-solid fa-icons' onClick={this._handleStickerPickerToggle} title={t('messageEditor.title.stickers')} />
                        { maxFileCount > 0 && <FontAwesomeIcon icon='fa-solid fa-microphone' title={t('messageEditor.title.voice')} onClick={this._handleVoiceMessageRecorderOpen} /> }
                    </div>
                </div>
                {this.#renderAttachmentMenu()}
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(MessageEditor);
