'use strict';

import styles from './HTMLLogo.scss';
import React from 'react';

class HTMLLogo extends React.Component {
    render(){
        return (
            <div className={styles.logo}>
                <div className={styles.dot + ' bg-accent'}></div>
                <div className={styles.verticalLine + ' bg-accent'}></div>
                <div className={styles.horizontalLine + ' bg-accent'}></div>
                <p className={styles.text + ' text-primary'}>INE</p>
            </div>
        );
    }
}

export default HTMLLogo;
