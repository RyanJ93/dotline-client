'use strict';

import { withTranslation } from 'react-i18next';
import App from '../../facades/App';
import styles from './Footer.scss';
import React from 'react';

class Footer extends React.Component {
    render(){
        const { t } = this.props;
        return (
            <footer className={styles.footer + ' text-primary'}>
                <div className={styles.container}>
                    <div className={styles.leftContent}>
                        <p className={styles.info}>{t('footer.info')}</p>
                        <p className={styles.info}>{t('footer.version').replace('[version]', App.getVersion())}</p>
                    </div>
                    <div className={styles.rightContent}>
                        <p className={styles.credits}>{t('footer.credits')}<a href={'https://www.enricosola.dev'} className={'link-primary'}>Enrico Sola</a></p>
                    </div>
                </div>
            </footer>
        );
    }
}

export default withTranslation(null, { withRef: true })(Footer);
