'use strict';

import styles from './EntityIcon.scss';
import React from 'react';

class EntityIcon extends React.Component {
    render(){
        return (
            <div className={styles.entityIcon + ' bg-accent text-white'}>
                <p className={styles.content}>{this.props.text.charAt(0)}</p>
            </div>
        );
    }
}

export default EntityIcon;
