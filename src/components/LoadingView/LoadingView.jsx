'use strict';

import styles from './LoadingView.scss';
import Footer from '../Footer/Footer';
import React from 'react';

class LoadingView extends React.Component {
    render(){
        return (
            <div className={styles.view}>
                <div className={styles.container}>
                    <div className={styles.loader} />
                    <p>Loading authenticated user info...</p>
                </div>
                <Footer />
            </div>
        );
    }
}

export default LoadingView;
