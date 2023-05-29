'use strict';

import styles from './MessageImportStatsViewer.scss';
import Event from '../../facades/Event';
import React from 'react';

class MessageImportStatsViewer extends React.Component {
    #computeImportStats(){
        let percentage = 0, label = '';
        if ( this.state.messageSyncStats !== null ){
            const totalProcessedMessageCount = this.state.messageSyncStats.getTotalProcessedMessageCount();
            const totalMessageCommitCount = this.state.messageSyncStats.getTotalMessageCommitCount();
            label = 'Imported ' + totalProcessedMessageCount + ' messages out of ' + totalMessageCommitCount + '...';
            percentage = ( totalProcessedMessageCount * 100 ) / totalMessageCommitCount;
        }
        return { percentage: percentage, label: label };
    }

    _handleMessageSyncProgress(messageSyncStats){
        this.setState((prev) => {
            return { ...prev, messageSyncStats: messageSyncStats, importing: true };
        });
    }

    _handleMessageSyncEnd(){
        this.setState((prev) => {
            return { ...prev, importing: false, messageSyncStats: null };
        });
    }

    constructor(props){
        super(props);

        this._handleMessageSyncProgress = this._handleMessageSyncProgress.bind(this);
        this._handleMessageSyncEnd = this._handleMessageSyncEnd.bind(this);
        this.state = { importing: false, messageSyncStats: null };
    }

    componentDidMount(){
        Event.getBroker().on('messageSyncProgress', this._handleMessageSyncProgress);
        Event.getBroker().on('messageSyncEnd', this._handleMessageSyncEnd);
    }

    render(){
        const importStats = this.#computeImportStats();
        return (
            <div className={styles.messageImportStatsViewer} data-show={this.state.importing}>
                <p className={styles.title}>Importing messages...</p>
                <div className={styles.progressBar}>
                    <div className={styles.progressBarValue} style={{ width: importStats.percentage + '%' }} />
                </div>
                <p className={styles.stats}>{importStats.label}</p>
            </div>
        );
    }
}

export default MessageImportStatsViewer;
