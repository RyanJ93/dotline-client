'use strict';

import IllegalArgumentException from '../../exceptions/IllegalArgumentException';
import { withTranslation } from 'react-i18next';
import styles from './DateLabel.scss';
import React from 'react';

class DateLabel extends React.Component {
    #processCurrentLabel(){
        let currentLabel = '', nextUpdateTimeout = 0, { t, i18n } = this.props;
        if ( this.state.date instanceof Date ){
            const difference = ( (+new Date()) - this.state.date.getTime() ) / 1000;
            if ( difference < 1 ){
                currentLabel = t('dateLabel.now');
                nextUpdateTimeout = 1000;
            }else if ( difference < 60 ){
                const seconds = Math.floor(difference);
                const labelName = seconds > 1 ? 'dateLabel.seconds' : 'dateLabel.second';
                currentLabel = t(labelName).replace('[amount]', seconds);
                nextUpdateTimeout = 1;
            }else if ( difference < 3600 ){
                const minutes = Math.floor(difference / 60);
                const labelName = minutes > 1 ? 'dateLabel.minutes' : 'dateLabel.minute';
                currentLabel = t(labelName).replace('[amount]', minutes);
                nextUpdateTimeout = 60 - difference;
            }else if ( difference < 86400 ){
                const hours = Math.floor(difference / 3600);
                const labelName = hours > 1 ? 'dateLabel.hours' : 'dateLabel.hour';
                currentLabel = t(labelName).replace('[amount]', hours);
                nextUpdateTimeout = 3600 - difference;
            }else if ( difference < 2592000 ){
                const days = Math.floor(difference / 86400);
                const labelName = days > 1 ? 'dateLabel.days' : 'dateLabel.day';
                currentLabel = t(labelName).replace('[amount]', days);
                nextUpdateTimeout = 86400 - difference;
            }else{
                currentLabel = this.state.date.toLocaleDateString(i18n.language, {
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
        return <span className={styles.dateLabel}>{this.state.currentLabel}</span>;
    }
}

export default withTranslation(null, { withRef: true })(DateLabel);
