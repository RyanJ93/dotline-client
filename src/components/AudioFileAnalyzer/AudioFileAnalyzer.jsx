'use strict';

import AudioAnalyzerMonitor from '../AudioAnalyzerMonitor/AudioAnalyzerMonitor';
import { withTranslation } from 'react-i18next';
import styles from './AudioFileAnalyzer.scss';
import Event from '../../facades/Event';
import React from 'react';

class AudioFileAnalyzer extends React.Component {
    #audioAnalyzerMonitorRef = React.createRef();
    #currentCanvasWidth = null;
    #reverseRendering = false;
    #disabledToTime = null;
    #audioAnalyzer = null;
    #frequencyData = null;
    #duration = 0;

    #createAudioContexts(duration){
        const audioContext = new AudioContext(), offlineAudioContext = new OfflineAudioContext({
            length: ( 44100 * duration ),
            numberOfChannels: 2,
            sampleRate: 44100,
        });
        this.#duration = duration;
        offlineAudioContext.oncomplete = () => this.#processRenderedBuffer();
        return { audioContext: audioContext, offlineAudioContext: offlineAudioContext };
    }

    #getComputedFrequencyData(width){
        if ( this.#frequencyData === null || width !== this.#currentCanvasWidth ){
            const frequencyData = new Float32Array(this.#audioAnalyzer.frequencyBinCount);
            const ratio = Math.floor(frequencyData.length / ( width / 4 ));
            this.#audioAnalyzer.getFloatFrequencyData(frequencyData);
            this.#currentCanvasWidth = width;
            this.#frequencyData = [];
            for ( let i = 0 ; i < frequencyData.length ; i += ratio ){
                this.#frequencyData.push(frequencyData[i]);
            }
        }
        return this.#frequencyData;
    }

    #markFileAsProcessed(){
        if ( this.state.processing === true ){
            this.setState((prev) => ({ ...prev, processing: false }));
            if ( typeof this.props.onFileProcessed === 'function' ){
                this.props.onFileProcessed();
            }
        }
    }

    #processRenderedBuffer(){
        if ( this.#audioAnalyzer !== null && this.#audioAnalyzerMonitorRef.current !== null ){
            const disableToRatio = this.#disabledToTime === null ? null : ( this.#duration / this.#disabledToTime );
            const { height, width, color } = this.#audioAnalyzerMonitorRef.current.autoResizeCanvas();
            const frequencyData = this.#getComputedFrequencyData(width);
            this.#audioAnalyzerMonitorRef.current.clearMonitor();
            for ( let i = 0 ; i < frequencyData.length ; i ++ ){
                let level = Math.abs(Math.abs(frequencyData[i]) - 128) * 2;
                if ( level > 128 ){
                    level = 128;
                }
                const alpha = disableToRatio === null || ( frequencyData.length / i ) > disableToRatio ? 1 : 0.5;
                const x = this.#reverseRendering ? ( width - ( i * 4 ) ) : ( i * 4 );
                const lineHeight = ( ( level * ( height / 2 ) ) / 128 );
                const yTop = ( ( height / 2 ) - lineHeight ), yBot = ( height / 2 );
                this.#audioAnalyzerMonitorRef.current.drawSample(x, yTop, yBot, color, lineHeight, 2, alpha);
            }
            this.#markFileAsProcessed();
        }
    }

    constructor(props){
        super(props);

        this.#reverseRendering = props.reverseRendering === true;
        this.state = { processing: false };
    }

    componentDidMount(){
        Event.getBroker().on('themeChange', () => this.#processRenderedBuffer());
    }

    setDisabledToTime(disabledToTime){
        this.#disabledToTime = disabledToTime;
        this.#processRenderedBuffer();
        return this;
    }

    getDisabledToTime(){
        return this.#disabledToTime;
    }

    async init(audioElement){
        this.setState((prev) => ({ ...prev, processing: true }));
        const { audioContext, offlineAudioContext } = this.#createAudioContexts(audioElement.duration);
        const arrayBuffer = await ( await fetch(audioElement.src) ).arrayBuffer();
        const offlineSoundSource = offlineAudioContext.createBufferSource();
        const buffer = await audioContext.decodeAudioData(arrayBuffer);
        this.#audioAnalyzer = offlineAudioContext.createAnalyser();
        this.#audioAnalyzerMonitorRef.current.init();
        offlineSoundSource.buffer = buffer;
        offlineSoundSource.connect( this.#audioAnalyzer);
        this.#audioAnalyzer.connect(offlineAudioContext.destination);
        offlineSoundSource.start();
        await offlineAudioContext.startRendering();
    }

    render(){
        const { t } = this.props, { processing } = this.state;
        return (
            <div className={styles.audioFileAnalyzer}>
                <div className={styles.view} data-show={processing}>
                    <p className={styles.processingLabel + ' text-primary'}>{t('audioFileAnalyzer.processingLabel')}</p>
                </div>
                <div className={styles.view} data-show={!processing}>
                    <AudioAnalyzerMonitor ref={this.#audioAnalyzerMonitorRef} />
                </div>
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(AudioFileAnalyzer);
