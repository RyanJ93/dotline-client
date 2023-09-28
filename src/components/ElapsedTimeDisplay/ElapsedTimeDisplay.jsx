'use strict';

import styles from './ElapsedTimeDisplay.scss';
import DateUtils from '../../utils/DateUtils';
import React from 'react';

class ElapsedTimeDisplay extends React.Component {
    #timerIntervalID = null;

    #getRenderedElapsedTime(){
        let renderedElapsedTime = '';
        if ( this.state.elapsedTime !== null ){
            renderedElapsedTime = DateUtils.timeToHumanRepresentation(this.state.elapsedTime);
        }
        return renderedElapsedTime;
    }

    #getRenderedTotalTime(){
        let renderedTotalTime = '';
        if ( this.state.totalTime !== null ){
            renderedTotalTime = ' / ' + DateUtils.timeToHumanRepresentation(this.state.totalTime);
        }
        return renderedTotalTime;
    }

    constructor(props){
        super(props);

        this.state = { elapsedTime: null, totalTime: null };
    }

    setElapsedTime(elapsedTime){
        this.setState((prev) => ({ ...prev, elapsedTime: elapsedTime }));
        return this;
    }

    getElapsedTime(){
        return this.state.elapsedTime;
    }

    setTotalTime(totalTime){
        this.setState((prev) => ({ ...prev, totalTime: totalTime }));
        return this;
    }

    getTotalTime(){
        return this.state.totalTime;
    }

    reset(){
        this.setState((prev) => ({ ...prev, elapsedTime: null }));
        return this;
    }

    start(){
        if ( this.#timerIntervalID === null ){
            this.#timerIntervalID = window.setInterval(() => {
                this.setState((prev) => ({ ...prev, elapsedTime: ( prev.elapsedTime + 1 ) }));
            }, 1000);
        }
        return this;
    }

    pause(){
        if ( this.#timerIntervalID !== null ){
            window.clearInterval(this.#timerIntervalID);
            this.#timerIntervalID = null;
        }
        return this;
    }

    stop(){
        return this.pause().reset();
    }

    render(){
        return (
            <div className={styles.elapsedTimeDisplay}>
                <span>{this.#getRenderedElapsedTime()}{this.#getRenderedTotalTime()}</span>
            </div>
        );
    }
}

export default ElapsedTimeDisplay;
