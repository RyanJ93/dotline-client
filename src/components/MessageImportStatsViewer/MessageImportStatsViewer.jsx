'use strict';

import styles from './MessageImportStatsViewer.scss';
import Event from '../../facades/Event';
import React from 'react';

class MessageImportStatsViewer extends React.Component {
    #computeImportStats(){
        let percentage = 0, label = '';
        if ( this.state.messageImportProcessStats !== null ){
            const totalImportedMessageCount = this.state.messageImportProcessStats.getTotalImportedMessageCount();
            const totalMessageCount = this.state.messageImportProcessStats.getTotalMessageCount();
            label = 'Imported ' + totalImportedMessageCount + ' messages out of ' + totalMessageCount + '...';
            percentage = ( totalImportedMessageCount * 100 ) / totalMessageCount;
        }
        return { percentage: percentage, label: label };
    }

    _handleMessageImportProgress(messageImportProcessStats){
        this.setState((prev) => {
            return { ...prev, messageImportProcessStats: messageImportProcessStats, importing: true };
        });
    }

    _handleMessageImportEnd(){
        this.setState((prev) => {
            return { ...prev, importing: false, messageImportProcessStats: null };
        });
    }

    constructor(props){
        super(props);

        this._handleMessageImportProgress = this._handleMessageImportProgress.bind(this);
        this._handleMessageImportEnd = this._handleMessageImportEnd.bind(this);
        this.state = { importing: false, messageImportProcessStats: null };
    }

    componentDidMount(){
        Event.getBroker().on('messageImportProgress', this._handleMessageImportProgress);
        Event.getBroker().on('messageImportEnd', this._handleMessageImportEnd);
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
