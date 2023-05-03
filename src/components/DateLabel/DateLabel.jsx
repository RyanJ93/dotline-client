'use strict';

import IllegalArgumentException from '../../exceptions/IllegalArgumentException';
import React from 'react';

class DateLabel extends React.Component {
    #processCurrentLabel(){
        let currentLabel = '', nextUpdateTimeout = 0;
        if ( this.state.date instanceof Date ){
            const difference = ( (+new Date()) - this.state.date.getTime() ) / 1000;
            if ( difference < 1 ){
                nextUpdateTimeout = 1000;
                currentLabel = 'Now';
            }else if ( difference < 60 ){
                const seconds = Math.floor(difference);
                currentLabel = seconds + ( seconds > 1 ? ' seconds' : ' second' ) + ' ago';
                nextUpdateTimeout = 1;
            }else if ( difference < 3600 ){
                const minutes = Math.floor(difference / 60);
                currentLabel = minutes + ( minutes > 1 ? ' minutes' : ' minute' ) + ' ago';
                nextUpdateTimeout = 60 - difference;
            }else if ( difference < 86400 ){
                const hours = Math.floor(difference / 3600);
                currentLabel = hours + ( hours > 1 ? ' hours' : ' hour' ) + ' ago';
                nextUpdateTimeout = 3600 - difference;
            }else if ( difference < 2592000 ){
                const days = Math.floor(difference / 86400);
                currentLabel = days + ( days > 1 ? ' days' : ' day' ) + ' ago';
                nextUpdateTimeout = 86400 - difference;
            }else{
                currentLabel = this.state.date.toLocaleDateString(undefined, {
                    year: 'numeric', day: 'numeric', month: 'long'
                });
            }
        }
        this.setState({ currentLabel: currentLabel });
        window.clearTimeout(this.#currentTimeoutID);
        if ( nextUpdateTimeout > 0 ){
            this.#currentTimeoutID = window.setTimeout(() => {
                this.#processCurrentLabel();
            }, Math.floor(nextUpdateTimeout));
        }
    }

    #currentTimeoutID = null;

    constructor(props){
        super(props);

        this.state = { date: ( this.props.date ?? null ), currentLabel: '' };
    }

    componentDidMount(){
        this.#processCurrentLabel();
    }

    setDate(date){
        if ( date !== null && !( date instanceof Date ) ){
            throw new IllegalArgumentException('Invalid date.');
        }
        this.setState({ date: date }, () => {
            window.clearTimeout(this.#currentTimeoutID);
            this.#processCurrentLabel();
        });
        return this;
    }

    getDate(){
        return this.state.date;
    }

    render(){
        return <span>{this.state.currentLabel}</span>;
    }
}

export default DateLabel;
