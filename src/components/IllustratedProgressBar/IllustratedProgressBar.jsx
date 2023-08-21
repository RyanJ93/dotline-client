'use strict';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './IllustratedProgressBar.scss';
import React from 'react';

class IllustratedProgressBar extends React.Component {
    #renderIcon(){
        let renderedIcon = null, { icon } = this.state;
        if ( typeof icon === 'string' && icon !== '' ){
            renderedIcon = (
                <div className={styles.icon}>
                    <FontAwesomeIcon icon={icon} />
                </div>
            );
        }
        return renderedIcon;
    }

    #renderMessage(){
        let renderedMessage = null, { message } = this.state;
        if ( typeof message === 'string' && message !== '' ){
            renderedMessage = <p className={styles.message}>{message}</p>;
        }
        return renderedMessage;
    }

    constructor(props){
        super(props);

        this.state = {
            message: ( props?.message ?? null ),
            icon: ( props?.icon ?? null ),
            value: ( props?.value ?? 0 )
        };
    }

    setMessage(message){
        this.setState((prev) => { return { ...prev, message: message }; });
        return this;
    }

    getMessage(){
        return this.state.message;
    }

    setValue(value){
        this.setState((prev) => { return { ...prev, value: value }; });
        return this;
    }

    getValue(){
        return this.state.value;
    }

    setIcon(icon){
        this.setState((prev) => { return { ...prev, icon: icon }; });
        return this;
    }

    getIcon(){
        return this.state.icon;
    }

    render(){
        const width = this.state.value + '%';
        return (
            <div className={styles.illustratedProgressBar}>
                {this.#renderIcon()}
                {this.#renderMessage()}
                <div className={styles.progressBar + ' border-primary'}>
                    <div className={styles.progressBarValue + ' bg-accent'} style={{ width: width }} />
                </div>
            </div>
        );
    }
}

export default IllustratedProgressBar;
