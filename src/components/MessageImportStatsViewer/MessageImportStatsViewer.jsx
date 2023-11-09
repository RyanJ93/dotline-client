'use strict';

import styles from './MessageImportStatsViewer.scss';
import { withTranslation } from 'react-i18next';
import Event from '../../facades/Event';
import React from 'react';

class MessageImportStatsViewer extends React.Component {
    #computeImportStats(messageSyncStats){
        let percentage = 0, label = '', { t } = this.props;
        if ( messageSyncStats !== null ){
            const totalProcessedMessageCount = messageSyncStats.getTotalProcessedMessageCount();
            const totalMessageCommitCount = messageSyncStats.getTotalMessageCommitCount();
            label = t('messageImportStatsViewer.progressMessage');
            label = label.replace('[count]', totalProcessedMessageCount);
            label = label.replace('[total]', totalMessageCommitCount);
            percentage = ( totalProcessedMessageCount * 100 ) / totalMessageCommitCount;
        }
        this.setState((prev) => ({ ...prev, percentage: percentage, label: label }));
    }

    constructor(props){
        super(props);

        this.state = { importing: false, percentage: 0, label: '' };
    }

    componentDidMount(){
        Event.getBroker().on('messageSyncEnd', () => this.setState((prev) => ({ ...prev, percentage: 0, label: '', importing: false })));
        Event.getBroker().on('messageSyncProgress', (messageSyncStats) => this.#computeImportStats(messageSyncStats));
        Event.getBroker().on('messageSyncStart', () => {
            const label = this.props.t('messageImportStatsViewer.init');
            this.setState((prev) => ({ ...prev, percentage: 0, label: label, importing: true }));
        });
    }

    render(){
        const { percentage, label, importing } = this.state, { t } = this.props;
        return (
            <div className={styles.messageImportStatsViewer + ' bg-primary border-secondary'} data-show={importing}>
                <p className={styles.title + ' text-primary'}>{t('messageImportStatsViewer.title')}</p>
                <div className={styles.progressBar + ' border-secondary'}>
                    <div className={styles.progressBarValue + ' bg-secondary'} style={{ width: percentage + '%' }} />
                </div>
                <p className={styles.stats + ' text-primary'}>{label}</p>
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(MessageImportStatsViewer);
