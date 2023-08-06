'use strict';

import App from '../../facades/App';
import styles from './Footer.scss';
import React from 'react';

class Footer extends React.Component {
    render(){
        return (
            <footer className={styles.footer}>
                <div className={styles.container}>
                    <div className={styles.leftContent}>
                        <p className={styles.info}>DotLine official web client</p>
                        <p className={styles.info}>version {App.getVersion()}</p>
                    </div>
                    <div className={styles.rightContent}>
                        <p className={styles.credits}>Made with ❤️ by <a href={'https://www.enricosola.dev'}>Enrico Sola</a></p>
                    </div>
                </div>
            </footer>
        );
    }
}

export default Footer;
