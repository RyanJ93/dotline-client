'use strict';

import styles from './AccountRecoveryCompleteStep.scss';
import { withTranslation } from 'react-i18next';
import React from 'react';

class AccountRecoveryCompleteStep extends React.Component {
    render(){
        const { t } = this.props;
        return (
            <div className={styles.accountRecoveryCompleteStep + ' text-primary'}>
                <p className={styles.title}>{t('accountRecoveryCompleteStep.title')}</p>
                <p className={styles.subtitle}>{t('accountRecoveryCompleteStep.subtitle')}</p>
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(AccountRecoveryCompleteStep);
