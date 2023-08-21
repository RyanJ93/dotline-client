'use strict';

import styles from './MessageImportStatsViewer.scss';
import { withTranslation } from 'react-i18next';
import Event from '../../facades/Event';
import React from 'react';

class MessageImportStatsViewer extends React.Component {
    #computeImportStats(){
        let percentage = 0, label = '', { t } = this.props;
        if ( this.state.messageSyncStats !== null ){
            const totalProcessedMessageCount = this.state.messageSyncStats.getTotalProcessedMessageCount();
            const totalMessageCommitCount = this.state.messageSyncStats.getTotalMessageCommitCount();
            label = t('messageImportStatsViewer.progressMessage');
            label = label.replace('[count]', totalProcessedMessageCount);
            label = label.replace('[total]', totalMessageCommitCount);
            percentage = ( totalProcessedMessageCount * 100 ) / totalMessageCommitCount;
        }
        return { percentage: percentage, label: label };
    }

    constructor(props){
        super(props);

        this.state = { importing: false, messageSyncStats: null };
    }

    componentDidMount(){
        Event.getBroker().on('messageSyncProgress', (messageSyncStats) => {
            this.setState((prev) => {
                return { ...prev, messageSyncStats: messageSyncStats, importing: true };
            });
        });
        Event.getBroker().on('messageSyncEnd', () => {
            this.setState((prev) => {
                return { ...prev, importing: false, messageSyncStats: null };
            });
        });
    }

    render(){
        const importStats = this.#computeImportStats(), { t } = this.props;
        return (
            <div className={styles.messageImportStatsViewer + ' bg-primary border-secondary'} data-show={this.state.importing}>
                <p className={styles.title + ' text-primary'}>{t('messageImportStatsViewer.title')}</p>
                <div className={styles.progressBar + ' border-secondary'}>
                    <div className={styles.progressBarValue + ' bg-secondary'} style={{ width: importStats.percentage + '%' }} />
                </div>
                <p className={styles.stats + ' text-primary'}>{importStats.label}</p>
            </div>
        );
    }
}

export default withTranslation(null, { withRef: true })(MessageImportStatsViewer);
