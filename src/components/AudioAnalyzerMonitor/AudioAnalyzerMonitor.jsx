'use strict';

import styles from './AudioAnalyzerMonitor.scss';
import React from 'react';

class AudioAnalyzerMonitor extends React.Component {
    #monitorRef = React.createRef();
    #canvasContext = null;

    autoResizeCanvas(){
        const computedStyle = window.getComputedStyle(this.#monitorRef.current, null);
        this.#monitorRef.current.height = parseFloat(computedStyle.height);
        this.#monitorRef.current.width = parseFloat(computedStyle.width);
        return {
            height: this.#monitorRef.current.height,
            width: this.#monitorRef.current.width,
            color: computedStyle.color
        };
    }

    drawSample(x, yTop, yBot, color, lineHeight, lineWidth = 2, alpha = 1){
        this.#canvasContext.beginPath();
        this.#canvasContext.globalAlpha = alpha;
        this.#canvasContext.fillStyle = color;
        this.#canvasContext.roundRect(x, yTop, lineWidth, lineHeight, [3, 3, 0, 0]);
        this.#canvasContext.roundRect(x, yBot, lineWidth, lineHeight, [0, 0, 3, 3]);
        this.#canvasContext.arc(x, yBot, ( lineWidth / 2 ), 0, 2 * Math.PI);
        this.#canvasContext.fill();
        return this;
    }

    clearMonitor(){
        const { height, width } = this.autoResizeCanvas();
        this.#canvasContext.clearRect(0, 0, width, height);
        return this;
    }

    getCanvas(){
        return this.#monitorRef.current;
    }

    getContext(){
        return this.#canvasContext;
    }

    init(){
        this.#canvasContext = this.#monitorRef.current.getContext('2d');
        this.#canvasContext.imageSmoothingEnabled = false;
        return this;
    }

    render(){
        return (
            <div className={styles.audioAnalyzerMonitor}>
                <canvas className={styles.monitor + ' text-primary'} ref={this.#monitorRef} />
            </div>
        );
    }
}

export default AudioAnalyzerMonitor;
