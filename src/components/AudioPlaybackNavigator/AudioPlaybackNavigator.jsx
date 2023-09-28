'use strict';

import styles from './AudioPlaybackNavigator.scss';
import React from 'react';

class AudioPlaybackNavigator extends React.Component {
    #wrapperRef = React.createRef();
    #touchMoving = false;
    #duration;

    _handleMouseMove(event){
        if ( event.buttons === 1 || ( event.type === 'touchmove' && this.#touchMoving ) ){
            event.preventDefault();
            let clientX = parseFloat(event.clientX);
            const { width } = window.getComputedStyle(this.#wrapperRef.current, null);
            if ( event.type === 'touchmove' && ( event.touches?.length ?? 0 ) > 0 ){
                clientX = parseFloat(event.touches[0].clientX);
            }
            const { left } = event.target.getBoundingClientRect();
            const percentage = ( ( clientX - left ) * 100 ) / parseFloat(width);
            const position = ( percentage * this.#duration ) / 100;
            if ( !isNaN(position) && typeof this.props.onCursorPositionChange === 'function' ){
                this.props.onCursorPositionChange(position);
            }
        }
    }

    _handleTouchStart(event){
        event.preventDefault();
        this.#touchMoving = true;
    }

    _handleTouchEnd(event){
        event.preventDefault();
        this.#touchMoving = false;
    }

    constructor(props){
        super(props);

        this._handleTouchStart = this._handleTouchStart.bind(this);
        this._handleMouseMove = this._handleMouseMove.bind(this);
        this._handleTouchEnd = this._handleTouchEnd.bind(this);
    }

    setDuration(duration){
        this.#duration = duration;
        return this;
    }

    getDuration(){
        return this.#duration;
    }

    render(){
        return (
            <div className={styles.audioPlaybackNavigator} onMouseMove={this._handleMouseMove} onTouchStart={this._handleTouchStart} onTouchCancel={this._handleTouchEnd} onTouchEnd={this._handleTouchEnd} onTouchMove={this._handleMouseMove} ref={this.#wrapperRef}>
                {this.props.children}
            </div>
        );
    }
}

export default AudioPlaybackNavigator;
