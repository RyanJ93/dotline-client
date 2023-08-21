'use strict';

import { withTranslation } from 'react-i18next';
import styles from './LoadingView.scss';
import Footer from '../Footer/Footer';
import React from 'react';

class LoadingView extends React.Component {
    render(){
        const { t } = this.props;
        return (
            <div className={styles.view + ' bg-primary text-primary'}>
                <div className={styles.container}>
                    <div className={styles.loader + ' loader-img'} />
                    <p>{t('loadingView.label')}</p>
                </div>
                <Footer />
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(LoadingView);
