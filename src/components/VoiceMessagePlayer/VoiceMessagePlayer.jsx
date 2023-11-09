'use strict';

import AudioPlaybackNavigator from '../AudioPlaybackNavigator/AudioPlaybackNavigator';
import ElapsedTimeDisplay from '../ElapsedTimeDisplay/ElapsedTimeDisplay';
import AudioFileAnalyzer from '../AudioFileAnalyzer/AudioFileAnalyzer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withTranslation } from 'react-i18next';
import styles from './VoiceMessagePlayer.scss';
import React from 'react';

class VoiceMessagePlayer extends React.Component {
    #audioPlaybackNavigatorRef = React.createRef();
    #elapsedTimeDisplayRef = React.createRef();
    #audioFileAnalyzerRef = React.createRef();
    #audioRef = React.createRef();
    #ignoreEvent = null;

    #updateCurrentAudioTime(){
        const currentTime = this.#audioRef.current.currentTime;
        this.#audioFileAnalyzerRef.current.setDisabledToTime(currentTime);
        this.#elapsedTimeDisplayRef.current.setElapsedTime(currentTime);
    }

    _handleLoadedMetadata(){
        this.#audioPlaybackNavigatorRef.current.setDuration(this.#audioRef.current.duration);
        this.#elapsedTimeDisplayRef.current.setTotalTime(this.#audioRef.current.duration);
        this.#audioFileAnalyzerRef.current.init(this.#audioRef.current);
        this.#audioFileAnalyzerRef.current.setDisabledToTime(0);
        this.#elapsedTimeDisplayRef.current.setElapsedTime(0);
    }

    _handleTimeUpdate(){
        this.#updateCurrentAudioTime();
    }

    _handleStop(){
        this.setState((prev) => ({ ...prev, playing: false }));
    }

    _handlePlay(){
        this.setState((prev) => ({ ...prev, playing: true }));
        this.#updateCurrentAudioTime();
    }

    _handleEnded(){
        this.#audioFileAnalyzerRef.current.setDisabledToTime(0);
        this.#elapsedTimeDisplayRef.current.setElapsedTime(0);
        this.#audioRef.current.currentTime = 0;
    }

    _handlePlaybackClick(event){
        event.stopPropagation();
        event.preventDefault();
        if ( this.#ignoreEvent === null ){
            this.#ignoreEvent = event.type === 'click' ? 'touchstart' : 'click';
        }
        if ( this.#ignoreEvent !== event.type ){
            if ( this.state.playing === true ){
                this.pause().catch((ex) => console.error(ex));
            }else{
                this.play().catch((ex) => console.error(ex));
            }
        }
    }

    _handleCursorPositionChange(position){
        this.#audioFileAnalyzerRef.current.setDisabledToTime(position);
        this.#elapsedTimeDisplayRef.current.setElapsedTime(position);
        this.#audioRef.current.currentTime = position;
    }

    _handlePlaybackRateChange(){
        let { playbackRate } = this.state;
        if ( playbackRate === 1 ){
            playbackRate = 1.5;
        }else if ( playbackRate === 1.5 ){
            playbackRate = 2;
        }else{
            playbackRate = 1;
        }
        this.setPlaybackRate(playbackRate);
    }

    _handleFileProcessed(){
        this.setState((prev) => ({ ...prev, fileProcessed: true }));
    }

    constructor(props){
        super(props);

        this._handleCursorPositionChange = this._handleCursorPositionChange.bind(this);
        this._handlePlaybackRateChange = this._handlePlaybackRateChange.bind(this);
        this._handleLoadedMetadata = this._handleLoadedMetadata.bind(this);
        this._handleFileProcessed = this._handleFileProcessed.bind(this);
        this._handlePlaybackClick = this._handlePlaybackClick.bind(this);
        this._handleTimeUpdate = this._handleTimeUpdate.bind(this);
        this._handleEnded = this._handleEnded.bind(this);
        this._handleStop = this._handleStop.bind(this);
        this._handlePlay = this._handlePlay.bind(this);
        this.state = { playing: false, playbackRate: 1, fileProcessed: false };
    }

    setPlaybackRate(playbackRate){
        this.setState((prev) => ({ ...prev, playbackRate: playbackRate }));
        this.#audioRef.current.playbackRate = playbackRate;
        return this;
    }

    getPlaybackRate(){
        return this.state.playbackRate;
    }

    async pause(){
        if ( this.state.fileProcessed === true && this.#audioRef.current.paused === false ){
            await this.#audioRef.current.pause();
        }
    }

    async play(){
        if ( this.state.fileProcessed === true && this.#audioRef.current.paused === true ){
            document.querySelectorAll('audio, video').forEach((element) => element.pause());
            await this.#audioRef.current.play();
        }
    }

    render(){
        const url = this.props.downloadedVoiceMessage?.getObjectURL() ?? null, { t } = this.props;
        const filename = this.props.downloadedVoiceMessage?.getFilename() ?? null;
        return (
            <div className={styles.voiceMessagePlayer}>
                <div className={styles.controlsWrapper + ' disable-user-selection'}>
                    <div className={styles.controls + ' bg-accent'} data-enabled={this.state.fileProcessed} onClick={this._handlePlaybackClick} onTouchStart={this._handlePlaybackClick}>
                        { this.state.playing === true && <FontAwesomeIcon icon='fa-solid fa-pause' /> }
                        { this.state.playing === false && <FontAwesomeIcon icon='fa-solid fa-play' /> }
                    </div>
                </div>
                <div className={styles.slider}>
                    <div className={styles.audioPlaybackNavigatorWrapper + ' disable-user-selection'}>
                        <AudioPlaybackNavigator ref={this.#audioPlaybackNavigatorRef} onCursorPositionChange={this._handleCursorPositionChange}>
                            <AudioFileAnalyzer ref={this.#audioFileAnalyzerRef} reverseRendering={false} onFileProcessed={this._handleFileProcessed} />
                        </AudioPlaybackNavigator>
                    </div>
                    <audio preload={'metadata'} src={url} ref={this.#audioRef} onLoadedMetadata={this._handleLoadedMetadata} onTimeUpdate={this._handleTimeUpdate} onPause={this._handleStop} onPlay={this._handlePlay} onEnded={this._handleEnded}></audio>
                    <div className={styles.lowerControls} data-show={this.state.fileProcessed}>
                        <div className={styles.playbackRateControl + ' disable-user-selection'}>
                            <p className={'bg-accent'} onClick={this._handlePlaybackRateChange}>{this.state.playbackRate}x</p>
                        </div>
                        <div className={styles.elapsedTimeDisplayWrapper}>
                            <ElapsedTimeDisplay ref={this.#elapsedTimeDisplayRef} />
                        </div>
                        <div className={styles.downloadButton + ' disable-user-selection'}>
                            <a className={'bg-accent text-primary'} download={filename} href={url} title={t('voiceMessagePlayer.downloadTitle')}>
                                <FontAwesomeIcon icon='fa-solid fa-download' />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(VoiceMessagePlayer);
