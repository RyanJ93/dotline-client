'use strict';

import styles from './MainView.scss';
import React from 'react';

class MainView extends React.Component {
    render(){
        return (
            <div className={styles.view}>
                AUTHENTICATED!
            </div>
        );
    }
}

export default MainView;
