'use strict';

import AudioAnalyzerMonitor from '../AudioAnalyzerMonitor/AudioAnalyzerMonitor';
import styles from './AudioStreamAnalyzer.scss';
import React from 'react';

class AudioStreamAnalyzer extends React.Component {
    #audioAnalyzerMonitorRef = React.createRef();
    #tickProcessorIntervalID = null;
    #audioAnalyzer = null;
    #waveformChunks = [];

    #processAudioTick(){
        const dataArray = new Uint8Array(this.#audioAnalyzer.frequencyBinCount);
        this.#audioAnalyzer.getByteTimeDomainData(dataArray);
        this.#waveformChunks.push(Math.max(...dataArray));
        this.#redrawCanvas();
    }

    #redrawCanvas(){
        const { height, width, color } = this.#audioAnalyzerMonitorRef.current.autoResizeCanvas();
        let i = 0, x = 0, revertedChunkList = this.#waveformChunks.slice().reverse();
        this.#audioAnalyzerMonitorRef.current.clearMonitor();
        while ( i < revertedChunkList.length && x <= width ){
            let level = Math.abs(revertedChunkList[i] - 128) * 2;
            if ( level > 128 ){
                level = 128;
            }
            const lineHeight = ( level * ( height / 2 ) ) / 128;
            const yTop = ( ( height / 2 ) - lineHeight ), yBot = ( height / 2 );
            x = width - ( i * 4 );
            this.#audioAnalyzerMonitorRef.current.drawSample(x, yTop, yBot, color, lineHeight);
            i++;
        }
    }

    init(audioStream){
        const audioContext = new AudioContext();
        const input = audioContext.createMediaStreamSource(audioStream);
        this.#audioAnalyzer = audioContext.createAnalyser();
        const dataArray = new Float32Array(this.#audioAnalyzer.frequencyBinCount);
        input.connect(this.#audioAnalyzer);
        this.#audioAnalyzer.getFloatFrequencyData(dataArray);
        this.#audioAnalyzerMonitorRef.current.init();
        return this;
    }

    start(){
        if ( this.#tickProcessorIntervalID === null ){
            this.#tickProcessorIntervalID = window.setInterval(() => {
                this.#processAudioTick();
            }, 100);
        }
        return this;
    }

    pause(){
        if ( this.#tickProcessorIntervalID !== null ){
            window.clearInterval(this.#tickProcessorIntervalID);
            this.#tickProcessorIntervalID = null;
        }
        return this;
    }

    stop(){
        this.pause();
        this.#audioAnalyzerMonitorRef.current.clearMonitor();
        this.#waveformChunks = [];
        return this;
    }

    render(){
        return (
            <div className={styles.audioStreamAnalyzer}>
                <AudioAnalyzerMonitor ref={this.#audioAnalyzerMonitorRef} />
            </div>
        );
    }
}

export default AudioStreamAnalyzer;
