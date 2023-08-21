'use strict';

import styles from './EntityIcon.scss';
import React from 'react';

class EntityIcon extends React.Component {
    constructor(props){
        super(props);

        this.state = { text: ( props.text ?? '' ) };
    }

    setText(text){
        this.setState((prev) => ({ ...prev, text: text }));
        return this;
    }

    getText(){
        return this.state.text;
    }

    render(){
        return (
            <div className={styles.entityIcon + ' bg-accent text-white'}>
                <p className={styles.content}>{this.state.text.charAt(0)}</p>
            </div>
        );
    }
}

export default EntityIcon;
