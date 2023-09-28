 'use strict';

 import AudioStreamAnalyzer from '../AudioStreamAnalyzer/AudioStreamAnalyzer';
import ElapsedTimeDisplay from '../ElapsedTimeDisplay/ElapsedTimeDisplay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AudioRecorder from '../../support/AudioRecorder';
 import MessageBox from '../../facades/MessageBox';
import styles from './VoiceMessageRecorder.scss';
import { withTranslation } from 'react-i18next';
import React from 'react';

class VoiceMessageRecorder extends React.Component {
    #audioStreamAnalyzerRef = React.createRef();
    #elapsedTimeDisplayRef = React.createRef();
    #audioRecorder = null;
    #audioStream = null;

    async #handleMediaDeviceError(error){
        const { t } = this.props;
        await this.stop();
        if ( error?.name === 'NotAllowedError' || error?.name === 'AbortError' || error?.name === 'SecurityError' ){
            await MessageBox.error(t('voiceMessageRecorder.error.permissionDenied'));
        }else{
            await MessageBox.error(t('voiceMessageRecorder.error.genericError'));
        }
    }

    async #ensureAudioRecorder(){
        if ( this.#audioRecorder === null ){
            try{
                this.#audioStream = await navigator.mediaDevices.getUserMedia({
                    noiseSuppression: true,
                    echoCancellation: true,
                    video: false,
                    audio: true
                });
                this.#audioRecorder = new AudioRecorder(this.#audioStream);
                this.#audioRecorder.start();
            }catch(ex){
                await this.#handleMediaDeviceError(ex);
            }
        }
    }

    _handleCancelClick(){
        this.stop();
        if ( typeof this.props.onCancel === 'function' ){
            this.props.onCancel();
        }
    }

    _handlePauseClick(){
        this.pause();
    }

    _handlePlayClick(){
        this.start();
    }

    _handleSendClick(){
        if ( this.#audioRecorder !== null ){
            const name = VoiceMessageRecorder.VOICE_MESSAGE_FILE_NAME;
            this.#audioRecorder.stop().exportAsBlobContainer(name).then((blobContainer) => {
                if ( typeof this.props.onSend === 'function' ){
                    this.props.onSend(blobContainer);
                }
                this.stop();
            });
        }
    }

    constructor(props){
        super(props);

        this._handleCancelClick = this._handleCancelClick.bind(this);
        this._handlePauseClick = this._handlePauseClick.bind(this);
        this._handlePlayClick = this._handlePlayClick.bind(this);
        this._handleSendClick = this._handleSendClick.bind(this);
        this.state = { recording: false };
    }

    async start(){
        await this.#ensureAudioRecorder();
        if ( this.#audioRecorder !== null ){
            this.#audioStreamAnalyzerRef.current.init(this.#audioStream).start();
            this.setState((prev) => ({ ...prev, recording: true }));
            this.#elapsedTimeDisplayRef.current.start();
        }
    }

    async pause(){
        this.setState((prev) => ({ ...prev, recording: false }));
        this.#audioStreamAnalyzerRef.current.pause();
        this.#elapsedTimeDisplayRef.current.pause();
        this.#audioRecorder?.pause();
    }

    async stop(){
        if ( this.#audioStream !== null ){
            this.#audioStream.getTracks().forEach((track) => track.stop());
            this.setState((prev) => ({ ...prev, recording: false }));
            this.#audioStreamAnalyzerRef.current.stop();
            this.#elapsedTimeDisplayRef.current.stop();
            this.#audioRecorder?.reset();
            this.#audioRecorder = null;
        }
    }

    render(){
        const { t } = this.props;
        return (
            <div className={styles.voiceMessageRecorder}>
                <div className={styles.leftControls}>
                    <FontAwesomeIcon icon='fa-solid fa-trash' className={'text-danger'} onClick={this._handleCancelClick} title={t('voiceMessageRecorder.title.cancelMessageRecording')} />
                    <div className={styles.elapsedTimeDisplayWrapper + ' text-primary'}>
                        <ElapsedTimeDisplay ref={this.#elapsedTimeDisplayRef} />
                    </div>
                </div>
                <div className={styles.analyzerWrapper}>
                    <div className={styles.analyzerContainer + ' bg-primary'}>
                        <AudioStreamAnalyzer ref={this.#audioStreamAnalyzerRef} />
                    </div>
                </div>
                <div className={styles.rightControls + ' text-primary'}>
                    <div className={styles.playbackControls}>
                        <div className={styles.playbackControlButton} data-active={this.state.recording}>
                            <FontAwesomeIcon icon='fa-solid fa-pause' onClick={this._handlePauseClick} title={t('voiceMessageRecorder.title.pauseMessageRecording')} />
                        </div>
                        <div className={styles.playbackControlButton} data-active={!this.state.recording}>
                            <FontAwesomeIcon icon='fa-solid fa-record-vinyl' onClick={this._handlePlayClick} title={t('voiceMessageRecorder.title.continueMessageRecording')} />
                        </div>
                    </div>
                    <div className={styles.sendControls}>
                        <FontAwesomeIcon icon='fa-solid fa-paper-plane' onClick={this._handleSendClick} title={t('voiceMessageRecorder.title.sendMessage')} />
                    </div>
                </div>
            </div>
        );
    }
}

Object.defineProperty(VoiceMessageRecorder, 'VOICE_MESSAGE_FILE_NAME', {
    value: 'Voice message.wav',
    writable: false
});

export default withTranslation(null, { withRef: true })(VoiceMessageRecorder);
