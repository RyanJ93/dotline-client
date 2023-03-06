'use strict';

import styles from './HTMLLogo.scss';
import React from 'react';

class HTMLLogo extends React.Component {
    render(){
        return (
            <div className={styles.logo}>
                <div className={styles.dot}></div>
                <div className={styles.verticalLine}></div>
                <div className={styles.horizontalLine}></div>
                <p className={styles.text}>INE</p>
            </div>
        );
    }
}

export default HTMLLogo;
