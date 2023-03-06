'use strict';

import styles from './Footer.scss';
import React from 'react';

class Footer extends React.Component {
    render(){
        return (
            <footer className={styles.footer}>
                <div className={styles.container}>
                    <div className={styles.leftContent}>
                        <p className={styles.info}>DotLine official web client</p>
                        <p className={styles.info}>version 0.0.1-ALPHA1</p>
                    </div>
                    <div className={styles.rightContent}>
                        <p className={styles.credits}>Made with ❤️ by Enrico Sola</p>
                    </div>
                </div>
            </footer>
        );
    }
}

export default Footer;
